import React, { useEffect, useRef } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { theme } from '../app/theme';

export const TranscriptPanel: React.FC = () => {
  const store = useTimelineStore();
  const listRef = useRef<HTMLDivElement | null>(null);

  // Filter events up to current scrub point
  const visibleEvents = store.events.filter(
    (e) => e.timestamp_ns <= store.currentTimestampNs
  );

  const activeEvent = store.activeEvent || (visibleEvents.length > 0 ? visibleEvents[visibleEvents.length - 1] : null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [store.currentTimestampNs, visibleEvents.length]);

  const renderEventItem = (ev: any, idx: number) => {
    const isCurrent = activeEvent?.seq_id === ev.seq_id;
    let badgeColor = theme.accent.cyan;
    let title = ev.kind;
    let content = '';

    if (ev.kind === 'agent_thought') {
      badgeColor = theme.accent.violet;
      title = 'AGENT THOUGHT';
      content = ev.payload?.thought || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_call') {
      badgeColor = theme.accent.amber;
      title = `TOOL: ${ev.payload?.tool || 'shell'}`;
      content = ev.payload?.cmd || (ev.payload?.arguments ? JSON.stringify(ev.payload.arguments) : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_result') {
      const exitCode = ev.payload?.exit_code ?? 0;
      badgeColor = exitCode === 0 ? theme.accent.emerald : theme.accent.ruby;
      title = `TOOL RESULT (exit ${exitCode})`;
      content = ev.payload?.output || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'stall_alert') {
      badgeColor = theme.accent.ruby;
      title = `⚠️ STALL ALERT: ${ev.payload?.pattern || 'LOOP_DETECTED'}`;
      content = ev.payload?.description || 'Agent generated identical diff 3 times without resolving failure.';
    } else if (ev.kind === 'intervention') {
      badgeColor = '#f43f5e';
      title = '⚡ SURGICAL INTERVENTION';
      content = ev.payload?.directive || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'checkpoint') {
      badgeColor = theme.accent.cyan;
      title = `CHECKPOINT COMMIT: ${ev.payload?.id || 'chk'}`;
      content = ev.payload?.summary || 'Committed content-addressed tree snapshot.';
    } else if (ev.kind === 'prompt') {
      badgeColor = '#3b82f6';
      title = 'USER PROMPT';
      content = ev.payload?.text || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else {
      content = typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload);
    }

    return (
      <div
        key={idx}
        style={{
          marginBottom: '8px',
          padding: '8px 12px',
          borderRadius: '4px',
          background: isCurrent ? 'rgba(229, 169, 60, 0.1)' : '#0b0d13',
          borderLeft: `3px solid ${badgeColor}`,
          border: isCurrent ? `1px solid ${theme.accent.amber}` : `1px solid ${theme.border.subtle}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
          <span style={{ color: badgeColor, fontWeight: 700 }}>{title}</span>
          <span style={{ color: theme.text.muted, fontFamily: 'monospace' }}>#{ev.seq_id}</span>
        </div>
        <div style={{ fontSize: '11px', color: theme.text.primary, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.45' }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0c12' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.cyan, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          REASONING TRANSCRIPT
        </span>
        <span style={{ fontSize: '10px', color: theme.accent.amber, fontWeight: 600 }}>
          {visibleEvents.length} / {store.events.length} events
        </span>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', background: '#07080c' }}>
        {visibleEvents.length === 0 ? (
          <div style={{ padding: '20px', color: theme.text.muted, fontSize: '11px', textAlign: 'center' }}>
            No events prior to scrub point.
          </div>
        ) : (
          visibleEvents.map((ev, idx) => renderEventItem(ev, idx))
        )}
      </div>
    </div>
  );
};
