import React from 'react';
import { store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const DiffPanel: React.FC = () => {
  const cp = store.activeCheckpoint;

  if (!cp) {
    return (
      <div style={{ padding: '24px', color: theme.text.muted, fontSize: '12px' }}>
        No checkpoint selected. Scrub timeline to view code mutations.
      </div>
    );
  }

  const patchLines = (cp.raw_patch || '').split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.accent.cyan, textTransform: 'uppercase' }}>
            DIFF VIEWER
          </span>
          <span style={{ fontSize: '11px', color: theme.text.primary, fontWeight: 500 }}>
            {cp.id}
          </span>
          <span style={{ fontSize: '10px', color: theme.text.muted, fontFamily: 'monospace' }}>
            tree:{cp.git_tree_hash.slice(0, 10)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
          <span style={{ color: theme.accent.emerald }}>+{cp.additions}</span>
          <span style={{ color: theme.accent.ruby }}>-{cp.deletions}</span>
        </div>
      </div>

      {/* Files List Strip */}
      <div style={{ padding: '6px 16px', background: theme.bg.base, borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {(cp.files_modified || []).map((file, i) => (
          <span key={i} style={{ fontSize: '11px', color: theme.accent.amber, background: '#1c1b12', padding: '2px 8px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
            {file}
          </span>
        ))}
      </div>

      {/* Diff Code Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', lineHeight: '1.5' }}>
        {patchLines.map((line, idx) => {
          let lineBg = 'transparent';
          let lineFg = theme.text.primary;

          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineBg = 'rgba(52, 211, 153, 0.12)';
            lineFg = theme.accent.emerald;
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineBg = 'rgba(244, 63, 94, 0.12)';
            lineFg = theme.accent.ruby;
          } else if (line.startsWith('@@')) {
            lineBg = 'rgba(56, 189, 248, 0.08)';
            lineFg = theme.accent.cyan;
          } else if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
            lineFg = theme.text.muted;
          }

          return (
            <div
              key={idx}
              style={{
                background: lineBg,
                color: lineFg,
                padding: '1px 4px',
                borderRadius: '2px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {line || ' '}
            </div>
          );
        })}
      </div>
    </div>
  );
};
