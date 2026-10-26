import React from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';

interface DiffRow {
  oldLine: number | null;
  newLine: number | null;
  type: 'add' | 'del' | 'context' | 'hunk';
  marker: string;
  code: string;
}

export const DiffPanel: React.FC = () => {
  const state = useTimelineStore();
  const cp = state.activeCheckpoint || (state.checkpoints.length > 0 ? state.checkpoints[0] : null);

  if (!cp) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: '24px', color: theme.text.muted, fontSize: '13px', fontFamily: '"JetBrains Mono", monospace' }}>
        <span>NO CHECKPOINT SELECTED</span>
      </div>
    );
  }

  // Parse raw_patch into GitHub-style diff rows
  const parsePatch = (patch: string): DiffRow[] => {
    const rawLines = (patch || '').split('\n');
    const rows: DiffRow[] = [];
    let oldNum = 34;
    let newNum = 34;

    for (const line of rawLines) {
      if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
        continue;
      }
      if (line.startsWith('@@')) {
        rows.push({
          oldLine: null,
          newLine: null,
          type: 'hunk',
          marker: '@@',
          code: line
        });
      } else if (line.startsWith('+')) {
        rows.push({
          oldLine: null,
          newLine: newNum++,
          type: 'add',
          marker: '+',
          code: line.slice(1)
        });
      } else if (line.startsWith('-')) {
        rows.push({
          oldLine: oldNum++,
          newLine: null,
          type: 'del',
          marker: '-',
          code: line.slice(1)
        });
      } else {
        rows.push({
          oldLine: oldNum++,
          newLine: newNum++,
          type: 'context',
          marker: ' ',
          code: line.startsWith(' ') ? line.slice(1) : line
        });
      }
    }
    return rows;
  };

  const rows = parsePatch(cp.raw_patch || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflow: 'hidden', position: 'relative' }}>
      {/* GitHub-style File Header Bar */}
      <div style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${theme.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.bg.chrome,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.text.muted, letterSpacing: '0.08em' }}>
            DIFF
          </span>
          <span style={{ fontSize: '12px', color: theme.text.primary, fontWeight: 600 }}>
            {cp.files_modified[0] || 'core/src/stall_detector.cpp'}
          </span>
          <span style={{ fontSize: '11px', color: theme.text.secondary }}>
            {cp.id}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <span style={{ color: theme.text.muted }}>git:{cp.git_tree_hash.slice(0, 8)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: theme.text.green, fontWeight: 600 }}>+{cp.additions}</span>
            <span style={{ color: theme.text.red, fontWeight: 600 }}>-{cp.deletions}</span>
            {/* GitHub diff stat squares (4 green, 1 red) */}
            <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
              <div style={{ width: '8px', height: '8px', background: '#1a7f37', borderRadius: '1px' }} />
              <div style={{ width: '8px', height: '8px', background: '#1a7f37', borderRadius: '1px' }} />
              <div style={{ width: '8px', height: '8px', background: '#1a7f37', borderRadius: '1px' }} />
              <div style={{ width: '8px', height: '8px', background: '#1a7f37', borderRadius: '1px' }} />
              <div style={{ width: '8px', height: '8px', background: '#cf222e', borderRadius: '1px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-grade Diff Table */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px', background: '#ffffff', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', lineHeight: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '42px' }} />
            <col style={{ width: '42px' }} />
            <col style={{ width: '22px' }} />
            <col style={{ width: 'auto' }} />
          </colgroup>
          <tbody>
            {rows.map((row, idx) => {
              if (row.type === 'hunk') {
                return (
                  <tr key={idx} style={{ background: '#f6f8fa', color: '#656d76', borderTop: `1px solid ${theme.border.default}`, borderBottom: `1px solid ${theme.border.default}` }}>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '2px 0', fontSize: '11px', userSelect: 'none', color: '#8c959f' }}>...</td>
                    <td style={{ textAlign: 'center', padding: '2px 0' }}></td>
                    <td style={{ padding: '2px 8px', fontSize: '12px', color: '#59636e' }}>{row.code}</td>
                  </tr>
                );
              }

              const isAdd = row.type === 'add';
              const isDel = row.type === 'del';

              const numBg = isAdd ? '#ccffd8' : (isDel ? '#ffd7d5' : '#ffffff');
              const numColor = isAdd ? '#1a7f37' : (isDel ? '#cf222e' : '#656d76');
              const codeBg = isAdd ? '#e6ffec' : (isDel ? '#ffebe9' : '#ffffff');
              const codeColor = '#1f2328';
              const markerColor = isAdd ? '#1a7f37' : (isDel ? '#cf222e' : '#656d76');

              return (
                <tr key={idx} style={{ background: codeBg }}>
                  {/* Old Line # */}
                  <td style={{
                    background: numBg,
                    color: numColor,
                    textAlign: 'right',
                    padding: '0 8px',
                    fontSize: '11px',
                    userSelect: 'none',
                    verticalAlign: 'top',
                    borderRight: `1px solid ${theme.border.subtle}`
                  }}>
                    {row.oldLine !== null ? row.oldLine : ''}
                  </td>

                  {/* New Line # */}
                  <td style={{
                    background: numBg,
                    color: numColor,
                    textAlign: 'right',
                    padding: '0 8px',
                    fontSize: '11px',
                    userSelect: 'none',
                    verticalAlign: 'top',
                    borderRight: `1px solid ${theme.border.subtle}`
                  }}>
                    {row.newLine !== null ? row.newLine : ''}
                  </td>

                  {/* Gutter Marker (+ / -) */}
                  <td style={{
                    background: codeBg,
                    color: markerColor,
                    textAlign: 'center',
                    padding: '0',
                    fontWeight: 600,
                    userSelect: 'none',
                    verticalAlign: 'top'
                  }}>
                    {row.marker}
                  </td>

                  {/* Code Content */}
                  <td style={{
                    background: codeBg,
                    color: codeColor,
                    padding: '0 8px',
                    whiteSpace: 'pre',
                    wordBreak: 'normal',
                    overflowWrap: 'normal'
                  }}>
                    {row.code || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Intervention Box (Flat, 1px border, mono label, no filled blue SaaS button) */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        background: '#ffffff',
        border: `1px solid ${theme.border.default}`,
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: theme.text.red, background: '#ffebe9', border: '1px solid #ffd0cc', padding: '1px 6px', borderRadius: '3px', letterSpacing: '0.04em' }}>
            INTERVENTION
          </span>
          <span style={{ fontSize: '12px', color: theme.text.primary, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {state.activeIntervention || 'Inspect constructor parameter threshold_cycles_ instead.'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border.subtle}`, paddingTop: '6px' }}>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: theme.text.muted }}>
            <span>target: core/src/stall_detector.cpp</span>
            <span>trigger: identical_diff_loop (3 cycles)</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => store.setIntervention(null)}
              style={{
                background: '#ffffff',
                border: `1px solid ${theme.border.default}`,
                color: theme.text.secondary,
                fontSize: '11px',
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", monospace'
              }}
            >
              discard
            </button>
            <button
              onClick={() => store.hydrateNarrationForCheckpoint(cp)}
              style={{
                background: '#ffffff',
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", monospace'
              }}
            >
              apply_directive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
