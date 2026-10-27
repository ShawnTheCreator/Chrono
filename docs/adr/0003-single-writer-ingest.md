# ADR 0003: Single-Writer Lockless Ingest Pipeline (LMAX Architecture)

- **Status**: Accepted
- **Deciders**: Chrono Core Architecture Group
- **Date**: 2026-10-26

## Context

Coding agents produce bursts of events during rapid tool executions (e.g. compiling large trees, executing hundred-test suites, parsing telemetry). If the event recording daemon acquires filesystem or mutex locks on the hot path, it will introduce latency jitter into the agent's execution, distorting tool durations and token burn velocities.

## Decision

We adopt a Single-Producer Single-Consumer (SPSC) lockless ring buffer based on the LMAX Disruptor pattern:
1. Ring buffer size is a fixed power-of-two (65,536 entries).
2. Producer cursor (`head_`) and Consumer cursor (`tail_`) are isolated onto separate cache lines using `alignas(64)` to eliminate false sharing.
3. Lockless memory orders: producer uses `memory_order_relaxed` on head and `memory_order_release` when publishing; consumer uses `memory_order_acquire`.
4. Only a single writer thread drains the queue and writes sequential append blocks to disk.

## Consequences

### Positive
- **Zero Locks**: Hot path has zero mutex acquisitions or syscalls when ring capacity is available.
- **Extreme Throughput**: Benchmarked at $> 1,000,000$ events/second burst absorption.
- **Zero Drops**: Backpressure waits or yields gracefully without dropping events.
