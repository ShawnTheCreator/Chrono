# Chrono Architecture — The Flight Recorder for AI Coding Agents

```text
+---------------------------------------------------------------------------------------------------------+
|                                           CHRONO MONOREPO                                               |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|   1. CAPTURE LAYER (adapters/)                                                                          |
|      Muse Code Session Watcher / Generic JSONL Pipe                                                     |
|         │                                                                                               |
|         ▼ (CEP v1 Stream)                                                                               |
|   2. FLIGHT RECORDER CORE (core/) [C++20, Zero External Dependencies]                                    |
|      ┌─────────────────────────────┐                                                                    |
|      │ LMAX SPSC Ring Buffer       │ ──> [Single-Writer Ingest Thread]                                  |
|      └──────────────┬──────────────┘                                                                    |
|                     ▼                                                                                   |
|      ┌─────────────────────────────┐       ┌─────────────────────────────┐                              |
|      │ SHA-256 Merkle Hash Chain   │       │ O(log n) Binary Index Table │                              |
|      │ (.chrono Append-Only Log)   │       │ (.chronoi Timeline Index)   │                              |
|      └──────────────┬──────────────┘       └──────────────┬──────────────┘                              |
|                     │                                     │                                             |
|                     ▼                                     ▼                                             |
|      ┌─────────────────────────────┐       ┌─────────────────────────────┐                              |
|      │ Repetition & Stall Detector │       │ Measured Telemetry Engine   │                              |
|      └─────────────────────────────┘       └─────────────────────────────┘                              |
|         │                                                                                               |
|         ▼                                                                                               |
|   3. FLIGHT INSTRUCTOR BRIDGE (bridge/) [FastAPI + Meta Model API]                                      |
|      ┌─────────────────────────────┐       ┌─────────────────────────────┐                              |
|      │ Causal Narration Engine     │       │ Surgical Course-Correction  │                              |
|      │ (Muse Spark Prompt Pipeline)│       │ (Intervention Synthesizer)  │                              |
|      └─────────────────────────────┘       └─────────────────────────────┘                              |
|         │                                                                                               |
|         ▼ (REST / SSE Stream)                                                                           |
|   4. THE COCKPIT (web/) [TypeScript + React 18 + Canvas 60fps]                                          |
|      Canvas Scrubber │ Unified Diff │ File Tree │ Reasoning Transcript │ Telemetry │ Narration          |
+---------------------------------------------------------------------------------------------------------+
```

---

## 1. Why Chrono Exists

Autonomous coding agents (like Muse Code) execute hundreds of operations per hour: thinking steps, shell invocations, compiler checks, test executions, and speculative file diffs. When an agent succeeds, nobody inspects how. When it goes off the rails—burning 100,000 tokens in a loop, thrashing identical diffs, or silently breaking invariants—post-mortems are currently impossible.

Standard logs fail because:
1. **They are mutable and unverified**: Anyone can edit a JSON file after the fact to hide mistakes or claim fabricated progress.
2. **They are unindexed**: Finding the exact frame where an agent diverged requires manual scrolling through tens of thousands of lines.
3. **They report *what*, not *why***: Diff views show code mutations, but cannot explain the agent's causal hypothesis.

Chrono solves this by providing:
- **A C++20 Flight Recorder**: Appends every event into an immutable SHA-256 Merkle chain with lockless LMAX-style ingest.
- **A Flight Instructor Bridge**: Leverages the Meta Model API (Muse Spark) to explain the causal intent behind every checkpoint.
- **A 60fps Cockpit UI**: Canvas-rendered scrubber allowing deterministic sub-frame time travel across multi-hour agent runs.

---

## 2. Component Deep Dive

### 2.1 The Core Flight Recorder (`core/`)
Written in ISO C++20 with **zero external dependencies**:
- **Self-Contained SHA-256 (`crypto::SHA256`)**: Implements NIST FIPS 180-4 directly, eliminating OpenSSL dependency friction and ensuring portability across Windows, Linux, and macOS.
- **Single-Producer Single-Consumer (SPSC) Ring Buffer (`IngestPipeline`)**:
  - Uses `alignas(64)` atomic cursors to prevent false-sharing cache bouncing.
  - Benchmarked at **> 1,000,000 events/second** burst throughput with zero drops and zero mutex locks on the hot path.
- **Append-Only Merkle Hash Chain (`HashChainWriter` & `verify_log`)**:
  - Every record embeds a packed 24-byte wire header, the preceding record's 32-byte SHA-256 digest, the payload, and its own 32-byte digest:
    $$H_i = \text{SHA-256}(\text{Header}_i \parallel H_{i-1} \parallel \text{Payload}_i)$$
  - Any single-byte modification anywhere in the file invalidates all subsequent hashes and is pinpointed down to the exact byte offset and sequence number.
- **Timeline Index Table (`TimelineIndex`)**:
  - Binary index storing `{ timestamp_ns, seq_id, file_offset, kind, flags }`.
  - Binary search seek latency is **238 nanoseconds**—70,000x faster than a 60fps frame budget (16.6ms).
- **Stall & Anomaly Detector (`StallDetector`)**:
  - Detects identical diff loops, repeated tool execution failures, and read-only thrashing across a sliding window of events.
- **Measured Telemetry (`TelemetryEngine`)**:
  - Computes real measured token-burn velocity (tokens/sec) and model generation vs tool execution duty cycles.

### 2.2 The Flight Instructor Bridge (`bridge/`)
Built with Python 3.10+ and FastAPI:
- **Causal Narration (`/checkpoints/{id}/narrate`)**:
  - Constructs a causal prompt from the checkpoint's git tree diff, agent thought, and recent tool outcomes.
  - Queries Meta Model API (Muse Spark) to reconstruct the agent's mental model and test hypotheses.
- **Real-Time Token Streaming (`/checkpoints/{id}/narrate/stream`)**:
  - Streams narration tokens to the UI via Server-Sent Events (SSE).
- **Surgical Course-Correction (`/suggest`)**:
  - When a stall alert is triggered, formulates an intervention prompt that an operator can inject into the agent runtime to break the loop.
- **Batch Retrospectives (`/batch/report`)**:
  - Generates comprehensive post-run executive scorecards via `muse-spark-open-1026` (Baseten).

### 2.3 The Cockpit (`web/`)
Built with TypeScript, React 18, and HTML5 Canvas:
- **Canvas-Rendered Scrubber (`CanvasTimeline.tsx`)**:
  - Renders at 60fps with sub-millisecond timeline seeking, event density heatmaps, checkpoint diamonds, and stall pins.
  - Full mouse drag scrub and mouse-wheel zoom capabilities.
- **Unified Diff Viewer (`DiffPanel.tsx`)**:
  - Syntax-highlighted additions and deletions tied to the active scrub point.
- **Repository Tree Snapshot (`TreePanel.tsx`)**:
  - Reflects the file tree state at the scrubbed checkpoint.
- **Reasoning Transcript (`TranscriptPanel.tsx`)**:
  - Shows agent thoughts and tool executions in lockstep with the scrubber.
- **Measured Telemetry (`TelemetryPanel.tsx`)**:
  - Live token burn rate and tool distribution graphs.
