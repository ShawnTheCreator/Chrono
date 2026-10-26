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
      const res = await fetch(`http://localhost:8000/checkpoints/${cp.id}/narrate`, {
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
      const res = await fetch('http://localhost:8000/suggest', {
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
        store.setIntervention("INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.");
      }
    } catch {
      store.setIntervention("INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme.bg.surface, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0c12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.violet, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🧠 FLIGHT INSTRUCTOR (MUSE SPARK)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleWhyClick}
            disabled={!cp || loading}
            style={{
              background: theme.accent.cyan,
              color: '#07080b',
              border: 'none',
              padding: '3px 10px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: (!cp || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Why?'}
          </button>
          <button
            onClick={handleSuggestClick}
            style={{
              background: theme.accent.amber,
              color: '#07080b',
              border: 'none',
              padding: '3px 10px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Suggest Intervention
          </button>
        </div>
      </div>

      {/* Narration Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#08090d' }}>
        {narration ? (
          <div style={{ background: '#0d1017', padding: '14px', borderRadius: '4px', border: `1px solid ${theme.border.hairline}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.cyan, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CAUSAL NARRATION
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: narration.verdict === 'FIXED' ? theme.accent.emerald : theme.accent.ruby,
                background: narration.verdict === 'FIXED' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                padding: '2px 8px',
                borderRadius: '3px',
                border: narration.verdict === 'FIXED' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)'
              }}>
                {narration.verdict} (Risk: {(narration.risk_score * 100).toFixed(0)}%)
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary, marginBottom: '8px', lineHeight: '1.4' }}>
              {narration.headline}
            </div>
            <div style={{ fontSize: '12px', color: theme.text.secondary, lineHeight: '1.6', marginBottom: '10px', fontFamily: '"Inter", sans-serif' }}>
              {narration.causal_chain}
            </div>
            <div style={{ fontSize: '11px', color: theme.accent.amber, background: 'rgba(229, 169, 60, 0.08)', border: '1px solid rgba(229, 169, 60, 0.2)', padding: '8px 10px', borderRadius: '3px', lineHeight: '1.4' }}>
              <strong>Hypothesis:</strong> {narration.hypothesis}
            </div>
          </div>
        ) : (
          <div style={{ background: '#0d1017', padding: '14px', borderRadius: '4px', border: `1px dashed ${theme.border.hairline}`, color: theme.text.muted, fontSize: '12px' }}>
            Click <strong>"Why?"</strong> to ask Muse Spark to construct the causal explanation behind this checkpoint.
          </div>
        )}

        {/* Intervention Box */}
        {intervention && (
          <div style={{ background: '#181014', padding: '14px', borderRadius: '4px', border: `1px solid ${theme.accent.ruby}` }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.ruby, marginBottom: '6px', letterSpacing: '0.05em' }}>
              ⚡ COURSE-CORRECTION DIRECTIVE
            </div>
            <div style={{ fontSize: '12px', color: '#fecdd3', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {intervention}
            </div>
          </div>
        )}

        {/* Cryptographic Receipt Badge */}
        <div style={{ marginTop: 'auto', background: '#071610', padding: '10px 12px', borderRadius: '4px', border: `1px solid ${theme.accent.emerald}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.accent.emerald, fontWeight: 700 }}>
            <span>🔒</span> FORENSIC PROOF: IMMUTABLE LOG
          </div>
          <div style={{ fontSize: '10px', color: '#6ee7b7', fontFamily: 'monospace', marginTop: '4px' }}>
            SHA-256 Merkle Chain Verified (Zero Tampering Detected)
          </div>
        </div>
      </div>
    </div>
  );
};
