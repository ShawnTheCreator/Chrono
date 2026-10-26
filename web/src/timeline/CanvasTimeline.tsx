import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';
import { ClockIcon } from '../components/icons';

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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border line at top
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(width, 0.5);
    ctx.stroke();

    const range = Math.max(1, state.maxTimestampNs - state.minTimestampNs);

    const tsToX = (ts: number) => {
      const norm = (ts - state.minTimestampNs) / range;
      return (norm * width * zoom) + panOffset;
    };

    const xToTs = (x: number) => {
      const norm = (x - panOffset) / (width * zoom);
      return state.minTimestampNs + Math.round(norm * range);
    };

    // Track lane
    const trackY = 32;
    const trackH = 34;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, trackY, width, trackH);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(0, trackY, width, trackH);

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
        ctx.fillStyle = buckets[i] > 2 ? '#2563eb' : '#93c5fd';
        ctx.fillRect(i * 4, trackY + trackH - barH - 2, 3, barH);
      }
    }

    // Ruler Ticks
    ctx.strokeStyle = '#cbd5e1';
    ctx.fillStyle = '#64748b';
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

        // Glow halo if active
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
          ctx.fill();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = isSelected ? '#2563eb' : '#64748b';
        ctx.beginPath();
        ctx.rotate(Math.PI / 4);
        const size = isSelected ? 8 : 6;
        ctx.rect(-size / 2, -size / 2, size, size);
        ctx.fill();
        ctx.restore();
      }
    });

    // Draw Stall Alerts
    state.events
      .filter((e) => e.kind === 'stall_alert')
      .forEach((stall) => {
        const sx = tsToX(stall.timestamp_ns);
        if (sx >= -20 && sx <= width + 20) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(sx, trackY + trackH / 2, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', sx, trackY + trackH / 2);
        }
      });

    // Draw Playhead needle
    const playX = tsToX(state.currentTimestampNs);
    if (playX >= -10 && playX <= width + 10) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Scrubber handle pill at bottom
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(playX - 6, trackY - 4, 12, 10, 3);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playX, trackY + 1, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state, zoom, panOffset]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => {
    let animId: number;
    const renderLoop = () => {
      draw();
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [draw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const range = Math.max(1, state.maxTimestampNs - state.minTimestampNs);
    const norm = (x - panOffset) / (canvas.width * zoom);
    const ts = state.minTimestampNs + Math.round(norm * range);

    // Check if clicked near a checkpoint diamond (within 12px)
    let clickedCp = null;
    for (const cp of state.checkpoints) {
      const cx = (((cp.timestamp_ns - state.minTimestampNs) / range) * canvas.width * zoom) + panOffset;
      if (Math.abs(cx - x) <= 12) {
        clickedCp = cp;
        break;
      }
    }

    if (clickedCp) {
      store.selectCheckpoint(clickedCp);
    } else {
      store.seekToTimestamp(ts);
    }

    setIsDragging(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const range = Math.max(1, state.maxTimestampNs - state.minTimestampNs);
    const norm = (x - panOffset) / (canvas.width * zoom);
    const ts = state.minTimestampNs + Math.round(norm * range);
    store.seekToTimestamp(ts);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(1.0, Math.min(20.0, z * zoomFactor)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '110px', background: '#ffffff' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', borderBottom: `1px solid ${theme.border.subtle}`, background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockIcon size={13} color="#2563eb" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TIMELINE SCRUBBER
            </span>
          </div>
          <span style={{ fontSize: '11px', color: theme.text.primary, fontFamily: 'monospace', fontWeight: 600 }}>
            {formatTime(state.currentTimestampNs)} / {formatTime(state.maxTimestampNs)}
          </span>
          {state.activeCheckpoint && (
            <span style={{ fontSize: '11px', color: theme.accent.blue, background: '#eff6ff', border: `1px solid ${theme.border.active}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              CP: {state.activeCheckpoint.id} ({state.activeCheckpoint.summary})
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setZoom((z) => Math.max(1.0, z * 0.8))}
            style={{ background: '#ffffff', border: `1px solid ${theme.border.subtle}`, color: theme.text.primary, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 500 }}
          >
            - Zoom
          </button>
          <span style={{ fontSize: '11px', color: theme.text.secondary, fontFamily: 'monospace' }}>{zoom.toFixed(1)}x</span>
          <button
            onClick={() => setZoom((z) => Math.min(20.0, z * 1.25))}
            style={{ background: '#ffffff', border: `1px solid ${theme.border.subtle}`, color: theme.text.primary, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 500 }}
          >
            + Zoom
          </button>
          <button
            onClick={() => { setZoom(1.0); setPanOffset(0); }}
            style={{ background: '#ffffff', border: `1px solid ${theme.border.subtle}`, color: theme.text.primary, padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 500 }}
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
