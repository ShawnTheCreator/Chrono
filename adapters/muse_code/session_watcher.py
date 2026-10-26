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

def normalize_muse_events(raw: Dict[str, Any], start_seq_id: int) -> List[Dict[str, Any]]:
    events = []
    current_seq = start_seq_id

    # Compute monotonic timestamp
    timestamp_ns = raw.get("timestamp_ns")
    if not timestamp_ns:
        created_at = raw.get("created_at")
        if created_at:
            try:
                # Approximate parse of ISO timestamp
                t_struct = time.strptime(created_at[:19], "%Y-%m-%dT%H:%M:%S")
                timestamp_ns = int(time.mktime(t_struct) * 1e9)
            except Exception:
                timestamp_ns = int(time.time_ns())
        else:
            timestamp_ns = int(time.time_ns())

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
                    "thought": thinking[:1000] # preserve first 1000 chars for summary
                }
            })
            current_seq += 1

        # Check for tool calls inside planner response
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

        # Telemetry from tokens
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
                normalized_list = normalize_muse_events(raw_event, seq_id)
                for ev in normalized_list:
                    sys.stdout.write(json.dumps(ev) + "\n")
                    sys.stdout.flush()
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
