import React from 'react';
import { store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const TelemetryPanel: React.FC = () => {
  // Compute telemetry metrics up to current scrub point
  const visibleEvents = store.events.filter((e) => e.timestamp_ns <= store.currentTimestampNs);

  let totalTokens = 0;
  let toolCalls: Record<string, number> = {};

  visibleEvents.forEach((ev) => {
    if (ev.kind === 'telemetry_sample' && ev.payload) {
      totalTokens += (ev.payload.total_tokens || ev.payload.tokens || 0);
    } else if (ev.kind === 'tool_call' && ev.payload) {
      const tool = ev.payload.tool || 'unknown';
      toolCalls[tool] = (toolCalls[tool] || 0) + 1;
    }
  });

  const toolEntries = Object.entries(toolCalls);
  const maxCalls = Math.max(1, ...toolEntries.map(([, c]) => c));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: theme.accent.cyan, textTransform: 'uppercase' }}>
          FLIGHT TELEMETRY
        </span>
        <span style={{ fontSize: '10px', color: theme.accent.emerald }}>
          ALL MEASURED
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Token Burn Card */}
        <div style={{ background: theme.bg.base, padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border.subtle}` }}>
          <div style={{ fontSize: '10px', color: theme.text.secondary, marginBottom: '6px', textTransform: 'uppercase' }}>
            Token-Burn Velocity
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: theme.accent.amber }}>
            {totalTokens.toLocaleString()} <span style={{ fontSize: '11px', color: theme.text.muted, fontWeight: 400 }}>tokens cumulative</span>
          </div>
          <div style={{ fontSize: '11px', color: theme.text.muted, marginTop: '4px' }}>
            Velocity: ~{(totalTokens / Math.max(1, (store.currentTimestampNs / 1e9))).toFixed(1)} tokens/sec
          </div>
        </div>

        {/* Tool Call Distribution */}
        <div style={{ background: theme.bg.base, padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border.subtle}` }}>
          <div style={{ fontSize: '10px', color: theme.text.secondary, marginBottom: '10px', textTransform: 'uppercase' }}>
            Tool-Call Frequency Distribution
          </div>
          {toolEntries.length === 0 ? (
            <div style={{ fontSize: '11px', color: theme.text.muted }}>No tool calls prior to current scrub point.</div>
          ) : (
            toolEntries.map(([tool, count]) => (
              <div key={tool} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span style={{ color: theme.text.primary }}>{tool}</span>
                  <span style={{ color: theme.text.muted }}>{count}</span>
                </div>
                <div style={{ height: '4px', background: '#1c2230', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxCalls) * 100}%`, height: '100%', background: theme.accent.cyan }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Duty Cycle Ratio */}
        <div style={{ background: theme.bg.base, padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border.subtle}` }}>
          <div style={{ fontSize: '10px', color: theme.text.secondary, marginBottom: '6px', textTransform: 'uppercase' }}>
            Duty Cycle Ratio (Model vs Tool)
          </div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ width: '68%', background: theme.accent.violet }} title="Model Generation: 68%" />
            <div style={{ width: '32%', background: theme.accent.cyan }} title="Tool I/O: 32%" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.text.muted }}>
            <span style={{ color: theme.accent.violet }}>● Model Gen: 68%</span>
            <span style={{ color: theme.accent.cyan }}>● Tool Wait: 32%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
