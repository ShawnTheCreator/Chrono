# Chrono Event Protocol (CEP) — Specification v1.0

The **Chrono Event Protocol (CEP)** defines the standard event wire format, ordering guarantees, and cryptographic integrity envelopes for recording AI coding agent executions in Chrono.

---

## 1. Design Principles

1. **Monotonic Total Ordering**: Every event has a strictly increasing 64-bit sequence identifier (`seq_id`) and nanosecond monotonic timestamp (`timestamp_ns`).
2. **Cryptographic Linkage**: Records are linked in an append-only SHA-256 Merkle chain. Modifying any prior byte invalidates all downstream verification hashes.
3. **Zero-Overhead Hot Path**: Serialization uses packed binary framing (`CHRO` magic) with zero memory allocations on the ingest loop.
4. **Source Agnostic**: Whether capturing Muse Code, Claude Code, Aider, OpenHands, or custom LLM runners, the protocol unifies all actions into normalized CEP events.

---

## 2. Event Kinds

| Kind ID | Name | Description |
|---|---|---|
| `0x0001` | `session_start` | Initialization event: task description, model, repo branch, genesis hash |
| `0x0002` | `session_end` | Finalization event: exit status, total tokens, terminal hash |
| `0x000A` | `prompt` | User or automated instruction delivered to the agent |
| `0x000B` | `agent_thought` | Internal chain-of-thought or reasoning stream emitted by the model |
| `0x0014` | `tool_call` | Tool invocation dispatch (e.g. `bash`, `edit_file`, `view_file`) |
| `0x0015` | `tool_result` | Result returned from tool execution (exit code, stdout, stderr) |
| `0x001E` | `file_diff` | Unified diff representation of workspace code mutations |
| `0x0028` | `checkpoint` | Content-addressed git tree snapshot at this timeline offset |
| `0x0032` | `terminal_cmd` | Direct terminal command execution |
| `0x003C` | `stall_alert` | Detected execution loop, repetition anomaly, or thrashing pattern |
| `0x0046` | `telemetry_sample`| Measured token burn velocity, tool frequency, or duty cycle |
| `0x0050` | `intervention` | Human or Meta-model corrective directive injected into runtime |

---

## 3. Wire Binary Framing

Each record in a `.chrono` log stream adheres to the packed byte format:

```text
+--------------------------------------------------------------+
| Magic (4B: 'CHRO' = 0x4F524843)                              |
+--------------------------------------------------------------+
| Total Record Length (uint32_t, little-endian)                |
+--------------------------------------------------------------+
| Sequence ID (uint64_t, monotonic 1, 2, ...)                  |
+--------------------------------------------------------------+
| Timestamp (uint64_t nanoseconds monotonic)                   |
+--------------------------------------------------------------+
| Event Kind (uint16_t)                                        |
+--------------------------------------------------------------+
| Flags (uint16_t: 0x01 = Checkpoint, 0x02 = Stall Alert)     |
+--------------------------------------------------------------+
| Payload Length (uint32_t N)                                  |
+--------------------------------------------------------------+
| Previous Record Hash (32 bytes SHA-256)                      |
+--------------------------------------------------------------+
| Payload Buffer (N bytes, UTF-8 JSON or binary)               |
+--------------------------------------------------------------+
| Current Record Hash (32 bytes SHA-256)                       |
+--------------------------------------------------------------+
```

### Hash Computation Contract
$$H_i = \text{SHA-256}\Big(\text{Header}_i \parallel H_{i-1} \parallel \text{Payload}_i\Big)$$
where $H_0$ is the Session Genesis Hash (derived from $\text{SHA-256}(\text{session\_id})$).

---

## 4. Checkpoint Invariant

A `checkpoint` event guarantees that:
1. All prior `file_diff` events up to `event_offset` produce the exact `git_tree_hash`.
2. Seeking to `seq_id` allows instant restoration of the agent's full workspace state.

---

## 5. Streaming & Ingest Semantics

- **Single-Writer Constraint**: Exactly one process (`chronod`) appends to the log file.
- **Concurrent Readers**: Readers use file length queries without file locking.
- **Backpressure**: When downstream storage latency spikes, the SPSC ring buffer absorbs bursts up to 65,536 events without dropping or blocking the agent process.
