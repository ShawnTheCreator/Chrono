import React, { useEffect, useState } from 'react';
import { store } from '../state/timelineStore';
import { CanvasTimeline } from '../timeline/CanvasTimeline';
import { DiffPanel } from '../panels/DiffPanel';
import { TreePanel } from '../panels/TreePanel';
import { TranscriptPanel } from '../panels/TranscriptPanel';
import { TelemetryPanel } from '../panels/TelemetryPanel';
import { NarrationPanel } from '../panels/NarrationPanel';
import { sessionClient } from '../ws/sessionClient';
import { theme } from './theme';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([
    { session_id: 'live-agent-run', task_name: 'Real Live Agent Session (832 Verified Blocks)' },
    { session_id: 'chrono-feature-attempt-1', task_name: 'Chrono Scale Test (Synthetic Fixture)' },
    { session_id: 'openrepo-maintenance-run', task_name: 'OpenRepo Maintenance (Synthetic Fixture)' }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('live-agent-run');

  useEffect(() => {
    // Initial load from default committed session
    const meta = {
      session_id: 'chrono-feature-attempt-1',
      task_name: 'Implement Chrono append-only hash chain and LMAX ingest in C++20',
      model: 'muse-spark-1026',
      agent_framework: 'muse_code',
      git_branch: 'feat/hash-chain-ingest'
    };

    const cps = [
      {
        id: 'chk_01h982ka7b',
        git_tree_hash: 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391',
        event_offset: 7,
        timestamp_ns: 60000000000,
        files_modified: ['core/include/chrono/event.h'],
        additions: 45,
        deletions: 0,
        summary: 'feat(core): declare Event wire framing and EventKind enum',
        raw_patch: '--- /dev/null\n+++ b/core/include/chrono/event.h\n@@ -0,0 +1,45 @@\n+#pragma once\n+namespace chrono { enum class EventKind : uint16_t { ... }; }'
      },
      {
        id: 'chk_02m881lp9c',
        git_tree_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
        event_offset: 10,
        timestamp_ns: 130000000000,
        files_modified: ['core/src/hash_chain.cpp'],
        additions: 110,
        deletions: 4,
        summary: 'feat(core): implement SHA-256 append-only log with tamper verification',
        raw_patch: '--- a/core/src/hash_chain.cpp\n+++ b/core/src/hash_chain.cpp\n@@ -15,4 +15,22 @@\n+record.current_hash = record.compute_hash();'
      },
      {
        id: 'chk_03k990qq2d',
        git_tree_hash: '3f4e5d6c7b8a90123456789abcdef0123456789a',
        event_offset: 13,
        timestamp_ns: 240000000000,
        files_modified: ['core/include/chrono/ingest.h'],
        additions: 88,
        deletions: 12,
        summary: 'feat(core): build LMAX lockless SPSC ring buffer for burst ingest',
        raw_patch: '--- a/core/include/chrono/ingest.h\n+++ b/core/include/chrono/ingest.h\n@@ -25,5 +25,12 @@\n+alignas(64) std::atomic<size_t> head_;'
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
        raw_patch: '--- a/core/src/stall_detector.cpp\n+++ b/core/src/stall_detector.cpp\n@@ -34,6 +34,14 @@\n+alert.pattern = StallPattern::IDENTICAL_DIFF_LOOP;'
      },
      {
        id: 'chk_05p443vv1b',
        git_tree_hash: '9876543210abcdef0123456789abcdef01234567',
        event_offset: 19,
        timestamp_ns: 360000000000,
        files_modified: ['core/src/main.cpp'],
        additions: 75,
        deletions: 6,
        summary: 'feat(core): ship chronod verification daemon and green test suite',
        raw_patch: '--- a/core/src/main.cpp\n+++ b/core/src/main.cpp\n@@ -1,5 +1,15 @@\n+int cmd_verify(const std::string& path) { ... }'
      }
    ];

    const mockEvents = [
      { seq_id: 1, timestamp_ns: 0, kind: 'session_start', flags: 0, payload: { task: meta.task_name } },
      { seq_id: 2, timestamp_ns: 5000000000, kind: 'prompt', flags: 0, payload: { text: 'Build the core flight recorder for Chrono.' } },
      { seq_id: 3, timestamp_ns: 12000000000, kind: 'agent_thought', flags: 0, payload: { thought: 'I will inspect the CMake project and design the packed wire framing.' } },
      { seq_id: 4, timestamp_ns: 18000000000, kind: 'tool_call', flags: 0, payload: { tool: 'bash', cmd: 'cmake -B build -G Ninja' } },
      { seq_id: 5, timestamp_ns: 22000000000, kind: 'tool_result', flags: 0, payload: { exit_code: 0, output: 'Configuring done (0.4s)' } },
      { seq_id: 6, timestamp_ns: 45000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/include/chrono/event.h' } },
      { seq_id: 7, timestamp_ns: 60000000000, kind: 'checkpoint', flags: 1, payload: cps[0] },
      { seq_id: 8, timestamp_ns: 85000000000, kind: 'agent_thought', flags: 0, payload: { thought: 'Writing hash_chain.h and hash_chain.cpp. Computing SHA-256 over header + prev_hash + payload.' } },
      { seq_id: 9, timestamp_ns: 110000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/src/hash_chain.cpp' } },
      { seq_id: 10, timestamp_ns: 130000000000, kind: 'checkpoint', flags: 1, payload: cps[1] },
      { seq_id: 11, timestamp_ns: 170000000000, kind: 'telemetry_sample', flags: 0, payload: { total_tokens: 11600 } },
      { seq_id: 12, timestamp_ns: 210000000000, kind: 'file_diff', flags: 0, payload: { path: 'core/include/chrono/ingest.h' } },
      { seq_id: 13, timestamp_ns: 240000000000, kind: 'checkpoint', flags: 1, payload: cps[2] },
      { seq_id: 14, timestamp_ns: 280000000000, kind: 'tool_call', flags: 0, payload: { tool: 'bash', cmd: 'ctest --output-on-failure' } },
      { seq_id: 15, timestamp_ns: 285000000000, kind: 'tool_result', flags: 0, payload: { exit_code: 1, output: '1/4 Test #4: test_stall FAILED' } },
      { seq_id: 16, timestamp_ns: 290000000000, kind: 'stall_alert', flags: 2, payload: { pattern: 'IDENTICAL_DIFF_LOOP', description: 'Agent generated identical diff 3 times.' } },
      { seq_id: 17, timestamp_ns: 300000000000, kind: 'intervention', flags: 0, payload: { directive: 'Stop repeating diff. Inspect threshold_cycles_.' } },
      { seq_id: 18, timestamp_ns: 320000000000, kind: 'checkpoint', flags: 1, payload: cps[3] },
      { seq_id: 19, timestamp_ns: 360000000000, kind: 'checkpoint', flags: 1, payload: cps[4] },
      { seq_id: 20, timestamp_ns: 400000000000, kind: 'session_end', flags: 0, payload: { total_tokens: 48250 } }
    ];

    store.setSession(meta as any, mockEvents as any, cps as any);

    // Try live bridge connection if bridge is running
    sessionClient.connect(currentSessionId);
  }, [currentSessionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: theme.bg.base, color: theme.text.primary, overflow: 'hidden' }}>
      {/* Top Navbar */}
      <header style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: theme.bg.surface, borderBottom: `1px solid ${theme.border.subtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.12em', color: theme.accent.amber }}>CHRONO</span>
            <span style={{ fontSize: '10px', background: '#251b0a', color: theme.accent.amber, padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>COCKPIT</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: theme.border.hairline }} />

          {/* Session Switcher */}
          <select
            value={currentSessionId}
            onChange={(e) => setCurrentSessionId(e.target.value)}
            style={{
              background: theme.bg.elevated,
              color: theme.text.primary,
              border: `1px solid ${theme.border.hairline}`,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.session_id} — {s.task_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.accent.emerald }}>
            <span>●</span>
            <span>SHA-256 HASH CHAIN VERIFIED</span>
          </div>
          <div style={{ fontSize: '11px', color: theme.text.muted, background: theme.bg.elevated, padding: '3px 8px', borderRadius: '3px' }}>
            C++20 FLIGHT RECORDER
          </div>
        </div>
      </header>

      {/* Main Multi-Panel Cockpit */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 340px 280px', gap: '1px', background: theme.border.subtle, overflow: 'hidden' }}>
        {/* Col 1: File Tree */}
        <TreePanel />

        {/* Col 2: Diff Viewer */}
        <DiffPanel />

        {/* Col 3: Muse Spark Flight Instructor Narration */}
        <NarrationPanel />

        {/* Col 4: Reasoning Transcript & Telemetry Split */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1px', background: theme.border.subtle, overflow: 'hidden' }}>
          <TranscriptPanel />
          <TelemetryPanel />
        </div>
      </main>

      {/* Bottom 60fps Scrubber Timeline */}
      <footer style={{ borderTop: `1px solid ${theme.border.subtle}` }}>
        <CanvasTimeline />
      </footer>
    </div>
  );
};
