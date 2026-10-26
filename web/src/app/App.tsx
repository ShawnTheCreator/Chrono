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
    { session_id: 'chrono-feature-attempt-1', task_name: '[SYNTHETIC BENCHMARK] C++20 Hash Chain & Ingest (Loop Recovery Demo)' },
    { session_id: 'live-agent-run', task_name: '[LIVE CAPTURE] Real Agent Execution Trace (832 Verified Blocks)' },
    { session_id: 'openrepo-maintenance-run', task_name: '[SYNTHETIC BENCHMARK] OpenRepo Scale Run' }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('chrono-feature-attempt-1');

  useEffect(() => {
    sessionClient.connect(currentSessionId);
  }, [currentSessionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: theme.bg.surface, color: theme.text.primary, overflow: 'hidden' }}>
      {/* Top Navbar */}
      <header style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: theme.bg.chrome, borderBottom: `1px solid ${theme.border.default}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.12em', color: theme.text.primary }}>CHRONO</span>
            <span style={{ fontSize: '10px', background: theme.bg.base, color: theme.text.secondary, padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>COCKPIT</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: theme.border.default }} />

          {/* Session Switcher */}
          <select
            value={currentSessionId}
            onChange={(e) => setCurrentSessionId(e.target.value)}
            style={{
              background: theme.bg.surface,
              color: theme.text.primary,
              border: `1px solid ${theme.border.default}`,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.accent.green }}>
            <span>flight-recorder:active</span>
          </div>
          <div style={{ fontSize: '11px', color: theme.text.muted, background: theme.bg.base, padding: '3px 8px', borderRadius: '3px' }}>
            C++20 FLIGHT RECORDER
          </div>
        </div>
      </header>

      {/* Main Multi-Panel Cockpit */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 340px 280px', gap: '1px', background: theme.border.default, overflow: 'hidden' }}>
        {/* Col 1: File Tree */}
        <TreePanel />

        {/* Col 2: Diff Viewer */}
        <DiffPanel />

        {/* Col 3: Muse Spark Flight Instructor Narration */}
        <NarrationPanel />

        {/* Col 4: Reasoning Transcript & Telemetry Split */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1px', background: theme.border.default, overflow: 'hidden' }}>
          <TranscriptPanel />
          <TelemetryPanel />
        </div>
      </main>

      {/* Bottom 60fps Scrubber Timeline */}
      <footer style={{ borderTop: `1px solid ${theme.border.default}` }}>
        <CanvasTimeline />
      </footer>
    </div>
  );
};
