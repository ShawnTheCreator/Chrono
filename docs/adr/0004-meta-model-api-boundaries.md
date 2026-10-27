# ADR 0004: Meta Model API Boundaries and Offline Determinism

- **Status**: Accepted
- **Deciders**: Chrono Core Architecture Group
- **Date**: 2026-10-27

## Context

Chrono provides intelligent causal narration ("Why did the agent make this change?") and course-correction recommendations ("How do we break this stall?"). These capabilities require reasoning models (Meta Model API / Muse Spark / Baseten `muse-spark-open-1026`). However, flight recorders MUST continue to operate with 100% determinism and reliability even when disconnected from the network, during offline CI runs, or in air-gapped demo environments.

## Decision

We enforce a strict boundary between the core recording substrate and the model intelligence layer:
1. **Core Independence**: The C++ recorder (`chronod`) NEVER calls external APIs. It records and verifies purely local cryptographic chains.
2. **Bridge Abstraction**: The Bridge (`bridge/`) handles all Meta Model API requests.
3. **Deterministic Fallback**: If `META_MODEL_API_KEY` or network connectivity is unavailable, the Bridge transparently activates a deterministic, high-accuracy structural synthesizer. This guarantees that all unit tests, golden-file assertions, and local demo scripts run reliably without external network dependencies.
4. **SSE Streaming**: Narration responses are streamed token-by-token over Server-Sent Events to maintain immediate interactive UI response.

## Consequences

### Positive
- Tests and local demos never fail due to API quotas, network timeouts, or missing secrets.
- Full capability unlocked automatically when API keys are provided.
- Clean separation between recording (C++) and reasoning (Python/Meta Model API).
