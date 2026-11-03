import React, { useState } from 'react';
import { useTimelineStore } from '../state/timelineStore';
import { sessionClient } from '../ws/sessionClient';
import { theme } from '../app/theme';

interface NarrationPanelProps {
  onCollapse?: () => void;
}

export const NarrationPanel: React.FC<NarrationPanelProps> = ({ onCollapse }) => {
  const [loading, setLoading] = useState(false);
  const state = useTimelineStore();
  const cp = state.activeCheckpoint || (state.checkpoints.length > 0 ? state.checkpoints[0] : null);
  const narration = state.activeNarration;
  const intervention = state.activeIntervention;

  const handleWhyClick = async () => {
    if (!cp) return;
    setLoading(true);
    try {
      await sessionClient.narrateCheckpoint(cp);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleSuggestClick = async () => {
    setLoading(true);
    try {
      await sessionClient.requestSuggestion(
        'IDENTICAL_DIFF_LOOP',
        cp?.files_modified?.[0] || 'core/src/stall_detector.cpp',
        3
      );
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${theme.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.bg.surface,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mascot Yellow Muse Avatar */}
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: theme.bg.mascotYellow,
            border: `1px solid ${theme.border.mascotYellow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.accent.mascotYellow,
            fontSize: '10px',
            fontWeight: 800
          }}>
            M
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.text.primary, letterSpacing: '0.04em' }}>
            FLIGHT INSTRUCTOR
          </span>
          <span style={{
            fontSize: '9px',
            padding: '1px 6px',
            borderRadius: '3px',
            background: theme.bg.pastelMint,
            color: theme.text.mint,
            border: `1px solid ${theme.border.pastelMint}`,
            fontWeight: 600
          }}>
            MUSE SPARK
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleWhyClick}
            disabled={!cp || loading}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: (!cp || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'reasoning...' : 'why'}
          </button>
          <button
            onClick={handleSuggestClick}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            suggest
          </button>
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

      {/* Main Content (True-to-White with Soft Pastel Category Accents) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px', background: theme.bg.base }}>
        {!narration ? (
          <div style={{ padding: '24px', border: `1px dashed ${theme.border.default}`, borderRadius: '6px', textAlign: 'center', color: theme.text.muted, fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', background: theme.bg.surface }}>
            NO CAUSAL HYPOTHESIS RECORDED
          </div>
        ) : (
          <>
            {/* Causal Narration Card (Clean True-to-White Message Bubble) */}
            <div style={{
              background: theme.bg.chatBubble,
              border: `1px solid ${theme.border.default}`,
              borderRadius: '8px',
              padding: '12px 14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: theme.bg.pastelPink,
                    color: theme.text.pink,
                    border: `1px solid ${theme.border.pastelPink}`,
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.04em'
                  }}>
                    CAUSAL REASONING
                  </span>
                  {narration.error ? (
                    <span
                      title={`Error: ${narration.error}`}
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: '#ffebe9',
                        color: theme.accent.stallRed,
                        border: '1px solid #ffd0cc',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      ▲ META API ERROR
                    </span>
                  ) : narration.is_live ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        title={`Live inference via ${narration.provider || 'Meta Model API'} (${narration.latency_ms ? narration.latency_ms + 'ms' : ''})`}
                        style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          background: theme.bg.pastelMint,
                          color: theme.text.mint,
                          border: `1px solid ${theme.border.pastelMint}`,
                          fontFamily: '"JetBrains Mono", monospace'
                        }}
                      >
                        ● LIVE: {narration.model || 'muse-spark-1.3'}
                      </span>
                      {narration.latency_ms && (
                        <span style={{ fontSize: '9px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
                          {narration.latency_ms}ms
                        </span>
                      )}
                    </div>
                  ) : (
                    <span
                      title="Meta Model API endpoint unconfigured. Using calibrated offline baseline."
                      style={{
                        fontSize: '9px',
                        fontWeight: 500,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: theme.bg.mascotYellow,
                        color: theme.text.yellow,
                        border: `1px solid ${theme.border.mascotYellow}`,
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      ○ OFFLINE (Meta API Unconfigured)
                    </span>
                  )}
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: narration.verdict === 'STALL_RISK' ? '#fee2e2' : theme.bg.pastelMint,
                  color: narration.verdict === 'STALL_RISK' ? theme.accent.stallRed : theme.text.mint,
                  border: `1px solid ${narration.verdict === 'STALL_RISK' ? '#fecaca' : theme.border.pastelMint}`,
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {narration.verdict} (risk: {(narration.risk_score * 100).toFixed(0)}%)
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary, marginBottom: '6px', lineHeight: '1.4' }}>
                {narration.headline}
              </div>

              <div style={{ fontSize: '12px', color: theme.text.secondary, lineHeight: '1.55' }}>
                {narration.causal_chain}
              </div>

              {narration.hypothesis && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  background: '#f8fafc',
                  border: `1px solid ${theme.border.default}`,
                  borderRadius: '5px',
                  fontSize: '11px',
                  color: theme.text.secondary,
                  fontFamily: '"JetBrains Mono", monospace',
                  lineHeight: '1.45'
                }}>
                  <span style={{ color: theme.text.muted, fontWeight: 700 }}>hypothesis: </span>
                  {narration.hypothesis}
                </div>
              )}
            </div>

            {/* Course-Correction Directive (Muse Alert Red / Soft Pink) */}
            {intervention && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '12px 14px'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: theme.accent.stallRed,
                  marginBottom: '6px',
                  letterSpacing: '0.06em',
                  fontFamily: '"JetBrains Mono", monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>▲</span>
                  <span>STALL INTERVENTION DIRECTIVE</span>
                </div>
                <div style={{ fontSize: '11px', color: '#1f2328', fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.5' }}>
                  {intervention}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
