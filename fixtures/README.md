# The Evidence Library — Test Fixtures & Live Recorded Runs

> **Disclosure Notice**: High-integrity systems distinguish strictly between synthetic test benchmarks and cryptographically verified live traces. All synthetic fixtures are explicitly marked as such.

---

## 1. Synthetic Benchmark Fixtures (`fixtures/runs/`)

These fixtures are generated deterministically by `tools/gen_synth.py` to exercise scale characteristics, test backpressure, and validate $O(\log n)$ seeking and stall detection without requiring external model API calls during automated CI:

- **`chrono-feature-attempt-1`**: Synthetic scale test simulating 5 checkpoints, 1 injected identical-diff loop, and 48,250 tokens burned. Used by Gate 4 and C++ CTest suite.
- **`openrepo-maintenance-run`**: Synthetic multi-file refactor fixture simulating git tree hashing across schema migrations.

---

## 2. Live Recorded Runs

Live traces captured directly from active coding sessions via `adapters/muse_code/session_watcher.py`. Each session is piped in real time into `chronod --record` to produce an immutable, tamper-evident SHA-256 Merkle chain.

### How to Record a Live Session

```bash
# 1. Pipe live agent session stream into chronod
python adapters/muse_code/session_watcher.py --session-file /path/to/session/transcript.jsonl | ./build/core/chronod --record recorded_run.chrono

# 2. Verify cryptographic proof of integrity
./build/core/chronod --verify recorded_run.chrono

# 3. Dump verified event sequence
./build/core/chronod --dump recorded_run.chrono > recorded_run.jsonl
```
