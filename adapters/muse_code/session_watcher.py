#!/usr/bin/env python3
"""
Muse Code Session Stream Adapter
Tails a live agent transcript file or stdin, normalizes entries to
Chrono Event Protocol (CEP) v1 JSONL, and emits them to stdout.
Supports standard agent formats and live IDE transcripts.
"""

import sys
import json
import time
import argparse
from typing import Dict, Any, List, Optional

def normalize_native_muse_event(raw: Dict[str, Any], start_seq_id: int, last_ts: int) -> List[Dict[str, Any]]:
    events = []
    current_seq = start_seq_id

    # Compute monotonic timestamp in nanoseconds
    rec_at = raw.get("recorded_at")
    if rec_at and rec_at > 1e12:
        raw_ts = int(rec_at * 1000)
    else:
        raw_ts = int(time.time_ns())

    timestamp_ns = max(raw_ts, last_ts + 1000)

    pt = raw.get("payload_type", "")
    p = raw.get("payload", {})

    # 1. Session start & workspace observation
    if pt in ("session.workspace_branch.observed", "runtime.command.accepted"):
        if p.get("workspace_root") or pt == "session.workspace_branch.observed":
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "session_start",
                "flags": 0,
                "payload": {
                    "workspace": p.get("workspace_root", "workspace"),
                    "branch": p.get("reference", {}).get("name", "main") if isinstance(p.get("reference"), dict) else "main",
                    "commit": p.get("commit", "")
                }
            })
            current_seq += 1

    # 2. Model configuration & provider telemetry
    elif pt == "run.model.configured":
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "telemetry_sample",
            "flags": 0,
            "payload": {
                "model": p.get("model_id") or p.get("display_label", "muse-spark-1.3"),
                "provider": p.get("provider_id", "meta")
            }
        })
        current_seq += 1

    # 3. User prompt
    elif pt == "turn.input.user":
        prompt_text = p.get("prompt") or p.get("text", "")
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "prompt",
            "flags": 0,
            "payload": {
                "text": prompt_text
            }
        })
        current_seq += 1

    # 4. Tool calls / task lifecycle
    elif pt == "task.lifecycle.proposed":
        ev = p.get("event", {})
        task_kind = ev.get("task_kind", "")
        if task_kind and ("tool" in task_kind or "skill" in task_kind or "model" in task_kind):
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "tool_call",
                "flags": 0,
                "payload": {
                    "tool": task_kind,
                    "task_id": ev.get("task_id", "")
                }
            })
            current_seq += 1

    elif pt == "task.lifecycle.side_effect_intent":
        ev = p.get("event", {})
        op = ev.get("operation", "")
        if op.startswith("tool:"):
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "tool_call",
                "flags": 0,
                "payload": {
                    "tool": op,
                    "task_id": ev.get("task_id", ""),
                    "idempotency_key": ev.get("idempotency_key", "")
                }
            })
            current_seq += 1

    # 5. Tool results / outputs
    elif pt == "task.lifecycle.output":
        ev = p.get("event", {})
        chunk = ev.get("chunk", "")
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "tool_result",
            "flags": 0,
            "payload": {
                "task_id": ev.get("task_id", ""),
                "output": chunk[:2000],
                "status": "success" if ev.get("final_result") else "streaming"
            }
        })
        current_seq += 1

    elif pt == "task.lifecycle.completed":
        ev = p.get("event", {})
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "tool_result",
            "flags": 0,
            "payload": {
                "task_id": ev.get("task_id", ""),
                "status": "completed"
            }
        })
        current_seq += 1

    # 6. Agent reasoning & output deltas
    elif pt == "run.output.delta":
        text = p.get("text", "")
        if text:
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "agent_thought",
                "flags": 0,
                "payload": {
                    "thought": text
                }
            })
            current_seq += 1

    # 7. Token telemetry samples
    elif pt == "run.usage":
        models = p.get("models", [])
        if models and isinstance(models, list):
            m0 = models[0]
            in_tok = m0.get("input_tokens", 0)
            out_tok = m0.get("output_tokens", 0)
            reas_tok = m0.get("reasoning_tokens", 0)
            cached_tok = m0.get("cached_tokens", 0)
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "telemetry_sample",
                "flags": 0,
                "payload": {
                    "prompt_tokens": in_tok,
                    "completion_tokens": out_tok,
                    "reasoning_tokens": reas_tok,
                    "cached_tokens": cached_tok,
                    "total_tokens": in_tok + out_tok,
                    "model": m0.get("model", "muse-spark-1.3")
                }
            })
            current_seq += 1

    # 8. Run terminal / checkpoint completion
    elif pt == "run.terminal.completed":
        text = p.get("text", "")
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "checkpoint",
            "flags": 0,
            "payload": {
                "summary": text[:500] if text else "Task completed",
                "status": p.get("terminal", "completed")
            }
        })
        current_seq += 1

    return events

