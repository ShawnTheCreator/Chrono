import React, { useRef, useEffect, useState, useCallback } from 'react';
import { store } from '../state/timelineStore';
import { theme } from '../app/theme';

export const CanvasTimeline: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1.0); // 1.0 = fit whole run
  const [panOffset, setPanOffset] = useState(0);

  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const formatTime = (ns: number) => {
    const totalMs = Math.floor(ns / 1_000_000);
    const secs = Math.floor(totalMs / 1000);
    const ms = totalMs % 1000;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
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

    const range = Math.max(1, store.maxTimestampNs - store.minTimestampNs);

    const tsToX = (ts: number) => {
      const normalized = (ts - store.minTimestampNs) / range;
      return (normalized * width * zoom) - panOffset;
    };

    const xToTs = (x: number) => {
      const normalized = (x + panOffset) / (width * zoom);
      return store.minTimestampNs + normalized * range;
    };

    // Draw Event Density Heatmap Track (height 20 to 55)
    const trackY = 32;
    const trackH = 26;

    ctx.fillStyle = '#0f131c';
    ctx.fillRect(0, trackY, width, trackH);

    // Render Event Heatmap bars
    const bucketCount = Math.floor(width / 4);
    const buckets = new Float32Array(bucketCount);

    store.events.forEach((ev) => {
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
        ctx.fillStyle = buckets[i] > 3 ? theme.accent.amber : '#27354a';
        ctx.fillRect(i * 4, trackY + trackH - barH - 2, 3, barH);
      }
    }

    // Ruler Ticks
    ctx.strokeStyle = theme.border.hairline;
    ctx.fillStyle = theme.text.muted;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const tickIntervalNs = Math.max(1_000_000_000, Math.floor(range / (10 * zoom)));
    const startTick = Math.floor(store.minTimestampNs / tickIntervalNs) * tickIntervalNs;

    for (let t = startTick; t <= store.maxTimestampNs; t += tickIntervalNs) {
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
    store.checkpoints.forEach((cp) => {
      const cx = tsToX(cp.timestamp_ns);
      if (cx >= -20 && cx <= width + 20) {
        const isSelected = store.activeCheckpoint?.id === cp.id;
        ctx.save();
        ctx.translate(cx, trackY + trackH / 2);

        // Glow if active
        if (isSelected) {
          ctx.shadowColor = theme.accent.cyan;
          ctx.shadowBlur = 10;
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

    // Draw Stall Alerts (Red warning flags)
    store.events.filter((e) => e.kind === 'stall_alert').forEach((st) => {
      const sx = tsToX(st.timestamp_ns);
      if (sx >= -20 && sx <= width + 20) {
        ctx.save();
        ctx.fillStyle = theme.accent.ruby;
        ctx.shadowColor = theme.accent.ruby;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, trackY + trackH / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Playhead Scrubber Cursor
    const playheadX = tsToX(store.currentTimestampNs);
    ctx.strokeStyle = theme.accent.amber;
    ctx.lineWidth = 2;
    ctx.shadowColor = theme.accent.amber;
    ctx.shadowBlur = 12;

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
  }, [zoom, panOffset]);

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
  }, [draw, store.currentTimestampNs]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDragging(true);
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const range = Math.max(1, store.maxTimestampNs - store.minTimestampNs);
    const ts = store.minTimestampNs + ((x + panOffset) / (canvas.width * zoom)) * range;
    store.seekToTimestamp(ts);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const range = Math.max(1, store.maxTimestampNs - store.minTimestampNs);
    const ts = store.minTimestampNs + ((x + panOffset) / (canvas.width * zoom)) * range;
    store.seekToTimestamp(ts);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', borderBottom: `1px solid ${theme.border.subtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: theme.accent.amber, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ● LIVE SCRUBBER (60 FPS)
          </span>
          <span style={{ fontSize: '11px', color: theme.text.secondary }}>
            {formatTime(store.currentTimestampNs)} / {formatTime(store.maxTimestampNs)}
          </span>
          {store.activeCheckpoint && (
            <span style={{ fontSize: '11px', color: theme.accent.cyan, background: '#0e2439', padding: '2px 8px', borderRadius: '4px' }}>
              CP: {store.activeCheckpoint.id} ({store.activeCheckpoint.summary})
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
          <span style={{ fontSize: '11px', color: theme.text.muted }}>{zoom.toFixed(1)}x</span>
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
