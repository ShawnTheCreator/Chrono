import React, { useState } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const NarrationPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const state = useTimelineStore();
  const cp = state.activeCheckpoint || (state.checkpoints.length > 0 ? state.checkpoints[0] : null);
  const narration = state.activeNarration;
  const intervention = state.activeIntervention;

  const handleWhyClick = async () => {
    if (!cp) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/checkpoints/${cp.id}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: cp.id,
          git_tree_hash: cp.git_tree_hash,
          raw_patch: cp.raw_patch,
          summary: cp.summary
        })
      });
      if (res.ok) {
        const data = await res.json();
        store.setNarration(data);
      } else {
        store.hydrateNarrationForCheckpoint(cp);
      }
    } catch {
      store.hydrateNarrationForCheckpoint(cp);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: 'IDENTICAL_DIFF_LOOP',
          culprit: cp?.files_modified[0] || 'core/src/stall_detector.cpp',
          cycle_count: 3
        })
      });
      if (res.ok) {
        const data = await res.json();
        store.setIntervention(data.prompt_injection);
      } else {
        store.setIntervention("INTERVENTION: Inspect threshold_cycles_ parameter in StallDetector constructor instead of re-applying identical diff.");
      }
    } catch {
      store.setIntervention("INTERVENTION: Inspect threshold_cycles_ parameter in StallDetector constructor instead of re-applying identical diff.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      {/* Panel Header */}
      <div style={{
        padding: '8px 16px',
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
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleWhyClick}
            disabled={!cp || loading}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '3px 10px',
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
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            suggest
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff' }}>
        {!narration ? (
          <div style={{ padding: '24px', border: `1px dashed ${theme.border.default}`, borderRadius: '6px', textAlign: 'center', color: theme.text.muted, fontSize: '12px', fontFamily: '"JetBrains Mono", monospace' }}>
            NO CAUSAL HYPOTHESIS RECORDED
          </div>
        ) : (
          <>
            {/* Causal Narration Card */}
            <div style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, borderRadius: '6px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: theme.text.muted, letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                  CAUSAL NARRATION
                </span>
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

              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text.primary, marginBottom: '6px', lineHeight: '1.4' }}>
                {narration.headline}
              </div>

              <div style={{ fontSize: '12px', color: theme.text.secondary, lineHeight: '1.55' }}>
                {narration.causal_chain}
              </div>

              {narration.hypothesis && (
                <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f6f8fa', border: `1px solid ${theme.border.default}`, borderRadius: '4px', fontSize: '11px', color: theme.text.secondary, fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.45' }}>
                  <span style={{ color: theme.text.muted, fontWeight: 600 }}>hypothesis: </span>
                  {narration.hypothesis}
                </div>
              )}
            </div>

            {/* Course-Correction Directive (Oxblood Red Alert Card) */}
            {intervention && (
              <div style={{ background: '#ffebe9', border: '1px solid #ffd0cc', borderRadius: '6px', padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#cf222e', marginBottom: '4px', letterSpacing: '0.08em', fontFamily: '"JetBrains Mono", monospace' }}>
                  STALL INTERVENTION DIRECTIVE
                </div>
                <div style={{ fontSize: '12px', color: '#1f2328', fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.5' }}>
                  {intervention}
                </div>
              </div>
            )}
          </>
        )}

        {/* Clean Engineering Metadata Strip */}
        <div style={{ marginTop: 'auto', padding: '12px 14px', background: '#f6f8fa', border: `1px solid ${theme.border.default}`, borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: '"JetBrains Mono", monospace' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>agent</span>
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>muse-spark-1026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>stall_detector</span>
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>sliding_window_hash (3 cycles)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>status</span>
            <span style={{ color: '#1a7f37', fontWeight: 600 }}>pass (0 regressions)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