def normalize_muse_events(raw: Dict[str, Any], start_seq_id: int, last_ts: int = 0) -> List[Dict[str, Any]]:
    # Detect native Muse Code JSONL protocol
    if "payload_type" in raw or "record_type" in raw:
        return normalize_native_muse_event(raw, start_seq_id, last_ts)

    events = []
    current_seq = start_seq_id

    # Compute monotonic timestamp
    timestamp_ns = raw.get("timestamp_ns")
    if not timestamp_ns:
        created_at = raw.get("created_at")
        if created_at:
            try:
                t_struct = time.strptime(created_at[:19], "%Y-%m-%dT%H:%M:%S")
                timestamp_ns = int(time.mktime(t_struct) * 1e9)
            except Exception:
                timestamp_ns = int(time.time_ns())
        else:
            timestamp_ns = int(time.time_ns())

    timestamp_ns = max(timestamp_ns, last_ts + 1000)

    event_type = raw.get("type", "").upper()

    # 1. User prompts / inputs
    if event_type in ("USER_INPUT", "PROMPT"):
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "prompt",
            "flags": 0,
            "payload": {
                "text": raw.get("content", raw.get("text", ""))
            }
        })
        current_seq += 1

    # 2. Agent responses / thoughts
    elif event_type in ("PLANNER_RESPONSE", "THOUGHT", "AGENT_THOUGHT", "THINKING"):
        thinking = raw.get("thinking") or raw.get("content") or ""
        if thinking:
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns,
                "kind": "agent_thought",
                "flags": 0,
                "payload": {
                    "thought": thinking[:1000]
                }
            })
            current_seq += 1

        tool_calls = raw.get("tool_calls", [])
        for tc in tool_calls:
            tool_name = tc.get("name") or tc.get("tool_name") or "tool"
            args = tc.get("args") or tc.get("parameters") or {}
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns + 1000000,
                "kind": "tool_call",
                "flags": 0,
                "payload": {
                    "tool": tool_name,
                    "arguments": args
                }
            })
            current_seq += 1

        in_tokens = raw.get("input_tokens", 0)
        out_tokens = raw.get("output_tokens", 0)
        if in_tokens or out_tokens:
            events.append({
                "seq_id": current_seq,
                "timestamp_ns": timestamp_ns + 2000000,
                "kind": "telemetry_sample",
                "flags": 0,
                "payload": {
                    "prompt_tokens": in_tokens,
                    "completion_tokens": out_tokens,
                    "total_tokens": in_tokens + out_tokens
                }
            })
            current_seq += 1

    # 3. Tool results / command outputs
    elif event_type in ("GENERIC", "TOOL_RESULT", "TOOL_RESPONSE"):
        content = raw.get("content", raw.get("output", ""))
        exit_code = raw.get("exit_code", 0)
        if "Command exited with code" in str(content):
            try:
                part = str(content).split("Command exited with code")[1].split(".")[0].strip()
                exit_code = int(part)
            except Exception:
                pass

        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "tool_result",
            "flags": 0,
            "payload": {
                "exit_code": exit_code,
                "output": str(content)[:2000]
            }
        })
        current_seq += 1

    # 4. Fallback generic thought
    else:
        events.append({
            "seq_id": current_seq,
            "timestamp_ns": timestamp_ns,
            "kind": "agent_thought",
            "flags": 0,
            "payload": raw
        })
        current_seq += 1

    return events

def main():
    parser = argparse.ArgumentParser(description="Chrono Muse Code session adapter")
    parser.add_argument("--session-file", type=str, help="Path to transcript.jsonl file to tail")
    parser.add_argument("--follow", action="store_true", help="Keep tailing file on EOF")
    parser.add_argument("--max-events", type=int, default=0, help="Max events to process (0 = all)")
    args = parser.parse_args()

    seq_id = 1
    last_ts = 0
    stream = open(args.session_file, "r", encoding="utf-8") if args.session_file else sys.stdin

    try:
        while True:
            line = stream.readline()
            if not line:
                if args.follow:
                    time.sleep(0.05)
                    continue
                else:
                    break
            line = line.strip()
            if not line:
                continue

            try:
                raw_event = json.loads(line)
                normalized_list = normalize_muse_events(raw_event, seq_id, last_ts)
                for ev in normalized_list:
                    sys.stdout.write(json.dumps(ev) + "\n")
                    sys.stdout.flush()
                    last_ts = ev.get("timestamp_ns", last_ts)
                    seq_id += 1
                    if args.max_events and seq_id > args.max_events:
                        return
            except json.JSONDecodeError:
                continue
    except KeyboardInterrupt:
        pass
    finally:
        if args.session_file and stream is not sys.stdin:
            stream.close()

if __name__ == "__main__":
    main()
