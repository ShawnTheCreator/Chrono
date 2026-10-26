import { useSyncExternalStore } from 'react';
import { Checkpoint, CEPEvent, SessionMetadata, StallAlert, Narration } from '../types';

export interface TimelineSnapshot {
  currentTimestampNs: number;
  minTimestampNs: number;
  maxTimestampNs: number;
  isPlaying: boolean;
  playbackSpeed: number;
  metadata: SessionMetadata | null;
  events: CEPEvent[];
  checkpoints: Checkpoint[];
  activeCheckpoint: Checkpoint | null;
  activeEvent: CEPEvent | null;
  stalls: StallAlert[];
  activeNarration: Narration | null;
  isNarrating: boolean;
  activeIntervention: string | null;
  version: number;
}

const DEFAULT_METADATA: SessionMetadata = {
  session_id: 'chrono-feature-attempt-1',
  task_name: 'Implement Chrono append-only hash chain and LMAX ingest in C++20',
  model: 'muse-spark-1026',
  agent_framework: 'muse_code',
  git_branch: 'feat/hash-chain-ingest'
};

const DEFAULT_CHECKPOINTS: Checkpoint[] = [
  {
    id: 'chk_01h982ka7b',
    git_tree_hash: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391',
    event_offset: 7,
    timestamp_ns: 60000000000,
    files_modified: ['core/include/chrono/event.h'],
    additions: 45,
    deletions: 0,
    summary: 'feat(core): declare Event wire framing and EventKind enum',
    raw_patch: '--- /dev/null\n+++ b/core/include/chrono/event.h\n@@ -0,0 +1,45 @@\n+#pragma once\n+#include <cstdint>\n+namespace chrono {\n+enum class EventKind : uint16_t {\n+    SESSION_START = 1,\n+    PROMPT = 2,\n+    AGENT_THOUGHT = 3,\n+    TOOL_CALL = 4,\n+    TOOL_RESULT = 5,\n+    FILE_DIFF = 6,\n+    CHECKPOINT = 7,\n+    STALL_ALERT = 8,\n+    INTERVENTION = 9\n+};\n+}'
  },
  {
    "id": "chk_02m881lp9c",
    git_tree_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    event_offset: 10,
    timestamp_ns: 130000000000,
    files_modified: ['core/include/chrono/hash_chain.h', 'core/src/hash_chain.cpp'],
    additions: 110,
    deletions: 4,
    summary: 'feat(core): implement SHA-256 append-only log with tamper verification',
    raw_patch: '--- a/core/src/hash_chain.cpp\n+++ b/core/src/hash_chain.cpp\n@@ -15,4 +15,22 @@\n ChainRecord HashChainWriter::append(EventKind kind, uint16_t flags, std::string_view payload) {\n+    ChainRecord record;\n+    record.header.seq_id = next_seq_++;\n+    record.header.kind = static_cast<uint16_t>(kind);\n+    record.prev_hash = tail_hash_;\n+    record.current_hash = record.compute_hash();\n+    tail_hash_ = record.current_hash;\n+    write_record(record, payload);\n+    return record;\n }'
  },
  {
    id: 'chk_03k990qq2d',
    git_tree_hash: '3f4e5d6c7b8a90123456789abcdef0123456789a',
    event_offset: 13,
    timestamp_ns: 240000000000,
    files_modified: ['core/include/chrono/ingest.h', 'core/src/ingest.cpp'],
    additions: 88,
    deletions: 12,
    summary: 'feat(core): build LMAX lockless SPSC ring buffer for burst ingest',
    raw_patch: '--- a/core/include/chrono/ingest.h\n+++ b/core/include/chrono/ingest.h\n@@ -25,5 +25,12 @@\n+    alignas(64) std::atomic<size_t> head_{0};\n+    alignas(64) std::atomic<size_t> tail_{0};\n+    std::vector<T> ring_;\n+    static constexpr size_t kCapacity = 65536;\n+    static constexpr size_t kMask = kCapacity - 1;'
  },
  {
    id: 'chk_04n112tt8a',
    git_tree_hash: 'c1d2e3f4a5b678901234567890abcdef12345678',
    event_offset: 18,
    timestamp_ns: 320000000000,
    files_modified: ['core/src/stall_detector.cpp'],
    additions: 64,
    deletions: 18,
    summary: 'fix(core): recover from identical diff oscillation by tuning sliding window',
    raw_patch: '--- a/core/src/stall_detector.cpp\n+++ b/core/src/stall_detector.cpp\n@@ -34,16 +34,26 @@ void StallDetector::observe_diff(const std::string& patch_content) {\n     uint64_t patch_hash = compute_diff_hash(patch_content);\n     recent_diff_hashes_.push_back(patch_hash);\n     if (recent_diff_hashes_.size() > window_size_) {\n         recent_diff_hashes_.pop_front();\n     }\n \n-    // Unbounded repetition check failed to trigger on oscillatory edits\n-    size_t count = count_occurrences(patch_hash);\n+    // Fixed: Track deterministic cycles with threshold_cycles_ sliding window\n+    size_t count = count_occurrences(patch_hash);\n+    if (count >= threshold_cycles_) {\n+        StallAlert alert;\n+        alert.pattern = StallPattern::IDENTICAL_DIFF_LOOP;\n+        alert.confidence = 0.98f;\n+        alert.culprit_file = "core/src/stall_detector.cpp";\n+        alert.cycle_count = static_cast<uint32_t>(count);\n+        alert.description = "Agent generated identical diff 3 times without resolving failure.";\n+        bus_.publish(alert);\n+    }\n }'
  },
  {
    id: 'chk_05p443vv1b',
    git_tree_hash: '9876543210abcdef0123456789abcdef01234567',
    event_offset: 19,
    timestamp_ns: 360000000000,
    files_modified: ['core/src/main.cpp', 'core/tests/test_hash_chain.cpp'],
    additions: 75,
    deletions: 6,
    summary: 'feat(core): ship chronod verification daemon and green test suite',
    raw_patch: '--- a/core/src/main.cpp\n+++ b/core/src/main.cpp\n@@ -1,5 +1,15 @@\n+int cmd_verify(const std::string& path) {\n+    auto res = chrono::verify_log(path);\n+    res.print_receipt();\n+    return res.valid ? 0 : 1;\n+}'
  }
];

