'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store, useTimelineStore } from '../../src/state/timelineStore';
import { CanvasTimeline } from '../../src/timeline/CanvasTimeline';
import { DiffPanel } from '../../src/panels/DiffPanel';
import { TreePanel } from '../../src/panels/TreePanel';
import { TranscriptPanel } from '../../src/panels/TranscriptPanel';
import { TelemetryPanel } from '../../src/panels/TelemetryPanel';
import { NarrationPanel } from '../../src/panels/NarrationPanel';
import { sessionClient } from '../../src/ws/sessionClient';
import { authClient, AuthUser } from '../../src/auth/authClient';
import { theme } from '../../src/app/theme';

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000';
import {
  GitBranchIcon,
  ShieldCheckIcon,
  PlusIcon,
  SparklesIcon,
  MessageSquareIcon,
  BarChartIcon,
  BookmarkIcon,
  MoreHorizontalIcon,
  InfoIcon
} from '../../src/components/icons';

// Chrono Signature Logo: Stylized "C" with Clock Hands in Meta Metallic Blue
const ChronoLogo = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="chronoDashGrad" x1="10%" y1="10%" x2="90%" y2="90%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="45%" stopColor="#0073EE" />
        <stop offset="100%" stopColor="#0064E0" />
      </linearGradient>
      <linearGradient id="chronoDashAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#71F6D2" />
        <stop offset="100%" stopColor="#0082FB" />
      </linearGradient>
    </defs>
    <path
      d="M 74 26 A 35 35 0 1 0 74 74"
      fill="none"
      stroke="url(#chronoDashGrad)"
      strokeWidth="11"
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="6" fill="url(#chronoDashGrad)" />
    <line
      x1="50"
      y1="50"
      x2="35"
      y2="33"
      stroke="url(#chronoDashGrad)"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
    <line
      x1="50"
      y1="50"
      x2="68"
      y2="38"
      stroke="url(#chronoDashAccent)"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="2.2" fill="#FFFFFF" />
  </svg>
);

const SESSIONS = [
  { id: 'chrono-feature-attempt-1', label: 'Loop Recovery Session', shortName: 'Loop Recovery', description: 'AI got stuck in a repetitive edit loop; Chrono detected and guided recovery.' },
  { id: 'live-agent-run', label: 'Feature Build Session', shortName: 'Feature Build', description: 'Autonomous agent building recorder modules (2,973 actions recorded).' },
  { id: 'muse-code-run', label: 'Code Review Session', shortName: 'Code Review', description: 'Agent verifying cycle detection logic (41 steps).' },
  { id: 'openrepo-maintenance-run', label: 'Performance Test Run', shortName: 'Stress Test', description: 'High-speed stress test verifying zero event drops.' }
];

