# Contributing to Chrono

Thank you for your interest in contributing to **Chrono**. We treat this codebase with the discipline of enterprise infrastructure: all commits are cryptographically traceable, all hot-path code is zero-allocation C++20, and all PRs must pass strict automated gates.

---

## 1. Branch Naming Conventions

Branches must adhere to the pattern `<type>/<short-description>`:

- `feat/`: New user-facing or protocol capability (e.g. `feat/lmax-ring-buffer`, `feat/canvas-zoom`)
- `fix/`: Bug fix or patch (e.g. `fix/proactor-loop-windows`, `fix/diff-hasher-collision`)
- `perf/`: Dedicated latency or throughput optimization (e.g. `perf/index-binary-search`)
- `docs/`: Documentation, ADRs, or architectural specs (e.g. `docs/forensic-verification`)
- `fixture/`: Recorded session evidence (e.g. `fixture/long-maintenance-run`)

---

## 2. Commit Message Standards

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative summary>

[optional body explaining WHY this change was made and any invariant guarantees]

[optional footer with issue references]
```

### Valid Scopes
- `core`: C++ flight recorder engine (`chronod`, `hash_chain`, `ingest`, `verify`)
- `bridge`: Meta Model API service, causal narration, batch reports
- `web`: Cockpit frontend, canvas timeline scrubber, diff viewer
- `protocol`: CEP v1 specification and schemas
- `fixtures`: Evidence library and synthetic test traces

---

## 3. Mandatory Test Gates

Before opening a pull request or submitting code, every contributor must verify that all four gates pass locally:

### Gate 1: C++ Core Unit Tests
```bash
cmake -B build -G Ninja
cmake --build build
ctest --test-dir build --output-on-failure
```
*Requirement*: 100% tests pass with zero warnings under `-Wall -Wextra -Werror` / `/W4 /WX`.

### Gate 2: Bridge Unit Tests
```bash
python bridge/tests/test_narrate.py
```
*Requirement*: Golden checkpoints pass validation against Meta Model schema.

### Gate 3: Web Cockpit Determinism Test
```bash
node web/tests/seek_determinism.test.js
```
*Requirement*: 1,000 rapid seek iterations must return identical, invariant state.

### Gate 4: Cryptographic Verification Audit
```bash
./build/core/chronod --verify fixtures/runs/chrono-feature-attempt-1/session.chrono
```
*Requirement*: Verification receipt must display `[PASS] CRYPTOGRAPHICALLY VALID` with zero tampering.
