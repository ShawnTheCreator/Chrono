import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTimelineStore, store } from '../state/timelineStore';
import { theme } from '../app/theme';
import { ClockIcon } from '../components/icons';

interface CanvasTimelineProps {
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

export const CanvasTimeline: React.FC<CanvasTimelineProps> = ({ onToggleCollapse, isCollapsed = false }) => {
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

  const formatMinSec = (ns: number) => {
    const relNs = Math.max(0, ns - state.minTimestampNs);
    const totalSecs = Math.floor(relNs / 1_000_000_000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const draw = useCallback(() => {
    if (isCollapsed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina / High-DPI support: render at native display pixel density
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) return;

    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Hairline top border
    ctx.strokeStyle = '#d0d7de';
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

    // Track lane dimensions
    const rulerH = 20;
    const trackY = rulerH + 2;
    const trackH = Math.max(38, height - trackY - 6);
    const laneCenterY = trackY + trackH / 2;

    // Subtle track background with soft border
    ctx.fillStyle = '#f6f8fa';
    ctx.fillRect(0, trackY, width, trackH);
    ctx.strokeStyle = '#d0d7de';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, trackY, width, trackH);

    // Center baseline across track
    ctx.strokeStyle = 'rgba(208, 215, 222, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(laneCenterY) + 0.5);
    ctx.lineTo(width, Math.floor(laneCenterY) + 0.5);
    ctx.stroke();

    // RULER TICKS & SUBTLE VERTICAL GRID
    const tickIntervalNs = Math.max(1_000_000_000, Math.floor(range / (10 * zoom)));
    const startTick = Math.floor(state.minTimestampNs / tickIntervalNs) * tickIntervalNs;

    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let t = startTick; t <= state.maxTimestampNs; t += tickIntervalNs) {
      const tx = tsToX(t);
      if (tx >= -50 && tx <= width + 50) {
        // Vertical grid hairline across track
        ctx.strokeStyle = 'rgba(208, 215, 222, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.floor(tx) + 0.5, trackY);
        ctx.lineTo(Math.floor(tx) + 0.5, trackY + trackH);
        ctx.stroke();

        // Top ruler mark
        ctx.strokeStyle = '#8c959f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.floor(tx) + 0.5, 0);
        ctx.lineTo(Math.floor(tx) + 0.5, 8);
        ctx.stroke();

        // Timestamp label
        ctx.fillStyle = '#656d76';
        ctx.fillText(formatTime(t), tx, 16);
      }
    }

    // HIGH-QUALITY ACTIVITY VISUALIZATION (Clean event capsules along track)
    // Draw subtle activity density curve across track
    const samples = 64;
    const sampleWidth = width / samples;
    const curve = new Float32Array(samples);

    state.events.forEach((ev) => {
      const x = tsToX(ev.timestamp_ns);
      const sIdx = Math.floor(x / sampleWidth);
      if (sIdx >= 0 && sIdx < samples) {
        curve[sIdx] += (ev.kind === 'tool_call' ? 1.5 : (ev.kind === 'file_diff' ? 2.0 : 1.0));
      }
    });

    let maxVal = 1.0;
    for (let i = 0; i < samples; i++) if (curve[i] > maxVal) maxVal = curve[i];

    // Smooth gradient wave
    const waveGrad = ctx.createLinearGradient(0, trackY + 4, 0, trackY + trackH);
    waveGrad.addColorStop(0, 'rgba(26, 127, 55, 0.16)');
    waveGrad.addColorStop(1, 'rgba(26, 127, 55, 0.01)');

    ctx.beginPath();
    ctx.moveTo(0, trackY + trackH - 1);
    for (let i = 0; i < samples; i++) {
      const x = i * sampleWidth + sampleWidth / 2;
      const normalizedH = (curve[i] / maxVal) * (trackH * 0.45);
      ctx.lineTo(x, trackY + trackH - normalizedH - 2);
    }
    ctx.lineTo(width, trackY + trackH - 1);
    ctx.closePath();
    ctx.fillStyle = waveGrad;
    ctx.fill();

    // Draw individual crisp event markers (capsules) along bottom of track
    state.events.forEach((ev) => {
      const ex = tsToX(ev.timestamp_ns);
      if (ex >= -10 && ex <= width + 10) {
        const isTool = ev.kind === 'tool_call' || ev.kind === 'tool_result';
        const isDiff = ev.kind === 'file_diff';
        const barH = isTool ? 14 : (isDiff ? 18 : 8);

        ctx.fillStyle = isTool ? 'rgba(26, 127, 55, 0.7)' : (isDiff ? 'rgba(9, 105, 218, 0.65)' : 'rgba(101, 109, 118, 0.4)');
        ctx.beginPath();
        ctx.roundRect(Math.floor(ex) - 1.5, trackY + trackH - barH - 2, 3, barH, 1.5);
        ctx.fill();
      }
    });

    // DRAW CHECKPOINT MARKERS (High-resolution vector diamonds on centerline)
    state.checkpoints.forEach((cp, idx) => {
      const cx = tsToX(cp.timestamp_ns);
      if (cx >= -30 && cx <= width + 30) {
        const isSelected = state.activeCheckpoint?.id === cp.id;
        ctx.save();
        ctx.translate(cx, laneCenterY);

        if (isSelected) {
          // Soft ambient pulse halo
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(26, 127, 55, 0.18)';
          ctx.fill();
          ctx.strokeStyle = '#1a7f37';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Active diamond
          ctx.save();
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = '#1a7f37';
          ctx.beginPath();
          ctx.roundRect(-5, -5, 10, 10, 1.5);
          ctx.fill();
          ctx.restore();

          // Crisp white center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Bottom label pill
          ctx.fillStyle = '#dafbe1';
          ctx.strokeStyle = '#b4f0c0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-18, 10, 36, 13, 3);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#1a7f37';
          ctx.font = '600 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`cp_${idx + 1}`, 0, 16.5);
        } else {
          // Inactive diamond
          ctx.save();
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = '#59636e';
          ctx.beginPath();
          ctx.roundRect(-4, -4, 8, 8, 1);
          ctx.fill();
          ctx.restore();

          // Inactive bottom label
          ctx.fillStyle = '#656d76';
          ctx.font = '500 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`cp_${idx + 1}`, 0, 15);
        }

        ctx.restore();
      }
    });

    // DRAW STALL ALERTS (High-res drop-shadow badge)
    state.events
      .filter((e) => e.kind === 'stall_alert')
      .forEach((stall) => {
        const sx = tsToX(stall.timestamp_ns);
        if (sx >= -20 && sx <= width + 20) {
          ctx.save();
          ctx.translate(sx, laneCenterY);

          // Subtle shadow
          ctx.shadowColor = 'rgba(207, 34, 46, 0.35)';
          ctx.shadowBlur = 6;

          ctx.fillStyle = '#cf222e';
          ctx.beginPath();
          ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', 0, 0.5);

          // Top label
          ctx.fillStyle = '#cf222e';
          ctx.font = '700 8px "JetBrains Mono", monospace';
          ctx.fillText('STALL', 0, -12);

          ctx.restore();
        }
      });

    // DRAW PLAYHEAD NEEDLE (Precision vector needle with top badge)
    const playX = tsToX(state.currentTimestampNs);
    if (playX >= -30 && playX <= width + 30) {
      ctx.save();

      // Top floating pill badge
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = '#1f2328';
      ctx.beginPath();
      ctx.roundRect(playX - 22, 2, 44, 16, 3);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Time stamp inside pill
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatMinSec(state.currentTimestampNs), playX, 10);

      // Vertical needle line
      ctx.strokeStyle = '#1f2328';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playX, 18);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Bottom needle dot
      ctx.fillStyle = '#1f2328';
      ctx.beginPath();
      ctx.arc(playX, height - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }, [state, zoom, panOffset, isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      draw();
    };

    window.addEventListener('resize', handleResize);
    draw();
    return () => window.removeEventListener('resize', handleResize);
  }, [draw, isCollapsed]);

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
    const norm = (x - panOffset) / (canvas.clientWidth * zoom);
    const ts = state.minTimestampNs + Math.round(norm * range);

