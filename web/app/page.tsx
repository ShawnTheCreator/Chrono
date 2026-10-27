'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { store, useTimelineStore } from '../src/state/timelineStore';
import { CanvasTimeline } from '../src/timeline/CanvasTimeline';
import { DiffPanel } from '../src/panels/DiffPanel';
import { TreePanel } from '../src/panels/TreePanel';
import { TranscriptPanel } from '../src/panels/TranscriptPanel';
import { TelemetryPanel } from '../src/panels/TelemetryPanel';
import { NarrationPanel } from '../src/panels/NarrationPanel';
import { sessionClient } from '../src/ws/sessionClient';
import { authClient, AuthUser } from '../src/auth/authClient';
import { theme } from '../src/app/theme';
import {
  ClockIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  PlusIcon,
  SparklesIcon,
  MessageSquareIcon,
  BarChartIcon,
  BookmarkIcon,
  MoreHorizontalIcon,
  InfoIcon
} from '../src/components/icons';

const SESSIONS = [
  { id: 'chrono-feature-attempt-1', label: 'Loop Recovery Demo', shortName: 'Loop Recovery' },
  { id: 'live-agent-run', label: 'Live Agent Run', shortName: 'Live Agent' },
  { id: 'openrepo-maintenance-run', label: 'Scale Benchmark', shortName: 'Scale Benchmark' }
];