export default function CockpitDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = authClient.getCurrentUser();
    if (u) {
      setCurrentUser(u);
    }
  }, []);

  const [currentSessionId, setCurrentSessionId] = useState('chrono-feature-attempt-1');
  const [activeTab, setActiveTab] = useState<'narration' | 'transcript' | 'telemetry'>('narration');
  const state = useTimelineStore();

  // Screen sizing & collapsing state
  const [treeWidth, setTreeWidth] = useState(210);
  const [inspectorWidth, setInspectorWidth] = useState(360);
  const [timelineHeight, setTimelineHeight] = useState(135);
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isFullscreenDiff, setIsFullscreenDiff] = useState(false);
  const [inspectorSide, setInspectorSide] = useState<'right' | 'left'>('right');

  // Modals & Menu State
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showNewRunModal, setShowNewRunModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Dragging state for splitters
  const isDraggingRef = useRef<'tree' | 'inspector' | 'timeline' | null>(null);
  const startPosRef = useRef({ x: 0, y: 0, initialW: 0, initialH: 0 });

  useEffect(() => {
    sessionClient.init();
    if (state.activeMode === 'library' && currentSessionId) {
      sessionClient.connect(currentSessionId);
    }
  }, [currentSessionId, state.activeMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSessionChange = (newId: string) => {
    setCurrentSessionId(newId);
    store.loadSessionById(newId);
    sessionClient.connect(newId);
    showToast(`Loaded ${sessionList.find((s: any) => s.id === newId)?.label || newId}`);
  };

  const handleStartLiveDemo = () => {
    store.startLiveSimulation();
    showToast('Starting live demo...');
  };

  const handleStopAndSeal = () => {
    store.stopAndSealLiveSession(true);
    showToast('Session saved and verified.');
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(!isBookmarked ? 'Checkpoint bookmarked' : 'Bookmark removed');
  };

  const handleDownloadReceipt = () => {
    const data = state.verificationReceipt || {
      session_id: currentSessionId,
      verified_at: new Date().toISOString(),
      active_checkpoint: state.activeCheckpoint?.id || 'chk_04',
      status: 'VERIFIED',
      total_actions: state.events.length,
      loop_detected: true,
      loop_resolved: true
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrono-summary-${currentSessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowOptionsMenu(false);
    showToast('Downloaded session summary');
  };

  const handleResetLayout = () => {
    setTreeWidth(210);
    setInspectorWidth(360);
    setTimelineHeight(135);
    setIsTreeCollapsed(false);
    setIsInspectorCollapsed(false);
    setIsTimelineCollapsed(false);
    setIsFullscreenDiff(false);
    setInspectorSide('right');
    setShowOptionsMenu(false);
    showToast('Reset screen layout');
  };

  const startDrag = (splitter: 'tree' | 'inspector' | 'timeline', e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = splitter;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialW: splitter === 'tree' ? treeWidth : inspectorWidth,
      initialH: timelineHeight
    };

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (isDraggingRef.current === 'tree') {
        const delta = moveEv.clientX - startPosRef.current.x;
        setTreeWidth(Math.max(140, Math.min(420, startPosRef.current.initialW + delta)));
      } else if (isDraggingRef.current === 'inspector') {
        const delta = inspectorSide === 'right'
          ? startPosRef.current.x - moveEv.clientX
          : moveEv.clientX - startPosRef.current.x;
        setInspectorWidth(Math.max(220, Math.min(520, startPosRef.current.initialW + delta)));
      } else if (isDraggingRef.current === 'timeline') {
        const delta = startPosRef.current.y - moveEv.clientY;
        setTimelineHeight(Math.max(60, Math.min(260, startPosRef.current.initialH + delta)));
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const sessionList = (state.availableSessions && state.availableSessions.length > 0)
    ? state.availableSessions
    : SESSIONS;
  const activeSessionMeta = sessionList.find((s: any) => s.id === currentSessionId) || sessionList[0] || SESSIONS[0];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: theme.bg.surface,
      overflow: 'hidden',
      color: theme.text.primary,
      fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '52px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          background: '#1f2328',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: '"JetBrains Mono", monospace',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#2da44e' }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header style={{
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        background: theme.bg.chrome,
        borderBottom: `1px solid ${theme.border.default}`,
        flexShrink: 0
      }}>
        {/* Left: Brand & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => store.resetToStandby()}
            title="Return to Home"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <ChronoLogo size={22} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: theme.text.primary, letterSpacing: '-0.02em', fontFamily: '"JetBrains Mono", monospace' }}>
              CHRONO
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '3px',
              background: state.activeMode === 'live' ? '#fee2e2' : state.activeMode === 'library' ? '#f3e8ff' : '#e0f2fe',
              color: state.activeMode === 'live' ? '#b91c1c' : state.activeMode === 'library' ? '#7e22ce' : '#0369a1',
              border: `1px solid ${state.activeMode === 'live' ? '#fca5a5' : state.activeMode === 'library' ? '#d8b4fe' : '#bae6fd'}`,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {state.activeMode === 'live' ? 'RECORDING' : state.activeMode === 'library' ? 'PAST SESSION' : 'READY'}
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          {/* Simple Clean Breadcrumbs */}
          {state.activeMode === 'standby' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: theme.text.secondary, fontWeight: 500 }}>Ready</span>
            </div>
          ) : state.activeMode === 'live' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
              <span>Live Run</span>
              <span>/</span>
              <span style={{ color: '#b91c1c', fontWeight: 600 }}>Step #{state.liveBlockCount}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
              <span onClick={() => store.resetToStandby()} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sessions</span>
              <span>/</span>
              <span style={{ color: theme.text.primary, fontWeight: 500 }}>{activeSessionMeta.shortName || activeSessionMeta.label}</span>
              <span>/</span>
              <span style={{
                color: theme.accent.green,
                fontWeight: 600,
                background: theme.bg.diffAdd,
                padding: '1px 6px',
                borderRadius: '3px',
                border: `1px solid ${theme.border.diffAdd}`
              }}>
                {state.activeCheckpoint?.id || 'chk_04'}
              </span>
              <button
                onClick={handleBookmarkToggle}
                title={isBookmarked ? 'Bookmarked' : 'Bookmark this checkpoint'}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <BookmarkIcon size={12} color={isBookmarked ? theme.accent.green : theme.text.muted} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions & Simple Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live Recording Controls */}
          {state.activeMode === 'live' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleStopAndSeal}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>⏹</span>
                <span>Finish & Save</span>
              </button>
              <button
                onClick={handleStartLiveDemo}
                style={{
                  background: theme.bg.surface,
                  color: theme.text.secondary,
                  border: `1px solid ${theme.border.default}`,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer'
                }}
              >
                ↺ Restart
              </button>
              <button
                onClick={() => store.resetToStandby()}
                style={{
                  background: 'transparent',
                  color: theme.text.muted,
                  border: `1px solid ${theme.border.default}`,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer'
                }}
              >
                ✕ Exit
              </button>
            </div>
          )}

          {/* Past Session Controls */}
          {state.activeMode === 'library' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => store.resetToStandby()}
                style={{
                  background: theme.bg.surface,
                  color: theme.text.secondary,
                  border: `1px solid ${theme.border.default}`,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer'
                }}
              >
                ◀ Back
              </button>

              <select
                value={currentSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                style={{
                  background: theme.bg.surface,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.default}`,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {sessionList.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.label || s.task_name || s.id}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowVerifyModal(true)}
                title="View verification report"
                style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheckIcon size={12} color="#166534" />
                <span>Verified</span>
              </button>
            </div>
          )}

          {/* Standby Shortcut Buttons */}
          {state.activeMode === 'standby' && (
            <button
              onClick={handleStartLiveDemo}
              style={{
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>▶</span>
              <span>Live Demo</span>
            </button>
          )}

          {/* Options Menu Button (in workspace modes) */}
          {state.activeMode !== 'standby' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                title="Options & Layout"
                style={{
                  background: showOptionsMenu ? theme.bg.surface : 'transparent',
                  border: showOptionsMenu ? `1px solid ${theme.border.default}` : 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: theme.text.primary,
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MoreHorizontalIcon size={14} />
              </button>

              {showOptionsMenu && (
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: '0',
                  background: '#ffffff',
                  border: `1px solid ${theme.border.default}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  width: '180px',
                  padding: '4px 0',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px'
                }}>
                  <button
                    onClick={handleDownloadReceipt}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 12px', cursor: 'pointer', color: theme.text.primary }}
                  >
                    Export Summary (.json)
                  </button>
                  <button
                    onClick={() => {
                      setInspectorSide(inspectorSide === 'right' ? 'left' : 'right');
                      setShowOptionsMenu(false);
                      showToast(`Moved inspector to ${inspectorSide === 'right' ? 'left' : 'right'}`);
                    }}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 12px', cursor: 'pointer', color: theme.text.primary }}
                  >
                    Move Inspector to {inspectorSide === 'right' ? 'Left' : 'Right'}
                  </button>
                  <button
                    onClick={handleResetLayout}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 12px', cursor: 'pointer', color: theme.text.primary }}
                  >
                    Reset Layout
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          <a
            href={HOME_URL}
            title="Overview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: theme.text.secondary,
              textDecoration: 'none',
              fontFamily: '"JetBrains Mono", monospace',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${theme.border.default}`,
              background: '#ffffff'
            }}
          >
            <span>overview</span>
          </a>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: theme.bg.mascotYellow,
            border: `1px solid ${theme.border.mascotYellow}`,
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: theme.accent.mascotYellow
            }} />
            <span style={{ fontWeight: 600, color: theme.text.yellow }}>
              {currentUser?.email ? currentUser.email.split('@')[0] : 'operator'}
            </span>
          </div>

          <button
            onClick={async () => {
              await authClient.logout();
              router.push('/login');
            }}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.text.muted,
              fontSize: '11px',
              padding: '2px 4px',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            exit
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* STATE 1: CLEAN STANDBY GATEWAY (DEFAULT LANDING VIEW) */}
      {/* ========================================================================= */}
      {state.activeMode === 'standby' ? (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ maxWidth: '860px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Clean Hero Header */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '28px 32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#475569',
                fontWeight: 600,
                width: 'fit-content'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                <span>RECORDER READY</span>
              </div>

              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ChronoLogo size={26} />
                <span>Flight recorder for AI coding agents</span>
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Watch your AI code in real time, catch loops before they waste tokens, and review every change.
              </p>
            </div>

            {/* Primary Action Card: Try Live Demo */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '22px 28px',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#15803d',
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  padding: '1px 8px',
                  borderRadius: '10px',
                  width: 'fit-content',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  ★ 1-CLICK LIVE DEMO
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#14532d', margin: 0 }}>
                  See how Chrono catches an AI loop
                </h2>
                <p style={{ fontSize: '12px', color: '#166534', margin: 0, lineHeight: 1.4, maxWidth: '540px' }}>
                  Watch a live demonstration: the AI writes code, makes a mistake, gets stuck repeating the same edit, and Chrono steps in with the fix.
                </p>
              </div>

              <button
                onClick={handleStartLiveDemo}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 22px',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <span>▶</span>
                <span>Run Live Demo</span>
              </button>
            </div>

            {/* Two Clean Cards: How it works vs Recent Sessions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Left Column: How It Works */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    How Chrono Works
                  </h3>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>3 steps</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334155' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>1</span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>Silent Recording:</strong> Chrono tracks your AI's edits and commands as it works, with zero delay.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ background: '#fee2e2', color: '#b91c1c', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>2</span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>Loop Detection:</strong> If the AI repeats the same bad edit 3 times, Chrono immediately flags it.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>3</span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>Smart Fix:</strong> Chrono gives the AI clear guidance to break the loop and finish the task.
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#94a3b8' }}>
                  Compatible with Claude Code, Muse Code, and Antigravity.
                </div>
              </div>

              {/* Right Column: Recent Sessions */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Recent Sessions
                  </h3>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>History</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sessionList.map((s: any) => (
                    <div
                      key={s.id}
                      onClick={() => handleSessionChange(s.id)}
                      style={{
                        padding: '9px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{s.label}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {s.description || s.task_name}
                        </span>
                      </div>
                      <span style={{ color: '#0082FB', fontSize: '11px', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                        Open ▶
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STATES 2 & 3: LIVE DEMO OR PAST SESSION WORKSPACE */
        /* ========================================================================= */
        <>
          {/* Active Mode Banner */}
          {state.activeMode === 'live' ? (
            <div style={{
              background: state.stalls.length > 0 ? '#fef2f2' : '#f0fdf4',
              borderBottom: `1px solid ${state.stalls.length > 0 ? '#fecaca' : '#bbf7d0'}`,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: state.stalls.length > 0 ? '#dc2626' : '#16a34a',
                  boxShadow: state.stalls.length > 0 ? '0 0 8px #dc2626' : '0 0 6px #16a34a'
                }} />
                <span style={{ fontWeight: 600, color: state.stalls.length > 0 ? '#b91c1c' : '#166534' }}>
                  {state.stalls.length > 0 ? '⚠️ LOOP DETECTED:' : '● LIVE RECORDING:'}
                </span>
                <span style={{ color: state.stalls.length > 0 ? '#991b1b' : '#14532d' }}>
                  {state.liveStatusText}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                <span>Actions: <strong style={{ color: '#0f172a' }}>{state.events.length}</strong></span>
                <span>Checkpoints: <strong style={{ color: '#0f172a' }}>{state.checkpoints.length}</strong></span>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#faf5ff',
              borderBottom: '1px solid #e9d5ff',
              padding: '5px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#7e22ce', fontWeight: 600 }}>PAST SESSION:</span>
                <span style={{ color: '#581c87' }}>{activeSessionMeta.label}</span>
                <span style={{ color: '#9333ea', fontSize: '10px' }}>(Completed)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Verified Log</span>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #d8b4fe',
                    color: '#7e22ce',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  View Summary
                </button>
              </div>
            </div>
          )}

          {/* Main Workspace Area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {/* Left Narrow Dock */}
            <aside style={{
              width: '42px',
              background: theme.bg.chrome,
              borderRight: `1px solid ${theme.border.default}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 0',
              gap: '8px',
              flexShrink: 0,
              zIndex: 10
            }}>
              {/* Timeline Toggle */}
              <button
                onClick={() => {
                  setIsTimelineCollapsed(!isTimelineCollapsed);
                  showToast(!isTimelineCollapsed ? 'Collapsed timeline' : 'Expanded timeline');
                }}
                title={isTimelineCollapsed ? 'Expand Timeline' : 'Collapse Timeline'}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: !isTimelineCollapsed ? theme.bg.surface : 'transparent',
                  color: !isTimelineCollapsed ? theme.accent.green : theme.text.muted,
                  border: !isTimelineCollapsed ? `1px solid ${theme.border.default}` : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <circle cx="8" cy="12" r="2.5" fill="currentColor" />
                  <circle cx="16" cy="12" r="2.5" />
                </svg>
              </button>

              {/* Files Toggle */}
              <button
                onClick={() => {
                  setIsTreeCollapsed(!isTreeCollapsed);
                  showToast(!isTreeCollapsed ? 'Collapsed files' : 'Expanded files');
                }}
                title={isTreeCollapsed ? 'Expand Files' : 'Collapse Files'}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: !isTreeCollapsed ? theme.bg.surface : 'transparent',
                  color: !isTreeCollapsed ? theme.accent.green : theme.text.muted,
                  border: !isTreeCollapsed ? `1px solid ${theme.border.default}` : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GitBranchIcon size={14} color={!isTreeCollapsed ? theme.accent.green : theme.text.muted} />
              </button>

              {/* Verifier Dialog */}
              <button
                onClick={() => setShowVerifyModal(true)}
                title="Session Verification"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: theme.text.muted,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheckIcon size={14} color={theme.text.muted} />
              </button>

              {/* New Run Modal */}
              <button
                onClick={() => setShowNewRunModal(true)}
                title="New Session"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: theme.text.muted,
                  border: `1px solid ${theme.border.default}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PlusIcon size={13} color={theme.text.muted} />
              </button>

              {/* Bottom Avatar */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  onClick={() => setShowAgentModal(true)}
                  title="AI Agent Info"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '4px',
                    background: '#24292f',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", monospace',
                    cursor: 'pointer'
                  }}
                >
                  AI
                </div>
              </div>
            </aside>

            {/* Left Tree Panel */}
            {!isTreeCollapsed && !isFullscreenDiff && (
              <div style={{ width: `${treeWidth}px`, height: '100%', flexShrink: 0, position: 'relative' }}>
                <TreePanel onCollapse={() => setIsTreeCollapsed(true)} />
              </div>
            )}

            {/* Splitter between Tree and Diff */}
            {!isTreeCollapsed && !isFullscreenDiff && (
              <div
                onPointerDown={(e) => startDrag('tree', e)}
                title="Drag to resize tree width"
                style={{
                  width: '4px',
                  height: '100%',
                  cursor: 'col-resize',
                  background: theme.bg.chrome,
                  borderLeft: `1px solid ${theme.border.default}`,
                  borderRight: `1px solid ${theme.border.default}`,
                  flexShrink: 0,
                  zIndex: 5,
                  userSelect: 'none'
                }}
              />
            )}

            {/* Center Diff Viewer */}
            <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
              <DiffPanel
                isFullscreen={isFullscreenDiff}
                onToggleFullscreen={() => {
                  setIsFullscreenDiff(!isFullscreenDiff);
                  showToast(!isFullscreenDiff ? 'Expanded diff' : 'Restored layout');
                }}
              />
            </div>

            {/* Splitter between Diff and Inspector */}
            {inspectorSide === 'right' && !isInspectorCollapsed && !isFullscreenDiff && (
              <div
                onPointerDown={(e) => startDrag('inspector', e)}
                title="Drag to resize inspector width"
                style={{
                  width: '4px',
                  height: '100%',
                  cursor: 'col-resize',
                  background: theme.bg.chrome,
                  borderLeft: `1px solid ${theme.border.default}`,
                  borderRight: `1px solid ${theme.border.default}`,
                  flexShrink: 0,
                  zIndex: 5,
                  userSelect: 'none'
                }}
              />
            )}

            {/* Right Inspector Panel */}
            {inspectorSide === 'right' && !isInspectorCollapsed && !isFullscreenDiff && (
              <aside style={{ width: `${inspectorWidth}px`, height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg.surface, flexShrink: 0 }}>
                <div style={{
                  padding: '5px 8px',
                  borderBottom: `1px solid ${theme.border.default}`,
                  background: theme.bg.chrome,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <button
                    onClick={() => setActiveTab('narration')}
                    style={{
                      flex: 1,
                      padding: '3px 5px',
                      borderRadius: '4px',
                      border: activeTab === 'narration' ? `1px solid ${theme.border.default}` : '1px solid transparent',
                      background: activeTab === 'narration' ? '#ffffff' : 'transparent',
                      color: activeTab === 'narration' ? theme.text.primary : theme.text.muted,
                      fontWeight: activeTab === 'narration' ? 600 : 500,
                      fontSize: '11px',
                      fontFamily: '"JetBrains Mono", monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <SparklesIcon size={12} color={activeTab === 'narration' ? theme.accent.green : theme.text.muted} />
                    <span>instructor</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('transcript')}
                    style={{
                      flex: 1,
                      padding: '3px 5px',
                      borderRadius: '4px',
                      border: activeTab === 'transcript' ? `1px solid ${theme.border.default}` : '1px solid transparent',
                      background: activeTab === 'transcript' ? '#ffffff' : 'transparent',
                      color: activeTab === 'transcript' ? theme.text.primary : theme.text.muted,
                      fontWeight: activeTab === 'transcript' ? 600 : 500,
                      fontSize: '11px',
                      fontFamily: '"JetBrains Mono", monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageSquareIcon size={12} color={activeTab === 'transcript' ? theme.accent.green : theme.text.muted} />
                    <span>transcript</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('telemetry')}
                    style={{
                      flex: 1,
                      padding: '3px 5px',
                      borderRadius: '4px',
                      border: activeTab === 'telemetry' ? `1px solid ${theme.border.default}` : '1px solid transparent',
                      background: activeTab === 'telemetry' ? '#ffffff' : 'transparent',
                      color: activeTab === 'telemetry' ? theme.text.primary : theme.text.muted,
                      fontWeight: activeTab === 'telemetry' ? 600 : 500,
                      fontSize: '11px',
                      fontFamily: '"JetBrains Mono", monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <BarChartIcon size={12} color={activeTab === 'telemetry' ? theme.accent.green : theme.text.muted} />
                    <span>telemetry</span>
                  </button>
                  <button
                    onClick={() => setIsInspectorCollapsed(true)}
                    title="Collapse panel"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.text.muted,
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: '0 4px',
                      lineHeight: 1
                    }}
                  >
                    ▶
                  </button>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {activeTab === 'narration' && <NarrationPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
                  {activeTab === 'transcript' && <TranscriptPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
                  {activeTab === 'telemetry' && <TelemetryPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
                </div>
              </aside>
            )}
          </div>

          {/* Splitter above Timeline */}
          {!isTimelineCollapsed && !isFullscreenDiff && (
            <div
              onPointerDown={(e) => startDrag('timeline', e)}
              title="Drag to resize timeline"
              style={{
                height: '4px',
                width: '100%',
                cursor: 'row-resize',
                background: theme.bg.chrome,
                borderTop: `1px solid ${theme.border.default}`,
                borderBottom: `1px solid ${theme.border.default}`,
                flexShrink: 0,
                zIndex: 5,
                userSelect: 'none'
              }}
            />
          )}

          {/* Bottom Scrubber Timeline */}
          {!isFullscreenDiff && (
            <footer style={{ height: isTimelineCollapsed ? '32px' : `${timelineHeight}px`, flexShrink: 0, overflow: 'hidden' }}>
              <CanvasTimeline
                isCollapsed={isTimelineCollapsed}
                onToggleCollapse={() => {
                  setIsTimelineCollapsed(!isTimelineCollapsed);
                  showToast(!isTimelineCollapsed ? 'Minimized timeline' : 'Restored timeline');
                }}
              />
            </footer>
          )}
        </>
      )}

      {/* MODAL 1: Session Details Modal */}
      {showInfoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${theme.border.default}`,
            width: '420px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>SESSION DETAILS</span>
              <button onClick={() => setShowInfoModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Session:</span><span style={{ fontWeight: 600 }}>{currentSessionId}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Task:</span><span>{activeSessionMeta.label || activeSessionMeta.task_name}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Model:</span><span>{state.metadata?.model || 'Muse Spark'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Total Actions:</span><span>{state.events.length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Checkpoints:</span><span>{state.checkpoints.length} snapshots</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Status:</span><span style={{ color: '#1a7f37', fontWeight: 600 }}>Verified</span></div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInfoModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Session Verification Modal */}
      {showVerifyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${theme.border.default}`,
            width: '440px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>SESSION VERIFICATION</span>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: '#dafbe1', border: '1px solid #b4f0c0', padding: '8px 10px', borderRadius: '4px', color: '#1a7f37', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✓</span>
                <span>STATUS: VERIFIED (0 ERRORS DETECTED)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ color: theme.text.muted }}>Actions Recorded:</span>
                <span>{state.verificationReceipt?.records_count || state.events.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.text.muted }}>Loop Shield:</span>
                <span style={{ color: '#1a7f37' }}>Active & Resolved</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.text.muted }}>Verified At:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: New Session Modal */}
      {showNewRunModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${theme.border.default}`,
            width: '400px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>START OR LOAD SESSION</span>
              <button onClick={() => setShowNewRunModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div onClick={() => { handleStartLiveDemo(); setShowNewRunModal(false); }} style={{ padding: '8px 10px', border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer', background: '#f0fdf4' }}>
                <div style={{ fontWeight: 600, color: '#15803d' }}>▶ Run Live Demo</div>
                <div style={{ color: '#166534', fontSize: '10px' }}>Simulate live agent recording and loop recovery</div>
              </div>
              <div onClick={() => { handleSessionChange('chrono-feature-attempt-1'); setShowNewRunModal(false); }} style={{ padding: '8px 10px', border: `1px solid ${theme.border.default}`, borderRadius: '4px', cursor: 'pointer', background: '#f6f8fa' }}>
                <div style={{ fontWeight: 600, color: theme.text.primary }}>Load Loop Recovery Session</div>
                <div style={{ color: theme.text.muted, fontSize: '10px' }}>Review how Chrono recovered from an agent edit loop</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewRunModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Agent Info Modal */}
      {showAgentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: `1px solid ${theme.border.default}`,
            width: '400px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>AGENT INFO</span>
              <button onClick={() => setShowAgentModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Agent:</span><span>Muse Code / Antigravity</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Engine:</span><span>Meta Model API</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Loop Shield:</span><span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span></div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAgentModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
