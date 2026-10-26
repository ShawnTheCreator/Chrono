# Chrono Forensic Verification — End-to-End Cryptographic Audit Guide

> *"A flight recorder that cannot prove its own integrity is just another log file."*

Chrono is engineered with **zero trust** in the recording environment. Whether an agent crashes, a human operator inspects an incident, or a hackathon judge evaluates a codebase, Chrono provides independent, reproducible proof that:
1. Every recorded event occurred in the exact sequence reported.
2. No timestamps, thoughts, tool commands, or diffs were retroactively altered or deleted.
3. The final repository state is mathematically linked to the session's genesis root.

---

## 1. The Threat Model

Traditional agent observability systems store traces in SQLite, Elasticsearch, or plain JSONL files. This allows undetectable tampering:
- An operator can delete 40 failed compilation attempts to make an agent appear smarter.
- A rogue script can modify git diffs to conceal faulty security patches.
- Model generation timestamps can be faked to misrepresent token velocity.

Chrono eliminates this by enforcing an append-only **SHA-256 Merkle Hash Chain** directly inside the high-performance C++ core.

---

## 2. Mathematical Verification Invariant

Each block in a `.chrono` file is defined as:

$$\text{Block}_i = \Big\{ \text{Header}_i, \text{PrevHash}_i, \text{Payload}_i, \text{CurrentHash}_i \Big\}$$

The cryptographic invariants enforced during verification are:

1. **Genesis Anchor**:
   $$\text{PrevHash}_1 = \text{SHA-256}(\text{session\_id})$$
2. **Sequential Linkage**:
   $$\forall i > 1: \quad \text{PrevHash}_i \equiv \text{CurrentHash}_{i-1}$$
3. **Block Digest Integrity**:
   $$\forall i \ge 1: \quad \text{CurrentHash}_i \equiv \text{SHA-256}\Big(\text{Header}_i \parallel \text{PrevHash}_i \parallel \text{Payload}_i\Big)$$
4. **Sequence Monotonicity**:
   $$\forall i > 1: \quad \text{SeqID}_i = \text{SeqID}_{i-1} + 1, \quad \text{Timestamp}_i \ge \text{Timestamp}_{i-1}$$

If an adversary alters even a single bit in $\text{Payload}_k$:
- $\text{CurrentHash}_k$ will fail to match $\text{SHA-256}(\text{Header}_k \parallel \text{PrevHash}_k \parallel \text{Payload}_k)$.
- If the adversary recomputes $\text{CurrentHash}_k$, then $\text{PrevHash}_{k+1}$ in the next block will fail to match!
- To forge the log, the attacker must recompute every hash through the entire file, which alters the **Terminal Hash** pinned at checkpoint commit.

---

## 3. How to Verify Any Run in 5 Seconds

### Using the Pre-Built Daemon
Run `chronod --verify`:

```bash
./build/core/chronod --verify fixtures/runs/chrono-feature-attempt-1/session.chrono
```

### Expected Output (Valid Log)
```text
=======================================================
           CHRONO FORENSIC VERIFICATION RECEIPT        
=======================================================
STATUS:          [PASS] CRYPTOGRAPHICALLY VALID
RECORDS:         20 verified SHA-256 blocks
SEQUENCE RANGE:  #1 -> #20
DURATION:        400.00 ms
GENESIS ROOT:    0000000000000000000000000000000000000000000000000000000000000000
TERMINAL HASH:   0967865e6fd016a5cc14b9baa740f44c4b27644a30e711d7a05b24c247841daa
VERDICT:         Zero tampering detected. Log is immutable.
=======================================================
```

---

## 4. Tamper Test Demonstration

Let us simulate an intentional tampering attempt. Suppose an attacker flips a single byte in block #2 to alter an agent thought:

```bash
# Verify the automated tamper test
./build/core/test_hash_chain
```

### Audit Failure Output
```text
=======================================================
           CHRONO FORENSIC VERIFICATION RECEIPT        
=======================================================
STATUS:          [FAIL] TAMPERING DETECTED
FAILURE REASON:  Chained hash mismatch at record #1 (seq 2): prev_hash does not match predecessor
CORRUPTED INDEX: Record #1 (Seq 2)
VERDICT:         Record chain is invalid or has been altered.
=======================================================
```

The verifier immediately halts, identifies the corrupted record index, prints the sequence ID, and exits with code `1`.

---

## 5. Integrating with CI & Production Compliance

Chrono logs can be verified as a gate in CI workflows:

```yaml
- name: Verify Chrono Audit Log
  run: ./build/core/chronod --verify ./artifacts/session.chrono
```

If any log is corrupted or tampered with, CI fails with an audit error.