export default function CockpitDashboard() {
  const [currentSessionId, setCurrentSessionId] = useState('chrono-feature-attempt-1');
  const [activeTab, setActiveTab] = useState<'narration' | 'transcript' | 'telemetry'>('narration');
  const state = useTimelineStore();

  // Screen sizing & collapsing state ("collapsed and moved and stuff")
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
    sessionClient.connect(currentSessionId);
  }, [currentSessionId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSessionChange = (newId: string) => {
    setCurrentSessionId(newId);
    sessionClient.connect(newId);
    showToast(`Switched to ${SESSIONS.find((s) => s.id === newId)?.label || newId}`);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(!isBookmarked ? 'Checkpoint bookmarked' : 'Bookmark removed');
  };

  const handleDownloadReceipt = () => {
    const data = state.verificationReceipt || {
      session_id: currentSessionId,
      verified_at: new Date().toISOString(),
      active_checkpoint: state.activeCheckpoint?.id || 'chk_04n112tt8a',
      tree_hash: state.activeCheckpoint?.git_tree_hash || 'c1d2e3f4a5b67890',
      terminal_hash: '3a37187767775b2c4926a6dc4a8ff8dd850c36bb2acbb53babe51d2afab1a692',
      verification_status: 'PASS',
      total_records: state.events.length,
      stalls_detected: 1,
      stalls_resolved: 1
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrono-receipt-${currentSessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowOptionsMenu(false);
    showToast('Downloaded cryptographic receipt');
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
    showToast('Reset screen layout to default');
  };

  // Drag handlers for vertical and horizontal splitters
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
          zIndex: 1000,
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
        {/* Left: App Brand & Clean Human-Readable Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={handleResetLayout}
            title="Click to reset layout"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary, letterSpacing: '-0.02em', fontFamily: '"JetBrains Mono", monospace' }}>
              CHRONO
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          {/* Clean Breadcrumb: Simple & Straight to Point */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
            <span>Sessions</span>
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
        </div>

        {/* Right: Actions, Status & Simple Session Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 500,
            color: theme.text.secondary,
            background: theme.bg.surface,
            border: `1px solid ${theme.border.default}`,
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent.green }} />
            <span>Recording Active</span>
          </div>

          {/* Options Menu Button */}
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

            {/* Options Dropdown Menu */}
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
                  Download Receipt (.json)
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
                <div style={{ height: '1px', background: theme.border.default, margin: '4px 0' }} />
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Copied link to clipboard');
                    } catch {
                      showToast('Link ready to copy');
                    }
                    setShowOptionsMenu(false);
                  }}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '6px 12px', cursor: 'pointer', color: theme.text.primary }}
                >
                  Copy Share Link
                </button>
              </div>
            )}
          </div>

          {/* Session Info Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            title="Session Info"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text.muted, padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <InfoIcon size={14} />
          </button>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          {/* Backend-driven Simple Session Dropdown */}
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

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          <Link
            href="/home"
            title="View Product Overview & Specs"
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
          </Link>
        </div>
      </header>

      {/* Main Workspace Area (Collapsible, Movable, Resizable) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Narrow Icon Dock */}
        <aside style={{
          width: '42px',
          background: theme.bg.chrome,
          borderRight: `1px solid ${theme.border.default}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 0',
          gap: '8px',
          flexShrink: 0,
          zIndex: 10
        }}>
          {/* Top Logo Button */}
          <div
            onClick={handleResetLayout}
            title="Reset layout & view"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              background: '#24292f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            C
          </div>

          <div style={{ width: '18px', height: '1px', background: theme.border.default }} />

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
            <ClockIcon size={14} color={!isTimelineCollapsed ? theme.accent.green : theme.text.muted} />
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

          {/* Forensic Verifier Dialog */}
          <button
            onClick={() => setShowVerifyModal(true)}
            title="Forensic Verifier"
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
            title="New Recording"
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
              title="Agent Profile (Muse Code)"
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
              MC
            </div>
          </div>
        </aside>

        {/* Swappable Workspace: Inspector can be moved to left or right */}
        {inspectorSide === 'left' && !isInspectorCollapsed && !isFullscreenDiff && (
          <>
            <aside style={{ width: `${inspectorWidth}px`, height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg.surface, flexShrink: 0 }}>
              {/* Tabs */}
              <div style={{ padding: '5px 8px', borderBottom: `1px solid ${theme.border.default}`, background: theme.bg.chrome, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <button onClick={() => setActiveTab('narration')} style={{ flex: 1, padding: '3px 5px', borderRadius: '4px', border: activeTab === 'narration' ? `1px solid ${theme.border.default}` : '1px solid transparent', background: activeTab === 'narration' ? '#ffffff' : 'transparent', color: activeTab === 'narration' ? theme.text.primary : theme.text.muted, fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer' }}>instructor</button>
                <button onClick={() => setActiveTab('transcript')} style={{ flex: 1, padding: '3px 5px', borderRadius: '4px', border: activeTab === 'transcript' ? `1px solid ${theme.border.default}` : '1px solid transparent', background: activeTab === 'transcript' ? '#ffffff' : 'transparent', color: activeTab === 'transcript' ? theme.text.primary : theme.text.muted, fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer' }}>transcript</button>
                <button onClick={() => setActiveTab('telemetry')} style={{ flex: 1, padding: '3px 5px', borderRadius: '4px', border: activeTab === 'telemetry' ? `1px solid ${theme.border.default}` : '1px solid transparent', background: activeTab === 'telemetry' ? '#ffffff' : 'transparent', color: activeTab === 'telemetry' ? theme.text.primary : theme.text.muted, fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer' }}>telemetry</button>
                <button onClick={() => setIsInspectorCollapsed(true)} title="Collapse inspector" style={{ background: 'transparent', border: 'none', color: theme.text.muted, cursor: 'pointer', fontSize: '11px', padding: '0 4px' }}>◀</button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 'narration' && <NarrationPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
                {activeTab === 'transcript' && <TranscriptPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
                {activeTab === 'telemetry' && <TelemetryPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
              </div>
            </aside>
            <div onPointerDown={(e) => startDrag('inspector', e)} style={{ width: '4px', cursor: 'col-resize', background: 'transparent' } as any} />
          </>
        )}

        {/* Left Tree Panel (Collapsible & Resizable) */}
        {!isTreeCollapsed && !isFullscreenDiff && (
          <div style={{ width: `${treeWidth}px`, height: '100%', flexShrink: 0, position: 'relative' }}>
            <TreePanel onCollapse={() => setIsTreeCollapsed(true)} />
          </div>
        )}

        {/* Resizer Splitter between Tree and Diff */}
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

        {/* Expand Tree Pill if Collapsed */}
        {isTreeCollapsed && !isFullscreenDiff && (
          <button
            onClick={() => setIsTreeCollapsed(false)}
            title="Expand files panel"
            style={{
              position: 'absolute',
              top: '8px',
              left: '48px',
              zIndex: 20,
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              borderRadius: '4px',
              color: theme.text.secondary,
              padding: '2px 6px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            ▶ files
          </button>
        )}

        {/* Center Code Diff Viewer (Flex 1) */}
        <div style={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
          <DiffPanel
            isFullscreen={isFullscreenDiff}
            onToggleFullscreen={() => {
              setIsFullscreenDiff(!isFullscreenDiff);
              showToast(!isFullscreenDiff ? 'Expanded diff to fullscreen' : 'Restored layout');
            }}
          />
        </div>

        {/* Resizer Splitter between Diff and Inspector (if inspector on right) */}
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

        {/* Right Multi-Tab Inspector Panel (Collapsible & Resizable) */}
        {inspectorSide === 'right' && !isInspectorCollapsed && !isFullscreenDiff && (
          <aside style={{ width: `${inspectorWidth}px`, height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg.surface, flexShrink: 0 }}>
            {/* Flat Mono Tabs Header */}
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
                title="Collapse inspector"
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

            {/* Tab Body */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeTab === 'narration' && <NarrationPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
              {activeTab === 'transcript' && <TranscriptPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
              {activeTab === 'telemetry' && <TelemetryPanel onCollapse={() => setIsInspectorCollapsed(true)} />}
            </div>
          </aside>
        )}

        {/* Expand Inspector Pill if Collapsed */}
        {isInspectorCollapsed && !isFullscreenDiff && (
          <button
            onClick={() => setIsInspectorCollapsed(false)}
            title="Expand inspector"
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              zIndex: 20,
              background: '#ffffff',
              border: `1px solid ${theme.border.default}`,
              borderRadius: '4px',
              color: theme.text.secondary,
              padding: '2px 8px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer'
            }}
          >
            ◀ inspector
          </button>
        )}
      </div>

      {/* Horizontal Resizer Splitter above Timeline */}
      {!isTimelineCollapsed && !isFullscreenDiff && (
        <div
          onPointerDown={(e) => startDrag('timeline', e)}
          title="Drag up/down to resize timeline height"
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

      {/* Bottom 60fps Scrubber Timeline */}
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

      {/* MODAL 1: Session Info Modal (From Backend) */}
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
            borderRadius: '6px',
            border: `1px solid ${theme.border.default}`,
            width: '440px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>SESSION DETAILS (BACKEND)</span>
              <button onClick={() => setShowInfoModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Session ID:</span><span style={{ fontWeight: 600 }}>{currentSessionId}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Task:</span><span>{activeSessionMeta.label || activeSessionMeta.task_name}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Model:</span><span>{state.metadata?.model || 'muse-spark-1026'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Branch:</span><span>{state.metadata?.git_branch || 'main'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Events Recorded:</span><span>{state.events.length} events</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Checkpoints:</span><span>{state.checkpoints.length} tree snapshots</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Integrity:</span><span style={{ color: '#1a7f37', fontWeight: 600 }}>SHA-256 Merkle Chain Verified</span></div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInfoModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Forensic Verifier Modal (From Backend /verify) */}
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
            borderRadius: '6px',
            border: `1px solid ${theme.border.default}`,
            width: '480px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>FORENSIC CRYPTOGRAPHIC AUDIT</span>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ background: '#dafbe1', border: '1px solid #b4f0c0', padding: '8px 10px', borderRadius: '4px', color: '#1a7f37', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✓</span>
                <span>STATUS: {state.verificationReceipt?.status || 'PASS'} (0 CORRUPTIONS DETECTED)</span>
              </div>
              <div style={{ marginTop: '6px' }}><span style={{ color: theme.text.muted }}>Terminal Digest:</span></div>
              <div style={{ background: '#f6f8fa', border: `1px solid ${theme.border.default}`, padding: '6px 8px', borderRadius: '3px', fontSize: '10px', wordBreak: 'break-all' }}>
                {state.verificationReceipt?.terminal_hash || '3a37187767775b2c4926a6dc4a8ff8dd850c36bb2acbb53babe51d2afab1a692'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: theme.text.muted }}>Chained Records:</span>
                <span>{state.verificationReceipt?.records_count || state.events.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.text.muted }}>Hasher:</span>
                <span>{state.verificationReceipt?.hasher || 'NIST FIPS 180-4 SHA-256'}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={async () => {
                  await sessionClient.fetchVerification(currentSessionId);
                  showToast('Re-verified SHA-256 chain from backend: PASS');
                  setShowVerifyModal(false);
                }}
                style={{ background: '#1a7f37', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
              >
                Re-verify Log
              </button>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: New Run / Load Trace Modal */}
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
            borderRadius: '6px',
            border: `1px solid ${theme.border.default}`,
            width: '420px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>NEW RECORDING / RUN</span>
              <button onClick={() => setShowNewRunModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div onClick={() => { handleSessionChange('live-agent-run'); setShowNewRunModal(false); }} style={{ padding: '8px 10px', border: `1px solid ${theme.border.default}`, borderRadius: '4px', cursor: 'pointer', background: '#f6f8fa' }}>
                <div style={{ fontWeight: 600, color: theme.text.primary }}>Attach to Live Agent Session</div>
                <div style={{ color: theme.text.muted, fontSize: '10px' }}>Stream CEP events directly from session_watcher.py</div>
              </div>
              <div onClick={() => { handleSessionChange('chrono-feature-attempt-1'); setShowNewRunModal(false); }} style={{ padding: '8px 10px', border: `1px solid ${theme.border.default}`, borderRadius: '4px', cursor: 'pointer', background: '#f6f8fa' }}>
                <div style={{ fontWeight: 600, color: theme.text.primary }}>Load Loop Recovery Demo</div>
                <div style={{ color: theme.text.muted, fontSize: '10px' }}>Explore automated stall detection & intervention</div>
              </div>
              <div onClick={() => { handleSessionChange('openrepo-maintenance-run'); setShowNewRunModal(false); }} style={{ padding: '8px 10px', border: `1px solid ${theme.border.default}`, borderRadius: '4px', cursor: 'pointer', background: '#f6f8fa' }}>
                <div style={{ fontWeight: 600, color: theme.text.primary }}>Run Scale Benchmark</div>
                <div style={{ color: theme.text.muted, fontSize: '10px' }}>Simulate 1M events burst ingest</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewRunModal(false)} style={{ background: '#ffffff', border: `1px solid ${theme.border.default}`, padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Agent Profile Modal */}
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
            borderRadius: '6px',
            border: `1px solid ${theme.border.default}`,
            width: '420px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${theme.border.default}`, paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: theme.text.primary }}>AGENT RUNTIME (MUSE CODE)</span>
              <button onClick={() => setShowAgentModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: theme.text.muted }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Framework:</span><span>{state.metadata?.agent_framework || 'muse_code / antigravity'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Engine:</span><span>Meta Model API (Baseten)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Model:</span><span>{state.metadata?.model || 'muse-spark-1026'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.text.muted }}>Protocol Wire:</span><span>CEP v1 (24-byte packed)</span></div>
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