    // Check if clicked near a checkpoint diamond (within 16px)
    let clickedCp = null;
    for (const cp of state.checkpoints) {
      const cx = (((cp.timestamp_ns - state.minTimestampNs) / range) * canvas.clientWidth * zoom) + panOffset;
      if (Math.abs(cx - x) <= 16) {
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
    const norm = (x - panOffset) / (canvas.clientWidth * zoom);
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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#ffffff', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <div style={{
        height: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: `1px solid ${theme.border.default}`,
        background: theme.bg.chrome,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <ClockIcon size={13} color={theme.text.muted} />
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: theme.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              TIMELINE
            </span>
          </div>
          <span style={{ fontSize: '11px', color: theme.text.primary, fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, flexShrink: 0 }}>
            {formatTime(state.currentTimestampNs)} / {formatTime(state.maxTimestampNs)}
          </span>
          {state.activeCheckpoint && (
            <span style={{
              fontSize: '11px',
              color: theme.accent.green,
              background: theme.bg.diffAdd,
              border: `1px solid ${theme.border.diffAdd}`,
              padding: '1px 8px',
              borderRadius: '4px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '360px'
            }}>
              {state.activeCheckpoint.id} ({state.activeCheckpoint.summary})
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          {/* Play / Pause Button */}
          <button
            onClick={() => store.togglePlay()}
            style={{
              background: state.isPlaying ? theme.bg.diffAdd : '#ffffff',
              border: `1px solid ${state.isPlaying ? theme.border.diffAdd : theme.border.default}`,
              color: state.isPlaying ? theme.accent.green : theme.text.primary,
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600
            }}
          >
            {state.isPlaying ? '⏸ pause' : '▶ play'}
          </button>

          {/* Prev / Next Checkpoints */}
          <button
            onClick={() => store.prevCheckpoint()}
            title="Previous checkpoint"
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            ⏮
          </button>
          <button
            onClick={() => store.nextCheckpoint()}
            title="Next checkpoint"
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            ⏭
          </button>

          <div style={{ width: '1px', height: '14px', background: theme.border.default, margin: '0 2px' }} />

          {/* Zoom Buttons */}
          <button
            onClick={() => setZoom((z) => Math.max(1.0, z * 0.8))}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            -
          </button>
          <span style={{ fontSize: '11px', color: theme.text.secondary, fontFamily: '"JetBrains Mono", monospace' }}>{zoom.toFixed(1)}x</span>
          <button
            onClick={() => setZoom((z) => Math.min(20.0, z * 1.25))}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            +
          </button>
          <button
            onClick={() => { setZoom(1.0); setPanOffset(0); }}
            style={{
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            reset
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand timeline' : 'Collapse timeline'}
              style={{
                background: '#ffffff',
                border: `1px solid ${theme.border.default}`,
                color: theme.text.primary,
                padding: '2px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace'
              }}
            >
              {isCollapsed ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {/* Canvas Scrubber Track */}
      {!isCollapsed && (
        <div ref={containerRef} style={{ flex: 1, position: 'relative', width: '100%', minHeight: '50px', cursor: 'ew-resize' }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
};
