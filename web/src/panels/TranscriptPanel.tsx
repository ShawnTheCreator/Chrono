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
    let badgeColor = theme.accent.blue;
    let badgeBg = '#eff6ff';
    let borderColor = theme.border.subtle;
    let title = ev.kind;
    let content = '';

    if (ev.kind === 'agent_thought') {
      badgeColor = '#4f46e5';
      badgeBg = '#eef2ff';
      title = 'AGENT REASONING';
      content = ev.payload?.thought || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_call') {
      badgeColor = '#0369a1';
      badgeBg = '#f0f9ff';
      title = `TOOL: ${ev.payload?.tool || 'bash'}`;
      content = ev.payload?.cmd || (ev.payload?.arguments ? JSON.stringify(ev.payload.arguments) : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_result') {
      const exitCode = ev.payload?.exit_code ?? 0;
      badgeColor = exitCode === 0 ? '#15803d' : '#b91c1c';
      badgeBg = exitCode === 0 ? '#f0fdf4' : '#fef2f2';
      borderColor = exitCode === 0 ? '#bbf7d0' : '#fecaca';
      title = `OUTPUT (exit ${exitCode})`;
      content = ev.payload?.output || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'stall_alert') {
      badgeColor = '#b91c1c';
      badgeBg = '#fef2f2';
      borderColor = '#fca5a5';
      title = `⚠️ STALL ALERT: ${ev.payload?.pattern || 'LOOP_DETECTED'}`;
      content = ev.payload?.description || 'Agent generated identical diff 3 times without resolving failure.';
    } else if (ev.kind === 'intervention') {
      badgeColor = '#1d4ed8';
      badgeBg = '#eff6ff';
      borderColor = '#93c5fd';
      title = '⚡ SURGICAL DIRECTIVE';
      content = ev.payload?.directive || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'checkpoint') {
      badgeColor = '#2563eb';
      badgeBg = '#eff6ff';
      borderColor = '#bfdbfe';
      title = `CHECKPOINT: ${ev.payload?.id || 'chk'}`;
      content = ev.payload?.summary || 'Committed content-addressed tree snapshot.';
    } else if (ev.kind === 'prompt') {
      badgeColor = '#2563eb';
      badgeBg = '#eff6ff';
      title = 'USER GOAL';
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
          borderRadius: '6px',
          background: isCurrent ? '#f8fafc' : '#ffffff',
          border: isCurrent ? `1px solid ${theme.accent.blue}` : `1px solid ${borderColor}`,
          boxShadow: isCurrent ? '0 1px 3px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
          <span style={{ color: badgeColor, background: badgeBg, padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>
            {title}
          </span>
          <span style={{ color: theme.text.muted, fontFamily: 'monospace' }}>#{ev.seq_id}</span>
        </div>
        <div style={{ fontSize: '11px', color: theme.text.primary, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.45' }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.blue, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          REASONING TRANSCRIPT
        </span>
        <span style={{ fontSize: '11px', color: theme.accent.blue, background: '#eff6ff', border: `1px solid ${theme.border.active}`, padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
          {visibleEvents.length} / {store.events.length}
        </span>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', background: '#fbfcfe' }}>
        {visibleEvents.length === 0 ? (
          <div style={{ padding: '20px', color: theme.text.muted, fontSize: '12px', textAlign: 'center' }}>
            No events prior to scrub point.
          </div>
        ) : (
          visibleEvents.map((ev, idx) => renderEventItem(ev, idx))
        )}
      </div>
    </div>
  );
};
