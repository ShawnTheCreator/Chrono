import React, { useState } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';
import { SparklesIcon, CheckIcon, ZapIcon } from '../components/icons';

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
        store.setIntervention("INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.");
      }
    } catch {
      store.setIntervention("INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.border.subtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SparklesIcon size={14} color="#2563eb" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.blue, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            FLIGHT INSTRUCTOR
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleWhyClick}
            disabled={!cp || loading}
            style={{
              background: theme.accent.blue,
              color: '#ffffff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: (!cp || loading) ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
            }}
          >
            {loading ? 'Analyzing...' : 'Why?'}
          </button>
          <button
            onClick={handleSuggestClick}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)'
            }}
          >
            Suggest
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff' }}>
        {!narration ? (
          <div style={{ padding: '24px', border: `1px dashed ${theme.border.subtle}`, borderRadius: '6px', textAlign: 'center', color: theme.text.muted, fontSize: '12px' }}>
            Click &quot;Why?&quot; to ask Muse Spark to construct the causal explanation behind this checkpoint.
          </div>
        ) : (
          <>
            {/* Causal Narration Card */}
            <div style={{ background: '#f8fafc', border: `1px solid ${theme.border.subtle}`, borderRadius: '8px', padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: theme.accent.blue, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CAUSAL NARRATION
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0'
                }}>
                  {narration.verdict} (Risk: {(narration.risk_score * 100).toFixed(0)}%)
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary, marginBottom: '6px', lineHeight: '1.4' }}>
                {narration.headline}
              </div>
              <div style={{ fontSize: '12px', color: theme.text.secondary, lineHeight: '1.5' }}>
                {narration.causal_chain}
              </div>

              {narration.hypothesis && (
                <div style={{ marginTop: '10px', padding: '8px 10px', background: '#eff6ff', border: `1px solid ${theme.border.active}`, borderRadius: '4px', fontSize: '11px', color: '#1e40af', lineHeight: '1.45' }}>
                  <span style={{ fontWeight: 700 }}>Hypothesis: </span>
                  {narration.hypothesis}
                </div>
              )}
            </div>

            {/* Course-Correction Directive */}
            {intervention && (
              <div style={{ background: '#eff6ff', border: `1px solid ${theme.border.active}`, borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <ZapIcon size={12} color="#1d4ed8" />
                  <span>COURSE-CORRECTION DIRECTIVE</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600, lineHeight: '1.45' }}>
                  {intervention}
                </div>
              </div>
            )}
          </>
        )}

        {/* Clean Session Info Strip (matching the reference design's Main info card) */}
        <div style={{ marginTop: 'auto', padding: '12px 14px', background: '#f8fafc', border: `1px solid ${theme.border.subtle}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>Agent Model</span>
            <span style={{ color: theme.text.primary, fontWeight: 600 }}>Muse Spark 1026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>Cycle Trap</span>
            <span style={{ color: theme.text.primary, fontWeight: 600 }}>Sliding window (3 cycles)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: theme.text.muted }}>Status</span>
            <span style={{ color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckIcon size={12} color="#16a34a" /> Active (Pass)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
