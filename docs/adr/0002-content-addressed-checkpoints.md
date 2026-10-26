# ADR 0002: Content-Addressed Checkpoints via Git Tree Hashes

- **Status**: Accepted
- **Deciders**: Chrono Core Architecture Group
- **Date**: 2026-10-28

## Context

When developers scrub backwards and forwards through an agent's execution timeline, they need to see the exact code state at any point. Storing full directory copies at every agent step would create unsustainable disk amplification ($O(K \cdot S)$ where $K$ is steps and $S$ is repo size). Storing only unified diffs requires sequential forward playback from step 0, violating our $< 16.6\text{ ms}$ seek budget.

## Decision

We use content-addressed checkpoints anchored to Git Tree Hashes (`git_tree_hash`) and log sequence offsets (`event_offset`).

Checkpoint ID calculation:
$$\text{ID} = \text{"chk\_"} + \text{SHA-256}(\text{git\_tree\_hash} \parallel \text{event\_offset})[0..16]$$

## Consequences

### Positive
- **Instant Seeking**: Checkpoints link to existing Git tree objects, enabling instantaneous state reconstruction.
- **Deduplication**: Identical code states produce identical tree hashes, eliminating storage bloat.
- **Determinism**: Seeking to the same timestamp guarantees the exact same restored workspace tree.
