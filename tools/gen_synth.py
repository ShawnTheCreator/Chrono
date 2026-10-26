#!/usr/bin/env python3
"""
Chrono Synthetic Event Generator (gen_synth.py)
Generates scale test traces and fixture streams clearly labeled SYNTHETIC.
"""

import sys
import json
import argparse
import random

def generate_session(num_events: int = 100, inject_stall: bool = True):
    events = []
    ts = 1000000000 # 1s

    # Session start
    events.append({
        "seq_id": 1,
        "timestamp_ns": ts,
        "kind": "session_start",
        "flags": 0,
        "payload": {
            "session_id": "ses_synth_run",
            "task_name": "[SYNTHETIC] Stress Test Scale Run",
            "model": "muse-spark-1026",
            "agent_framework": "muse_code"
        }
    })

    tools = ["bash", "read_file", "edit_file", "git_status", "run_test"]
    prompt_tokens = 0
    completion_tokens = 0

    for seq in range(2, num_events):
        ts += random.randint(50000000, 500000000) # 50ms to 500ms
        r = random.random()

        if r < 0.25:
            # Agent thought
            events.append({
                "seq_id": seq,
                "timestamp_ns": ts,
                "kind": "agent_thought",
                "flags": 0,
                "payload": {
                    "thought": f"[SYNTHETIC] Evaluating step {seq}: analyzing AST node differences."
                }
            })
        elif r < 0.55:
            # Tool call
            tool = random.choice(tools)
            events.append({
                "seq_id": seq,
                "timestamp_ns": ts,
                "kind": "tool_call",
                "flags": 0,
                "payload": {
                    "tool": tool,
                    "arguments": {"cmd": f"run-step --id {seq}"}
                }
            })
        elif r < 0.70:
            # Tool result
            events.append({
                "seq_id": seq,
                "timestamp_ns": ts,
                "kind": "tool_result",
                "flags": 0,
                "payload": {
                    "exit_code": 0,
                    "output": f"[SYNTHETIC] Step {seq} executed successfully."
                }
            })
        elif r < 0.85:
            # Telemetry sample
            pt = random.randint(150, 450)
            ct = random.randint(80, 250)
            prompt_tokens += pt
            completion_tokens += ct
            events.append({
                "seq_id": seq,
                "timestamp_ns": ts,
                "kind": "telemetry_sample",
                "flags": 0,
                "payload": {
                    "prompt_tokens": pt,
                    "completion_tokens": ct,
                    "total_tokens": pt + ct
                }
            })
        else:
            # Checkpoint
            events.append({
                "seq_id": seq,
                "timestamp_ns": ts,
                "kind": "checkpoint",
                "flags": 1,
                "payload": {
                    "id": f"chk_synth_{seq}",
                    "git_tree_hash": f"tree_{seq:016x}",
                    "event_offset": seq,
                    "files_modified": [f"src/module_{seq % 5}.cpp"],
                    "additions": random.randint(10, 50),
                    "deletions": random.randint(0, 15),
                    "summary": f"[SYNTHETIC] Checkpoint committed at step {seq}"
                }
            })

    # End
    events.append({
        "seq_id": num_events,
        "timestamp_ns": ts + 1000000000,
        "kind": "session_end",
        "flags": 0,
        "payload": {
            "status": "completed",
            "total_tokens": prompt_tokens + completion_tokens
        }
    })

    return events

def main():
    parser = argparse.ArgumentParser(description="Chrono synthetic event generator")
    parser.add_argument("--count", type=int, default=100, help="Number of events to generate")
    parser.add_argument("--stall", action="store_true", help="Inject loop stall pattern")
    args = parser.parse_args()

    events = generate_session(args.count, args.stall)
    for ev in events:
        sys.stdout.write(json.dumps(ev) + "\n")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
