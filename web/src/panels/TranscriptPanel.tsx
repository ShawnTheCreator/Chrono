import React, { useEffect, useRef } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';
import { AlertTriangleIcon, ZapIcon, GitCommitIcon } from '../components/icons';

interface TranscriptPanelProps {
  onCollapse?: () => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ onCollapse }) => {
  const storeState = useTimelineStore();
  const listRef = useRef<HTMLDivElement | null>(null);

  // Filter events up to current scrub point
  const visibleEvents = storeState.events.filter(
    (e) => e.timestamp_ns <= storeState.currentTimestampNs
  );

  const activeEvent = storeState.activeEvent || (visibleEvents.length > 0 ? visibleEvents[visibleEvents.length - 1] : null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [storeState.currentTimestampNs, visibleEvents.length]);

  const renderEventItem = (ev: any, idx: number) => {
    const isCurrent = activeEvent?.seq_id === ev.seq_id;
    let badgeColor = theme.text.primary;
    let badgeBg = theme.bg.base;
    let borderColor = theme.border.default;
    let cardBg = '#ffffff';
    let title: React.ReactNode = ev.kind;
    let content = '';

    if (ev.kind === 'agent_thought') {
      badgeColor = theme.text.secondary;
      badgeBg = theme.bg.base;
      title = 'AGENT REASONING';
      content = ev.payload?.thought || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_call') {
      badgeColor = theme.text.primary;
      badgeBg = theme.bg.base;
      title = `TOOL: ${ev.payload?.tool || 'bash'}`;
      content = ev.payload?.cmd || (ev.payload?.arguments ? JSON.stringify(ev.payload.arguments) : JSON.stringify(ev.payload));
    } else if (ev.kind === 'tool_result') {
      const exitCode = ev.payload?.exit_code ?? 0;
      badgeColor = exitCode === 0 ? theme.accent.green : theme.accent.red;
      badgeBg = exitCode === 0 ? theme.bg.diffAdd : theme.bg.diffDel;
      borderColor = exitCode === 0 ? theme.border.diffAdd : theme.border.diffDel;
      title = `OUTPUT (exit ${exitCode})`;
      content = ev.payload?.output || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'stall_alert') {
      badgeColor = theme.accent.red;
      badgeBg = theme.bg.diffDel;
      borderColor = theme.border.diffDel;
      cardBg = '#fffcfc';
      title = (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangleIcon size={12} color={theme.accent.red} />
          <span>STALL: {ev.payload?.pattern || 'LOOP_DETECTED'}</span>
        </span>
      );
      content = ev.payload?.description || 'Agent generated identical diff 3 times without resolving test failure.';
    } else if (ev.kind === 'intervention') {
      badgeColor = theme.accent.green;
      badgeBg = theme.bg.diffAdd;
      borderColor = theme.border.diffAdd;
      title = (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ZapIcon size={12} color={theme.accent.green} />
          <span>DIRECTIVE APPLIED</span>
        </span>
      );
      content = ev.payload?.directive || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else if (ev.kind === 'checkpoint') {
      badgeColor = theme.text.primary;
      badgeBg = theme.bg.base;
      borderColor = theme.border.default;
      title = (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <GitCommitIcon size={12} color={theme.accent.green} />
          <span>CHECKPOINT: {ev.payload?.id || 'chk'}</span>
        </span>
      );
      content = ev.payload?.summary || 'Committed content-addressed tree snapshot.';
    } else if (ev.kind === 'prompt') {
      badgeColor = theme.text.primary;
      badgeBg = theme.bg.base;
      title = 'GOAL SPECIFICATION';
      content = ev.payload?.text || (typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload));
    } else {
      content = typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload);
    }

    return (
      <div
        key={idx}
        onClick={() => store.seekToTimestamp(ev.timestamp_ns)}
        title="Click to seek timeline to this event"
        style={{
          marginBottom: '8px',
          padding: '8px 12px',
          borderRadius: '4px',
          background: isCurrent ? '#f6f8fa' : cardBg,
          border: `1px solid ${isCurrent ? theme.accent.green : borderColor}`,
          borderLeft: isCurrent ? `3px solid ${theme.accent.green}` : `1px solid ${borderColor}`,
          boxShadow: '0 1px 2px rgba(27,31,36,0.04)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px' }}>
          <span style={{
            color: badgeColor,
            background: badgeBg,
            border: `1px solid ${borderColor}`,
            padding: '1px 6px',
            borderRadius: '3px',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 600
          }}>
            {title}
          </span>
          <span style={{ color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>#{ev.seq_id}</span>
        </div>
        <div style={{
          fontSize: '11px',
          color: theme.text.primary,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: '"JetBrains Mono", monospace',
          lineHeight: '1.45'
        }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      <div style={{
        padding: '6px 14px',
        borderBottom: `1px solid ${theme.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.bg.chrome
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: theme.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          REASONING TRANSCRIPT
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '11px',
            color: theme.text.primary,
            background: theme.bg.surface,
            border: `1px solid ${theme.border.default}`,
            padding: '1px 7px',
            borderRadius: '4px',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 500
          }}>
            {visibleEvents.length} / {storeState.events.length}
          </span>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.text.muted,
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 4px',
                lineHeight: 1
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', background: theme.bg.surface }}>
        {visibleEvents.length === 0 ? (
          <div style={{ padding: '24px', color: theme.text.muted, fontSize: '11px', textAlign: 'center', fontFamily: '"JetBrains Mono", monospace' }}>
            No events prior to scrub point.
          </div>
        ) : (
          visibleEvents.map((ev, idx) => renderEventItem(ev, idx))
        )}
      </div>
    </div>
  );
};
