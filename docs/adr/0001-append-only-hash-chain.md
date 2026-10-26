# ADR 0001: Append-Only Merkle Hash Chain

- **Status**: Accepted
- **Deciders**: Chrono Core Architecture Group
- **Date**: 2026-10-27

## Context

AI agent execution logs are frequently scrutinized during incident post-mortems, compliance reviews, and hackathon judging. Traditional plain JSON/JSONL logs have no cryptographic integrity guarantees: an operator or agent can retroactively rewrite past thoughts, edit timestamps, or erase failed tool attempts without leaving any trace.

## Decision

We implement an append-only binary log format where every event record is cryptographically bound to its predecessor via SHA-256.

Each record embeds:
- Packed wire header (magic, seq, timestamp, kind, flags, payload length)
- 32-byte `prev_hash`
- Variable-length payload
- 32-byte `current_hash` = $\text{SHA-256}(\text{Header} \parallel \text{prev\_hash} \parallel \text{Payload})$

## Consequences

### Positive
- **Tamper Evidence**: Any alteration to any historical byte invalidates the current record's hash and breaks the chain linkage for all subsequent records.
- **Verification Receipt**: Verification is $O(n)$ streaming over disk blocks and emits an irrefutable cryptographic audit receipt.
- **Portability**: Requires zero external dependencies (self-contained NIST FIPS 180-4 SHA-256 engine).

### Negative
- Cannot perform in-place record deletion (by design).
