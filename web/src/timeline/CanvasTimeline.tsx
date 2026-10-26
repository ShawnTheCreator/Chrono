import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const CanvasTimeline: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState(0);

  const state = useTimelineStore();

  const formatTime = (ns: number) => {
    const relNs = Math.max(0, ns - state.minTimestampNs);
    const totalMs = Math.floor(relNs / 1_000_000);
    const secs = Math.floor(totalMs / 1000);
    const ms = totalMs % 1000;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = theme.bg.surface;
    ctx.fillRect(0, 0, width, height);

    // Border line at top
    ctx.strokeStyle = theme.border.hairline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(width, 0.5);
    ctx.stroke();

    const range = Math.max(1, state.maxTimestampNs - state.minTimestampNs);

    const tsToX = (ts: number) => {
      const normalized = (ts - state.minTimestampNs) / range;
      return (normalized * width * zoom) - panOffset;
    };

    // Draw Event Density Heatmap Track (height 28 to 58)
    const trackY = 32;
    const trackH = 26;

    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, trackY, width, trackH);

    // Render Event Heatmap bars
    const bucketCount = Math.floor(width / 4);
    const buckets = new Float32Array(bucketCount);

    state.events.forEach((ev) => {
      const x = tsToX(ev.timestamp_ns);
      const bIdx = Math.floor(x / 4);
      if (bIdx >= 0 && bIdx < bucketCount) {
        buckets[bIdx] += (ev.kind === 'tool_call' ? 1.5 : (ev.kind === 'file_diff' ? 2.0 : 1.0));
      }
    });

    let maxB = 1;
    for (let i = 0; i < bucketCount; i++) if (buckets[i] > maxB) maxB = buckets[i];

    for (let i = 0; i < bucketCount; i++) {
      if (buckets[i] > 0) {
        const barH = (buckets[i] / maxB) * (trackH - 4);
        ctx.fillStyle = buckets[i] > 2 ? theme.accent.amber : '#27354a';
        ctx.fillRect(i * 4, trackY + trackH - barH - 2, 3, barH);
      }
    }

    // Ruler Ticks
    ctx.strokeStyle = theme.border.hairline;
    ctx.fillStyle = theme.text.muted;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const tickIntervalNs = Math.max(1_000_000_000, Math.floor(range / (10 * zoom)));
    const startTick = Math.floor(state.minTimestampNs / tickIntervalNs) * tickIntervalNs;

    for (let t = startTick; t <= state.maxTimestampNs; t += tickIntervalNs) {
      const tx = tsToX(t);
      if (tx >= -50 && tx <= width + 50) {
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.lineTo(tx, 14);
        ctx.stroke();
        ctx.fillText(formatTime(t), tx, 24);
      }
    }

    // Draw Checkpoint Markers (Diamonds on the track)
    state.checkpoints.forEach((cp) => {
      const cx = tsToX(cp.timestamp_ns);
      if (cx >= -20 && cx <= width + 20) {
        const isSelected = state.activeCheckpoint?.id === cp.id;
        ctx.save();
        ctx.translate(cx, trackY + trackH / 2);

        // Glow if active
        if (isSelected) {
          ctx.shadowColor = theme.accent.cyan;
          ctx.shadowBlur = 12;
        }

        ctx.fillStyle = isSelected ? theme.accent.cyan : '#475569';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isSelected ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(7, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    });

    // Draw Stall Alerts (Red warning hazard circles)
    state.events.filter((e) => e.kind === 'stall_alert').forEach((st) => {
      const sx = tsToX(st.timestamp_ns);
      if (sx >= -20 && sx <= width + 20) {
        ctx.save();
        ctx.fillStyle = theme.accent.ruby;
        ctx.shadowColor = theme.accent.ruby;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, trackY + trackH / 2, 7, 0, Math.PI * 2);
        ctx.fill();

        // White exclamation mark
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', sx, trackY + trackH / 2 + 3);
        ctx.restore();
      }
    });

    // Playhead Scrubber Cursor
    const playheadX = tsToX(state.currentTimestampNs);
    ctx.strokeStyle = theme.accent.amber;
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.accent.amber;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead Head Indicator (Cap)
    ctx.fillStyle = theme.accent.amber;
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  }, [state, zoom, panOffset]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw, state.currentTimestampNs]);

  const seekFromX = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const range = Math.max(1, state.maxTimestampNs - state.minTimestampNs);
    const ts = state.minTimestampNs + ((x + panOffset) / (canvas.width * zoom)) * range;
    store.seekToTimestamp(ts);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDragging(true);
    canvas.setPointerCapture(e.pointerId);
    seekFromX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    seekFromX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(1.0, Math.min(20.0, z * zoomFactor)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '110px', background: theme.bg.surface }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', borderBottom: `1px solid ${theme.border.subtle}`, background: '#090b10' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.accent.amber, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ● SCRUBBER (60 FPS)
          </span>
          <span style={{ fontSize: '11px', color: theme.text.primary, fontFamily: 'monospace', fontWeight: 600 }}>
            {formatTime(state.currentTimestampNs)} / {formatTime(state.maxTimestampNs)}
          </span>
          {state.activeCheckpoint && (
            <span style={{ fontSize: '11px', color: theme.accent.cyan, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              CP: {state.activeCheckpoint.id} ({state.activeCheckpoint.summary})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setZoom((z) => Math.max(1.0, z * 0.8))}
            style={{ background: theme.bg.elevated, border: `1px solid ${theme.border.hairline}`, color: theme.text.primary, padding: '2px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            - Zoom
          </button>
          <span style={{ fontSize: '11px', color: theme.text.muted, fontFamily: 'monospace' }}>{zoom.toFixed(1)}x</span>
          <button
            onClick={() => setZoom((z) => Math.min(20.0, z * 1.25))}
            style={{ background: theme.bg.elevated, border: `1px solid ${theme.border.hairline}`, color: theme.text.primary, padding: '2px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            + Zoom
          </button>
          <button
            onClick={() => { setZoom(1.0); setPanOffset(0); }}
            style={{ background: theme.bg.elevated, border: `1px solid ${theme.border.hairline}`, color: theme.text.primary, padding: '2px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Canvas Scrubber Track */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', width: '100%', cursor: 'ew-resize' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
};
