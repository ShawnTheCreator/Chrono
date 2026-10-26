'use client';

import React, { useEffect, useState } from 'react';
import { store, useTimelineStore } from '../src/state/timelineStore';
import { CanvasTimeline } from '../src/timeline/CanvasTimeline';
import { DiffPanel } from '../src/panels/DiffPanel';
import { TreePanel } from '../src/panels/TreePanel';
import { TranscriptPanel } from '../src/panels/TranscriptPanel';
import { TelemetryPanel } from '../src/panels/TelemetryPanel';
import { NarrationPanel } from '../src/panels/NarrationPanel';
import { sessionClient } from '../src/ws/sessionClient';
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

export default function CockpitDashboard() {
  const [sessions, setSessions] = useState<any[]>([
    { session_id: 'chrono-feature-attempt-1', task_name: 'C++20 Hash Chain & Ingest (Loop Recovery Demo)' },
    { session_id: 'live-agent-run', task_name: 'Real Agent Execution Trace (832 Verified Blocks)' },
    { session_id: 'openrepo-maintenance-run', task_name: 'OpenRepo Scale Run' }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('chrono-feature-attempt-1');
  const [activeTab, setActiveTab] = useState<'narration' | 'transcript' | 'telemetry'>('narration');
  const state = useTimelineStore();

  useEffect(() => {
    sessionClient.connect(currentSessionId);
  }, [currentSessionId]);

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
      {/* Top Header Bar */}
      <header style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: theme.bg.chrome,
        borderBottom: `1px solid ${theme.border.default}`,
        flexShrink: 0
      }}>
        {/* Left: App Brand & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* App Dropdown Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: theme.text.primary, letterSpacing: '-0.02em', fontFamily: '"JetBrains Mono", monospace' }}>
              CHRONO
            </span>
          </div>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: theme.text.muted, fontFamily: '"JetBrains Mono", monospace' }}>
            <span>sessions</span>
            <span>/</span>
            <span style={{ color: theme.text.primary, fontWeight: 500 }}>feat/stall-detection</span>
            <span>/</span>
            <span style={{
              color: theme.accent.green,
              fontWeight: 600,
              background: theme.bg.diffAdd,
              padding: '1px 6px',
              borderRadius: '3px',
              border: `1px solid ${theme.border.diffAdd}`
            }}>
              {state.activeCheckpoint?.id || 'chk_04n112tt8a'}
            </span>
            <BookmarkIcon size={12} color={theme.text.muted} style={{ marginLeft: 2 }} />
          </div>
        </div>

        {/* Right: Actions, Status & Session Picker */}
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
            <span>flight-recorder:active</span>
          </div>

          {/* Action icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: theme.text.muted }}>
            <button title="Options" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text.muted, padding: '4px', display: 'flex', alignItems: 'center' }}>
              <MoreHorizontalIcon size={14} />
            </button>
            <button title="Session Info" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text.muted, padding: '4px', display: 'flex', alignItems: 'center' }}>
              <InfoIcon size={14} />
            </button>
          </div>

          <div style={{ height: '14px', width: '1px', background: theme.border.default }} />

          <select
            value={currentSessionId}
            onChange={(e) => setCurrentSessionId(e.target.value)}
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
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.session_id} — {s.task_name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Body Grid */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 1. Far Left Narrow Icon Dock */}
        <aside style={{
          width: '46px',
          background: theme.bg.chrome,
          borderRight: `1px solid ${theme.border.default}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          gap: '10px',
          flexShrink: 0
        }}>
          {/* Top Chrono 'C' Icon */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: '#24292f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            C
          </div>

          <div style={{ width: '20px', height: '1px', background: theme.border.default }} />

          {/* Icon buttons */}
          <button title="Flight Timeline" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: theme.bg.surface,
            color: theme.accent.green,
            border: `1px solid ${theme.border.default}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ClockIcon size={14} color={theme.accent.green} />
          </button>

          <button title="Code Tree" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'transparent',
            color: theme.text.muted,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GitBranchIcon size={14} color={theme.text.muted} />
          </button>

          <button title="Forensic Verifier" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'transparent',
            color: theme.text.muted,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheckIcon size={14} color={theme.text.muted} />
          </button>

          <button title="Add / New Run" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            background: 'transparent',
            color: theme.text.muted,
            border: `1px solid ${theme.border.default}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PlusIcon size={13} color={theme.text.muted} />
          </button>

          {/* Bottom Avatar */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#24292f',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              MC
            </div>
          </div>
        </aside>

        {/* 2. Left Tree Panel */}
        <div style={{ width: '220px', height: '100%', flexShrink: 0 }}>
          <TreePanel />
        </div>

        {/* 3. Center Code Diff Viewer */}
        <div style={{ flex: 1, height: '100%', borderRight: `1px solid ${theme.border.default}`, minWidth: 0 }}>
          <DiffPanel />
        </div>

        {/* 4. Right Multi-Tab Inspector Panel */}
        <aside style={{ width: '360px', height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg.surface, flexShrink: 0 }}>
          {/* Flat Mono Tabs Header */}
          <div style={{
            padding: '6px 10px',
            borderBottom: `1px solid ${theme.border.default}`,
            background: theme.bg.chrome,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <button
              onClick={() => setActiveTab('narration')}
              style={{
                flex: 1,
                padding: '4px 6px',
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
                gap: '5px',
                boxShadow: activeTab === 'narration' ? '0 1px 2px rgba(27,31,36,0.04)' : 'none'
              }}
            >
              <SparklesIcon size={12} color={activeTab === 'narration' ? theme.accent.green : theme.text.muted} />
              <span>instructor</span>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              style={{
                flex: 1,
                padding: '4px 6px',
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
                gap: '5px',
                boxShadow: activeTab === 'transcript' ? '0 1px 2px rgba(27,31,36,0.04)' : 'none'
              }}
            >
              <MessageSquareIcon size={12} color={activeTab === 'transcript' ? theme.accent.green : theme.text.muted} />
              <span>transcript</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              style={{
                flex: 1,
                padding: '4px 6px',
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
                gap: '5px',
                boxShadow: activeTab === 'telemetry' ? '0 1px 2px rgba(27,31,36,0.04)' : 'none'
              }}
            >
              <BarChartIcon size={12} color={activeTab === 'telemetry' ? theme.accent.green : theme.text.muted} />
              <span>telemetry</span>
            </button>
          </div>

          {/* Tab Body */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'narration' && <NarrationPanel />}
            {activeTab === 'transcript' && <TranscriptPanel />}
            {activeTab === 'telemetry' && <TelemetryPanel />}
          </div>
        </aside>
      </div>

      {/* Bottom 60fps Scrubber Timeline */}
      <footer style={{ borderTop: `1px solid ${theme.border.default}`, flexShrink: 0 }}>
        <CanvasTimeline />
      </footer>
    </div>
  );
}
