import React, { useState } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const DiffPanel: React.FC = () => {
  const state = useTimelineStore();
  const cp = state.activeCheckpoint || (state.checkpoints.length > 0 ? state.checkpoints[0] : null);
  const [customDirective, setCustomDirective] = useState('');

  if (!cp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, justifyContent: 'center', alignItems: 'center', padding: '24px', color: theme.text.muted, fontSize: '13px' }}>
        <span>No checkpoint selected. Scrub timeline to view code mutations.</span>
      </div>
    );
  }

  const patchLines = (cp.raw_patch || '').split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden', position: 'relative' }}>
      {/* Panel Header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.blue, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DIFF VIEWER
          </span>
          <span style={{ fontSize: '11px', color: theme.accent.blue, fontWeight: 600, background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${theme.border.active}` }}>
            {cp.id}
          </span>
          <span style={{ fontSize: '12px', color: theme.text.primary, fontWeight: 500 }}>
            {cp.summary}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }}>
          <span style={{ color: theme.text.secondary }}>git:{cp.git_tree_hash.slice(0, 8)}</span>
          <span style={{ color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 6px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>+{cp.additions}</span>
          <span style={{ color: '#dc2626', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '3px', border: '1px solid #fecaca' }}>-{cp.deletions}</span>
        </div>
      </div>

      {/* Files List Strip */}
      <div style={{ padding: '7px 16px', background: '#ffffff', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: theme.text.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>MUTATIONS:</span>
        {(cp.files_modified || []).map((file, i) => (
          <span key={i} style={{ fontSize: '11px', color: theme.accent.blue, background: '#eff6ff', border: `1px solid ${theme.border.active}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {file}
          </span>
        ))}
      </div>

      {/* Diff Code Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 90px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', lineHeight: '1.6', background: '#ffffff' }}>
        {patchLines.map((line, idx) => {
          let lineBg = 'transparent';
          let lineFg = '#334155';
          let borderLeft = '3px solid transparent';

          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineBg = '#f0fdf4';
            lineFg = '#15803d';
            borderLeft = '3px solid #22c55e';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineBg = '#fef2f2';
            lineFg = '#b91c1c';
            borderLeft = '3px solid #ef4444';
          } else if (line.startsWith('@@')) {
            lineBg = '#f0f9ff';
            lineFg = '#0284c7';
            borderLeft = '3px solid #38bdf8';
          } else if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
            lineFg = theme.text.muted;
          }

          return (
            <div
              key={idx}
              style={{
                background: lineBg,
                color: lineFg,
                padding: '1px 8px',
                borderLeft,
                marginBottom: '1px',
                borderRadius: '1px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {line || ' '}
            </div>
          );
        })}
      </div>

      {/* Floating Intervention Action Bar (matching Slack/Linear style prompt dock) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        background: '#ffffff',
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.blue, background: '#eff6ff', padding: '2px 6px', borderRadius: '3px' }}>
            ⚡ INTERVENTION
          </span>
          <span style={{ fontSize: '12px', color: theme.text.primary, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {state.activeIntervention || 'Inject course-correction prompt to break detected cycle...'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border.hairline}`, paddingTop: '6px' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: theme.text.muted }}>
            <span>@agent</span>
            <span>#stall-detector</span>
            <span>🔒 SHA-256 Chained</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => store.setIntervention(null)}
              style={{
                background: '#f8fafc',
                border: `1px solid ${theme.border.subtle}`,
                color: theme.text.secondary,
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Discard
            </button>
            <button
              onClick={() => {
                store.hydrateNarrationForCheckpoint(cp);
              }}
              style={{
                background: theme.accent.blue,
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 14px',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.2)'
              }}
            >
              Apply Directive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