const DEFAULT_EVENTS: CEPEvent[] = [
  { seq_id: 1, timestamp_ns: 0, kind: 'session_start', flags: 0, payload: { task: DEFAULT_METADATA.task_name } },
  { seq_id: 2, timestamp_ns: 5000000000, kind: 'prompt', flags: 0, payload: { text: 'Build the core flight recorder for Chrono. Packed binary framing, lock-free ring ingest, Merkle hash chain.' } },
  { seq_id: 3, timestamp_ns: 12000000000, kind: 'agent_thought', flags: 0, payload: { thought: 'I will inspect the CMake project and design the packed wire framing.' } },
  { seq_id: 4, timestamp_ns: 18000000000, kind: 'tool_call', flags: 0, payload: { tool: 'bash', cmd: 'cmake -B build -G Ninja' } },
  { seq_id: 5, timestamp_ns: 22000000000, kind: 'tool_result', flags: 0, payload: { exit_code: 0, output: 'Configuring done (0.4s)' } },
  { seq_id: 6, timestamp_ns: 45000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/include/chrono/event.h' } },
  { seq_id: 7, timestamp_ns: 60000000000, kind: 'checkpoint', flags: 1, payload: DEFAULT_CHECKPOINTS[0] },
  { seq_id: 8, timestamp_ns: 85000000000, kind: 'agent_thought', flags: 0, payload: { thought: 'Writing hash_chain.h and hash_chain.cpp. Computing SHA-256 over header + prev_hash + payload.' } },
  { seq_id: 9, timestamp_ns: 110000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/src/hash_chain.cpp' } },
  { seq_id: 10, timestamp_ns: 130000000000, kind: 'checkpoint', flags: 1, payload: DEFAULT_CHECKPOINTS[1] },
  { seq_id: 11, timestamp_ns: 170000000000, kind: 'telemetry_sample', flags: 0, payload: { prompt_tokens: 8200, completion_tokens: 3400, total_tokens: 11600 } },
  { seq_id: 12, timestamp_ns: 210000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/include/chrono/ingest.h' } },
  { seq_id: 13, timestamp_ns: 240000000000, kind: 'checkpoint', flags: 1, payload: DEFAULT_CHECKPOINTS[2] },
  { seq_id: 14, timestamp_ns: 280000000000, kind: 'tool_call', flags: 0, payload: { tool: 'bash', cmd: 'ctest --output-on-failure' } },
  { seq_id: 15, timestamp_ns: 285000000000, kind: 'tool_result', flags: 0, payload: { exit_code: 1, output: '1/4 Test #4: test_stall FAILED' } },
  { seq_id: 16, timestamp_ns: 290000000000, kind: 'stall_alert', flags: 2, payload: { pattern: 'IDENTICAL_DIFF_LOOP', cycle_count: 3, culprit: 'core/src/stall_detector.cpp', description: 'Agent generated identical diff 3 times without resolving failure.' } },
  { seq_id: 17, timestamp_ns: 300000000000, kind: 'intervention', flags: 0, payload: { directive: 'INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.' } },
  { seq_id: 18, timestamp_ns: 320000000000, kind: 'checkpoint', flags: 1, payload: DEFAULT_CHECKPOINTS[3] },
  { seq_id: 19, timestamp_ns: 360000000000, kind: 'checkpoint', flags: 1, payload: DEFAULT_CHECKPOINTS[4] },
  { seq_id: 20, timestamp_ns: 400000000000, kind: 'session_end', flags: 0, payload: { status: 'completed', total_tokens: 48250 } }
];

export class TimelineState {
  currentTimestampNs: number = 320000000000; // Parked at derail checkpoint #4 by default
  minTimestampNs: number = 0;
  maxTimestampNs: number = 400000000000;
  isPlaying: boolean = false;
  playbackSpeed: number = 1.0;

  metadata: SessionMetadata | null = DEFAULT_METADATA;
  events: CEPEvent[] = DEFAULT_EVENTS;
  checkpoints: Checkpoint[] = DEFAULT_CHECKPOINTS;
  activeCheckpoint: Checkpoint | null = DEFAULT_CHECKPOINTS[3];
  activeEvent: CEPEvent | null = DEFAULT_EVENTS[17];
  stalls: StallAlert[] = [];
  activeNarration: Narration | null = {
    headline: 'Injected cycle threshold detector to halt repeated diff ping-pong',
    causal_chain: 'After observing identical compiler errors across 3 consecutive iterations, the agent detected a deterministic loop. This checkpoint registers sliding-window diff hashes to trip circuit breakers.',
    hypothesis: 'Sliding window of 20 events with SHA-256 diff deduplication will trap oscillatory edits.',
    verdict: 'FIXED',
    risk_score: 0.12
  };
  isNarrating: boolean = false;
  activeIntervention: string | null = 'INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.';

  private listeners: Set<() => void> = new Set();
  private version: number = 0;
  private snapshot: TimelineSnapshot;

  constructor() {
    this.snapshot = this.createSnapshot();
  }

  createSnapshot(): TimelineSnapshot {
    return {
      currentTimestampNs: this.currentTimestampNs,
      minTimestampNs: this.minTimestampNs,
      maxTimestampNs: this.maxTimestampNs,
      isPlaying: this.isPlaying,
      playbackSpeed: this.playbackSpeed,
      metadata: this.metadata,
      events: this.events,
      checkpoints: this.checkpoints,
      activeCheckpoint: this.activeCheckpoint,
      activeEvent: this.activeEvent,
      stalls: this.stalls,
      activeNarration: this.activeNarration,
      isNarrating: this.isNarrating,
      activeIntervention: this.activeIntervention,
      version: this.version
    };
  }

  getSnapshot(): TimelineSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.version++;
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((l) => l());
  }

  getVersion() {
    return this.version;
  }

  setSession(meta: SessionMetadata, events: CEPEvent[], checkpoints: Checkpoint[], initialSeekTs?: number) {
    this.metadata = meta;
    this.events = events;
    this.checkpoints = checkpoints;

    if (events.length > 0) {
      this.minTimestampNs = events[0].timestamp_ns;
      this.maxTimestampNs = events[events.length - 1].timestamp_ns;

      let targetTs = initialSeekTs;
      if (targetTs === undefined) {
        const stallEv = events.find((e) => e.kind === 'stall_alert');
        if (stallEv) {
          const matchCp = checkpoints.find((cp) => cp.timestamp_ns >= stallEv.timestamp_ns)
                       || checkpoints.find((cp) => cp.id === 'chk_04n112tt8a');
          targetTs = matchCp ? matchCp.timestamp_ns : stallEv.timestamp_ns;
        } else if (checkpoints.length >= 4) {
          targetTs = checkpoints[3].timestamp_ns;
        } else if (checkpoints.length > 0) {
          targetTs = checkpoints[checkpoints.length - 1].timestamp_ns;
        } else {
          targetTs = this.minTimestampNs + (this.maxTimestampNs - this.minTimestampNs) * 0.75;
        }
      }

      this.seekToTimestamp(targetTs);
    }
    this.notify();
  }

  seekToTimestamp(ts: number) {
    this.currentTimestampNs = Math.max(this.minTimestampNs, Math.min(ts, this.maxTimestampNs));

    // Find nearest event at or before ts
    let nearestEvent: CEPEvent | null = null;
    for (const ev of this.events) {
      if (ev.timestamp_ns <= this.currentTimestampNs) {
        nearestEvent = ev;
      } else {
        break;
      }
    }
    this.activeEvent = nearestEvent || (this.events.length > 0 ? this.events[0] : null);

    // Find nearest checkpoint at or before ts
    let nearestCp: Checkpoint | null = null;
    for (const cp of this.checkpoints) {
      if (cp.timestamp_ns <= this.currentTimestampNs) {
        nearestCp = cp;
      } else {
        break;
      }
    }

    // Always guarantee active checkpoint if checkpoints exist
    this.activeCheckpoint = nearestCp || (this.checkpoints.length > 0 ? this.checkpoints[0] : null);

    if (this.activeCheckpoint) {
      this.hydrateNarrationForCheckpoint(this.activeCheckpoint);
    }

    this.notify();
  }

  hydrateNarrationForCheckpoint(cp: Checkpoint) {
    if (cp.id === 'chk_04n112tt8a' || cp.summary.includes('identical diff') || cp.summary.includes('sliding window')) {
      this.activeNarration = {
        headline: 'Injected cycle threshold detector to halt repeated diff ping-pong',
        causal_chain: 'After observing identical compiler errors across 3 consecutive iterations, the agent detected a deterministic loop. This checkpoint registers sliding-window diff hashes to trip circuit breakers.',
        hypothesis: 'Sliding window of 20 events with SHA-256 diff deduplication will trap oscillatory edits.',
        verdict: 'FIXED',
        risk_score: 0.12
      };
      this.activeIntervention = 'INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.';
    } else if (cp.id === 'chk_01h982ka7b') {
      this.activeNarration = {
        headline: 'Declared packed 24-byte wire framing to eliminate alignment discrepancy',
        causal_chain: 'The agent defined EventWireHeader with pragma pack to prevent cross-platform compiler struct padding variance.',
        hypothesis: 'Packed binary structs ensure deterministic hashing across Linux and Windows.',
        verdict: 'FIXED',
        risk_score: 0.05
      };
      this.activeIntervention = null;
    } else if (cp.id === 'chk_02m881lp9c') {
      this.activeNarration = {
        headline: 'Cryptographic chaining enforced across record headers in core/src/hash_chain.cpp',
        causal_chain: 'The agent recognized that individual event hashes were susceptible to splicing, anchoring each block with predecessor SHA-256 digest.',
        hypothesis: 'Embedding prev_hash in EventWireHeader ensures zero-copy O(1) append while enforcing tamper-evidence.',
        verdict: 'FIXED',
        risk_score: 0.08
      };
      this.activeIntervention = null;
    } else if (cp.id === 'chk_03k990qq2d') {
      this.activeNarration = {
        headline: 'Built LMAX lockless SPSC ring buffer for burst ingest',
        causal_chain: 'Cache-line isolated atomic cursors prevent cache-line bouncing during 1M events burst.',
        hypothesis: 'alignas(64) on atomic head_ and tail_ eliminates false sharing.',
        verdict: 'FIXED',
        risk_score: 0.04
      };
      this.activeIntervention = null;
    } else if (cp.id === 'chk_day1_core') {
      this.activeNarration = {
        headline: 'Append-only SHA-256 Merkle chain verified across all 832 recorded blocks',
        causal_chain: 'Zero-copy EventWireHeader verified with standalone NIST-compliant SHA-256 hash chaining.',
        hypothesis: 'Tamper verification produces immutable forensic proof of agent actions.',
        verdict: 'FIXED',
        risk_score: 0.02
      };
      this.activeIntervention = null;
    } else if (cp.id === 'chk_day1_ingest') {
      this.activeNarration = {
        headline: 'SPSC Lockless ring buffer verified under 1,000,000 event backpressure',
        causal_chain: 'Zero drops observed across 64-byte aligned ring buffer cursors during burst simulation.',
        hypothesis: 'Lock-free single-producer single-consumer ring meets sub-frame ingest budget.',
        verdict: 'FIXED',
        risk_score: 0.01
      };
      this.activeIntervention = null;
    } else if (cp.id === 'chk_day1_adapter') {
      this.activeNarration = {
        headline: 'CEP v1 real-time normalizer hooked into live stream watcher',
        causal_chain: 'SessionWatcher normalizes agent actions into 24-byte wire framing in real time.',
        hypothesis: 'Generic and Muse Code adapters provide zero-latency telemetry capture.',
        verdict: 'FIXED',
        risk_score: 0.03
      };
      this.activeIntervention = null;
    } else {
      this.activeNarration = {
        headline: `Applied targeted modifications to ${cp.files_modified[0] || 'workspace'}`,
        causal_chain: `Triggered by test validation: verified contract compliance on ${cp.files_modified.join(', ')}.`,
        hypothesis: 'Strict C++20 memory alignment eliminates cross-platform discrepancies.',
        verdict: 'FIXED',
        risk_score: 0.06
      };
      this.activeIntervention = null;
    }
  }

  seekToSequence(seq: number) {
    const target = this.events.find((e) => e.seq_id === seq);
    if (target) {
      this.seekToTimestamp(target.timestamp_ns);
    }
  }

  selectCheckpoint(cp: Checkpoint) {
    this.seekToTimestamp(cp.timestamp_ns);
    this.activeCheckpoint = cp;
    this.hydrateNarrationForCheckpoint(cp);
    this.notify();
  }

  setPlaying(playing: boolean) {
    this.isPlaying = playing;
    this.notify();
  }

  setNarration(narration: Narration | null, isNarrating: boolean = false) {
    this.activeNarration = narration;
    this.isNarrating = isNarrating;
    this.notify();
  }

  setIntervention(intervention: string | null) {
    this.activeIntervention = intervention;
    this.notify();
  }
}

export const store = new TimelineState();

// React hook for zero-latency, reactive subscription to immutable timeline snapshots
export function useTimelineStore(): TimelineSnapshot {
  return useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.getSnapshot()
  );
}