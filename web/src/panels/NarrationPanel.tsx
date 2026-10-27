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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{
        padding: '6px 14px',
        borderBottom: `1px solid ${theme.border.default}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.bg.chrome,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: theme.text.muted, letterSpacing: '0.08em' }}>
          FLIGHT INSTRUCTOR
        </span>
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
              fontWeight: 500,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: (!cp || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'analyzing...' : 'why'}
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
              fontWeight: 500,
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

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#ffffff' }}>
        {!narration ? (
          <div style={{ padding: '24px', border: `1px dashed ${theme.border.default}`, borderRadius: '6px', textAlign: 'center', color: theme.text.muted, fontSize: '12px', fontFamily: '"JetBrains Mono", monospace' }}>
            NO CAUSAL HYPOTHESIS RECORDED
          </div>
        ) : (
          <>
            {/* Causal Narration Card */}
            <div style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, borderRadius: '4px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: theme.text.muted, letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                    CAUSAL NARRATION
                  </span>
                  {narration.is_live ? (
                    <span
                      title={`Live inference via ${narration.provider || 'Meta Model API'}`}
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: '#dafbe1',
                        color: '#1a7f37',
                        border: '1px solid #b4f0c0',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      ● LIVE: {narration.model || 'muse-spark-1026'}
                    </span>
                  ) : (
                    <span
                      title="Meta Model API endpoint unconfigured or unreachable. Using calibrated offline baseline."
                      style={{
                        fontSize: '9px',
                        fontWeight: 500,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: '#fff8c5',
                        color: '#9a6700',
                        border: '1px solid #d4a72c',
                        fontFamily: '"JetBrains Mono", monospace'
                      }}
                    >
                      ○ OFFLINE FALLBACK (Meta API Unreachable)
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: '#dafbe1',
                  color: '#1a7f37',
                  border: '1px solid #b4f0c0',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {narration.verdict} (risk: {(narration.risk_score * 100).toFixed(0)}%)
                </span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: theme.text.primary, marginBottom: '6px', lineHeight: '1.4' }}>
                {narration.headline}
              </div>

              <div style={{ fontSize: '11px', color: theme.text.secondary, lineHeight: '1.5' }}>
                {narration.causal_chain}
              </div>

              {narration.hypothesis && (
                <div style={{ marginTop: '8px', padding: '6px 8px', background: '#f6f8fa', border: `1px solid ${theme.border.default}`, borderRadius: '4px', fontSize: '11px', color: theme.text.secondary, fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.45' }}>
                  <span style={{ color: theme.text.muted, fontWeight: 600 }}>hypothesis: </span>
                  {narration.hypothesis}
                </div>
              )}
            </div>

            {/* Course-Correction Directive */}
            {intervention && (
              <div style={{ background: '#ffebe9', border: '1px solid #ffd0cc', borderRadius: '4px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#cf222e', marginBottom: '4px', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                  STALL INTERVENTION DIRECTIVE
                </div>
                <div style={{ fontSize: '11px', color: '#1f2328', fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.45' }}>
                  {intervention}
                </div>
              </div>
            )}
          </>
        )}

        {/* Clean Engineering Metadata Strip */}
        <div style={{ marginTop: 'auto', padding: '10px 12px', background: '#f6f8fa', border: `1px solid ${theme.border.default}`, borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
            <span style={{ color: theme.text.muted }}>agent</span>
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>{state.metadata?.model || 'muse-spark-1026'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
            <span style={{ color: theme.text.muted }}>stall_detector</span>
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>sliding_window_hash (3 cycles)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
            <span style={{ color: theme.text.muted }}>backend_status</span>
            <span style={{ color: '#1a7f37', fontWeight: 600 }}>connected (live 8000)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
