import React from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { theme } from '../app/theme';

export const DiffPanel: React.FC = () => {
  const store = useTimelineStore();
  const cp = store.activeCheckpoint || (store.checkpoints.length > 0 ? store.checkpoints[0] : null);

  if (!cp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, justifyContent: 'center', alignItems: 'center', padding: '24px', color: theme.text.muted, fontSize: '12px' }}>
        <span>No checkpoint selected. Scrub timeline to view code mutations.</span>
      </div>
    );
  }

  const patchLines = (cp.raw_patch || '').split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0c12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.cyan, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DIFF VIEWER
          </span>
          <span style={{ fontSize: '11px', color: theme.text.primary, fontWeight: 600, background: '#141824', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${theme.border.hairline}` }}>
            {cp.id}
          </span>
          <span style={{ fontSize: '11px', color: theme.accent.amber, fontWeight: 500 }}>
            {cp.summary}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontFamily: '"JetBrains Mono", monospace' }}>
          <span style={{ color: theme.text.muted }}>git:{cp.git_tree_hash.slice(0, 8)}</span>
          <span style={{ color: theme.accent.emerald, fontWeight: 600 }}>+{cp.additions}</span>
          <span style={{ color: theme.accent.ruby, fontWeight: 600 }}>-{cp.deletions}</span>
        </div>
      </div>

      {/* Files List Strip */}
      <div style={{ padding: '6px 16px', background: theme.bg.base, borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: theme.text.muted, textTransform: 'uppercase' }}>MUTATIONS:</span>
        {(cp.files_modified || []).map((file, i) => (
          <span key={i} style={{ fontSize: '11px', color: theme.accent.amber, background: 'rgba(229, 169, 60, 0.12)', border: '1px solid rgba(229, 169, 60, 0.25)', padding: '2px 8px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
            {file}
          </span>
        ))}
      </div>

      {/* Diff Code Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', lineHeight: '1.55', background: '#08090d' }}>
        {patchLines.map((line, idx) => {
          let lineBg = 'transparent';
          let lineFg = theme.text.primary;

          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineBg = 'rgba(52, 211, 153, 0.14)';
            lineFg = theme.accent.emerald;
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineBg = 'rgba(244, 63, 94, 0.14)';
            lineFg = theme.accent.ruby;
          } else if (line.startsWith('@@')) {
            lineBg = 'rgba(56, 189, 248, 0.1)';
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
                padding: '1px 6px',
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
