import React, { useEffect, useRef } from 'react';
import { store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const TranscriptPanel: React.FC = () => {
  const activeEvent = store.activeEvent;
  const listRef = useRef<HTMLDivElement | null>(null);

  // Filter events up to current scrub point
  const visibleEvents = store.events.filter(
    (e) => e.timestamp_ns <= store.currentTimestampNs
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [store.currentTimestampNs]);

  const renderEventItem = (ev: any, idx: number) => {
    const isCurrent = activeEvent?.seq_id === ev.seq_id;
    let badgeColor = theme.accent.cyan;
    let title = ev.kind;
    let content = '';

    if (ev.kind === 'agent_thought') {
      badgeColor = theme.accent.violet;
      title = 'THOUGHT';
      content = ev.payload?.thought || JSON.stringify(ev.payload);
    } else if (ev.kind === 'tool_call') {
      badgeColor = theme.accent.amber;
      title = `TOOL: ${ev.payload?.tool || 'unknown'}`;
      content = ev.payload?.cmd || JSON.stringify(ev.payload?.arguments || {});
    } else if (ev.kind === 'tool_result') {
      badgeColor = ev.payload?.exit_code === 0 ? theme.accent.emerald : theme.accent.ruby;
      title = `RESULT (code ${ev.payload?.exit_code ?? 0})`;
      content = ev.payload?.output || JSON.stringify(ev.payload);
    } else if (ev.kind === 'stall_alert') {
      badgeColor = theme.accent.ruby;
      title = `STALL ALERT: ${ev.payload?.pattern || 'LOOP'}`;
      content = ev.payload?.description || 'Detected repetitive execution cycle.';
    } else if (ev.kind === 'prompt') {
      badgeColor = '#3b82f6';
      title = 'USER PROMPT';
      content = ev.payload?.text || JSON.stringify(ev.payload);
    } else {
      content = JSON.stringify(ev.payload);
    }

    return (
      <div
        key={idx}
        style={{
          marginBottom: '10px',
          padding: '8px 12px',
          borderRadius: '4px',
          background: isCurrent ? 'rgba(229, 169, 60, 0.08)' : theme.bg.base,
          borderLeft: `3px solid ${badgeColor}`,
          border: isCurrent ? `1px solid ${theme.accent.amber}` : `1px solid ${theme.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
          <span style={{ color: badgeColor, fontWeight: 600 }}>{title}</span>
          <span style={{ color: theme.text.muted }}>#{ev.seq_id}</span>
        </div>
        <div style={{ fontSize: '11px', color: theme.text.primary, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '"JetBrains Mono", monospace' }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: theme.accent.cyan, textTransform: 'uppercase' }}>
          REASONING TRANSCRIPT
        </span>
        <span style={{ fontSize: '10px', color: theme.text.muted }}>
          {visibleEvents.length} / {store.events.length} events
        </span>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {visibleEvents.map((ev, idx) => renderEventItem(ev, idx))}
      </div>
    </div>
  );
};
