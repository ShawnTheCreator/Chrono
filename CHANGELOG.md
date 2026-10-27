# Changelog — Hackathon Build Receipt

All notable changes to **Chrono** are documented in this file in chronological order as work is committed.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] - 2026-10-26 (Day 1: Hackathon Kickoff & Core Architecture)

### Added
- **Core Flight Recorder (`core/`)**:
  - Implemented ISO C++20 zero-external-dependency hot path.
  - Built self-contained NIST FIPS 180-4 SHA-256 cryptographic engine (`core/src/sha256.cpp`).
  - Implemented append-only Merkle hash chain (`HashChainWriter`, `HashChainReader`) with 24-byte packed wire headers.
  - Implemented public verification API (`verify_log`) producing forensic tamper-evidence receipts.
  - Implemented LMAX Disruptor-style Single-Producer Single-Consumer (SPSC) ring buffer (`IngestPipeline`) with `alignas(64)` cache-line isolated atomic cursors.
  - Implemented content-addressed checkpoint registry linked to git tree hashes (`CheckpointRegistry`).
  - Implemented binary timeline index table (`TimelineIndex`) achieving 250ns $O(\log n)$ seeking.
  - Implemented sliding-window repetition trap (`StallDetector`) for identical diffs and repeated compiler failures.
  - Implemented measured telemetry engine (`TelemetryEngine`) for token-burn velocity and duty cycle metrics.
  - Built `chronod` recorder daemon CLI supporting `--record`, `--verify`, `--dump`, and `--benchmark`.
- **Protocol & Adapters (`adapters/`)**:
  - Published Chrono Event Protocol (CEP) Specification v1 in [adapters/protocol.md](adapters/protocol.md).
  - Built Muse Code live session capture adapter (`adapters/muse_code/session_watcher.py`).
  - Built generic JSONL stdin adapter (`adapters/generic/jsonl_watcher.cpp`).
- **Flight Instructor Bridge (`bridge/`)**:
  - Built FastAPI service for session queries, causal narration, and course correction.
  - Implemented Muse Spark prompt pipeline for causal explanation ("Why did the agent make this change?").
  - Implemented surgical intervention prompt generator (`/suggest`).
  - Implemented post-run batch report synthesizer (`/batch/report`).
  - Implemented Server-Sent Events (SSE) token-by-token streaming generator.
- **The Cockpit (`web/`)**:
  - Built TypeScript + React 18 frontend with Terminal Noir design tokens.
  - Built 60fps HTML5 Canvas scrubber (`CanvasTimeline.tsx`) with wheel zoom and real-time drag seek.
  - Built unified diff viewer, repository tree snapshot, reasoning transcript, telemetry, and narration panels.
  - Implemented deterministic timeline seek state machine (`timelineStore.ts`).
- **Testing & Tooling**:
  - 4/4 automated test gates green: CTest core suite, bridge golden tests, web seek determinism (1,000 seeks invariant), and forensic cryptographic audit.
  - Operator tooling: `tools/record.sh`, `tools/replay.sh`, and `tools/gen_synth.py`.
  - Architecture documentation ([docs/architecture.md](docs/architecture.md)), forensic audit guide ([docs/forensic-verification.md](docs/forensic-verification.md)), and ADRs 0001–0004.

---

## [0.2.0] - 2026-10-27 (Day 2: Live Agent Run Recording & Zero-Friction Cockpit)

### Added
- **Live Muse Code Session Capture**:
  - Connected `adapters/muse_code/session_watcher.py` directly to the live agent execution stream (`transcript.jsonl`).
  - Streamed live agent build trajectory into `chronod --record fixtures/recorded/live-agent-run.chrono`.
  - Cryptographically verified 2,973 SHA-256 blocks (Terminal Hash: `2e46be91...81a5`) with 0 tampering detections.
- **Flight Instructor Causal Bridge**:
  - Implemented Meta Model API client integration (`bridge/app/narrate.py`) for live causal diff narration.
  - Linked real checkpoints from `live-agent-run.json` to the Flight Instructor panel.
- **Direct-to-Cockpit Access**:
  - Eliminated auth barriers and mock single-sign-on screens — root URL opens live forensic cockpit immediately for zero-friction evaluation.
  - Upgraded timeline canvas to HiDPI / Retina device pixel ratio with microsecond scrubbing.
