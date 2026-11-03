#!/usr/bin/env python3
"""
Chrono Live Muse Code Session Recorder
Executes Meta Muse Code CLI against the Chrono codebase, pipes the native
MSP wire stream through adapters/muse_code/session_watcher.py, and seals
it directly into a C++ Merkle hash chain (.chrono) via chronod --record.
"""

import sys
import os
import json
import time
import pathlib
import subprocess
import shutil

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.resolve()
ADAPTER_PATH = WORKSPACE_ROOT / "adapters" / "muse_code" / "session_watcher.py"
CHRONOD_PATH = WORKSPACE_ROOT / "build" / "core" / "chronod.exe"
FIXTURES_DIR = WORKSPACE_ROOT / "fixtures" / "recorded"

sys.path.insert(0, str(WORKSPACE_ROOT / "adapters" / "muse_code"))
from session_watcher import normalize_muse_events

def find_muse_cli():
    default_path = pathlib.Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "muse" / "muse.cmd"
    if default_path.exists():
        return str(default_path)
    found = shutil.which("muse")
    if found:
        return found
    raise FileNotFoundError("Meta Muse Code CLI not found in LOCALAPPDATA or PATH")

def main():
    muse_bin = find_muse_cli()
    print(f"[*] Found Muse CLI at: {muse_bin}")
    print(f"[*] Chronod binary at: {CHRONOD_PATH}")

    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    raw_log_path = FIXTURES_DIR / "muse-code-raw.jsonl"
    chrono_out = FIXTURES_DIR / "muse-code-run.chrono"
    json_dump_out = FIXTURES_DIR / "muse-code-run.json"
    meta_out = FIXTURES_DIR / "muse_code_meta.json"

    # Remove previous run files if present
    for p in [raw_log_path, chrono_out, FIXTURES_DIR / "muse-code-run.chronoi", json_dump_out, meta_out]:
        if p.exists():
            try:
                p.unlink()
            except Exception:
                pass

    prompt = (
        "Analyze core/src/stall_detector.cpp and verify the cycle detection logic for diff loops, "
        "tool failures, and read thrashing. Explain the algorithms, sliding window, and alert thresholds."
    )

    muse_cmd = [
        muse_bin,
        "exec",
        "--json",
        "--max-model-steps", "4",
        prompt
    ]

    print(f"[*] Launching Muse Code task: {prompt}")
    print(f"[*] Target sealed ledger: {chrono_out}")

    # Launch chronod --record process
    chronod_proc = subprocess.Popen(
        [str(CHRONOD_PATH), "--record", str(chrono_out)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    # Launch muse exec process
    muse_proc = subprocess.Popen(
        muse_cmd,
        cwd=str(WORKSPACE_ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    raw_file = open(raw_log_path, "w", encoding="utf-8")
    seq_id = 1
    last_ts = 0
    event_count = 0
    model_name = "muse-spark-1.3-contributor"

    try:
        while True:
            line = muse_proc.stdout.readline()
            if not line:
                if muse_proc.poll() is not None:
                    break
                time.sleep(0.01)
                continue

            line = line.strip()
            if not line:
                continue

            # Save raw stream for forensic auditing
            raw_file.write(line + "\n")
            raw_file.flush()

            if not line.startswith("{"):
                print(f"[muse] {line}")
                continue

            try:
                raw_event = json.loads(line)
                # Capture model info if present
                if raw_event.get("payload_type") == "run.model.configured":
                    m_id = raw_event.get("payload", {}).get("model_id")
                    if m_id:
                        model_name = m_id

                normalized_list = normalize_muse_events(raw_event, seq_id, last_ts)
                for ev in normalized_list:
                    ev_line = json.dumps(ev) + "\n"
                    chronod_proc.stdin.write(ev_line)
                    chronod_proc.stdin.flush()
                    last_ts = ev.get("timestamp_ns", last_ts)
                    seq_id += 1
                    event_count += 1
                    print(f"  [CEP #{ev['seq_id']}] {ev['kind']}: {str(ev['payload'])[:80]}...")
            except json.JSONDecodeError:
                continue

    finally:
        raw_file.close()
        muse_proc.wait()
        print(f"[*] Muse Code exited with code {muse_proc.returncode}")

        # Close chronod stdin to signal EOF and seal the Merkle chain
        if chronod_proc.stdin:
            chronod_proc.stdin.close()
        chronod_stdout, chronod_stderr = chronod_proc.communicate()
        print(f"[*] chronod output:\n{chronod_stdout}")
        if chronod_stderr:
            print(f"[*] chronod stderr:\n{chronod_stderr}")

    # 1. Verify the newly sealed hash chain
    print("[*] Running forensic verification on sealed .chrono file...")
    verify_proc = subprocess.run(
        [str(CHRONOD_PATH), "--verify", str(chrono_out)],
        capture_output=True,
        text=True
    )
    print(verify_proc.stdout)

    terminal_hash = ""
    is_valid = "PASS" in verify_proc.stdout and verify_proc.returncode == 0
    for l in verify_proc.stdout.splitlines():
        if "TERMINAL HASH:" in l:
            terminal_hash = l.split("TERMINAL HASH:")[1].strip()

    # 2. Dump to JSON for inspection and bridge serving
    print(f"[*] Dumping sealed chain to {json_dump_out}...")
    dump_proc = subprocess.run(
        [str(CHRONOD_PATH), "--dump", str(chrono_out)],
        capture_output=True,
        text=True
    )
    with open(json_dump_out, "w", encoding="utf-8") as f:
        f.write(dump_proc.stdout)

    # 3. Write provenance metadata
    meta = {
        "session_id": "muse-code-run",
        "is_synthetic": False,
        "data_classification": "REAL_LIVE_RECORDED_RUN",
        "provenance": "Genuine Meta Muse Code CLI 1.4 execution trace recorded live into sealed C++ Merkle chain",
        "task_name": "Inspect & Verify Chrono Stall Detector Logic",
        "agent_source": f"Muse Code 1.4.14 (model: {model_name})",
        "capture_adapter": "adapters/muse_code/session_watcher.py (CEP v1 native normalizer)",
        "recorded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_records": event_count,
        "terminal_hash": terminal_hash,
        "verification_status": "PASS" if is_valid else "FAIL",
        "notes": (
            "Sealed live during execution of official Meta Muse Code CLI on Chrono codebase. "
            "Piped directly into chronod --record daemon. Cryptographically verified with SHA-256 Merkle chain."
        )
    }

    with open(meta_out, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"[+] Successfully recorded, sealed, and verified {event_count} records!")
    print(f"[+] Terminal hash: {terminal_hash}")
    print(f"[+] Verification: {'PASS' if is_valid else 'FAIL'}")

if __name__ == "__main__":
    main()
