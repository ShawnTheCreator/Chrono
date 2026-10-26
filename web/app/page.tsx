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
      background: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Top Header Bar */}
      <header style={{
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        {/* Left: App Brand & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* App Dropdown Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Chrono
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>▾</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: '#e2e8f0' }} />

          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            <span>#</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>sessions</span>
            <span>/</span>
            <span>feat/hash-chain-ingest</span>
            <span>/</span>
            <span style={{ color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '1px 6px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>
              {state.activeCheckpoint?.id || 'chk_04n112tt8a'}
            </span>
            <BookmarkIcon size={12} color="#94a3b8" style={{ marginLeft: 4 }} />
          </div>
        </div>

        {/* Right: Actions, Status & Session Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Minimal clean status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#475569',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            <span>Active</span>
          </div>

          {/* Action icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <button title="Options" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <MoreHorizontalIcon size={14} />
            </button>
            <button title="Session Info" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <InfoIcon size={14} />
            </button>
          </div>

          <div style={{ height: '16px', width: '1px', background: '#e2e8f0' }} />

          <select
            value={currentSessionId}
            onChange={(e) => setCurrentSessionId(e.target.value)}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
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
          width: '50px',
          background: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '14px',
          flexShrink: 0
        }}>
          {/* Top Chrono 'C' Icon */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px'
          }}>
            C
          </div>

          <div style={{ width: '24px', height: '1px', background: '#e2e8f0' }} />

          {/* Icon buttons */}
          <button title="Flight Timeline" style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ClockIcon size={15} color="#2563eb" />
          </button>

          <button title="Code Tree" style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: 'transparent',
            color: '#64748b',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GitBranchIcon size={15} color="#64748b" />
          </button>

          <button title="Forensic Verifier" style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: 'transparent',
            color: '#64748b',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheckIcon size={15} color="#64748b" />
          </button>

          <button title="Add / New Run" style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PlusIcon size={14} color="#475569" />
          </button>

          {/* Bottom Avatar */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>
              MC
            </div>
          </div>
        </aside>

        {/* 2. Left Tree Panel */}
        <div style={{ width: '230px', height: '100%', flexShrink: 0 }}>
          <TreePanel />
        </div>

        {/* 3. Center Code Diff Viewer */}
        <div style={{ flex: 1, height: '100%', borderRight: '1px solid #e2e8f0', minWidth: 0 }}>
          <DiffPanel />
        </div>

        {/* 4. Right Multi-Tab Inspector Panel */}
        <aside style={{ width: '350px', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', flexShrink: 0 }}>
          {/* Pill Tabs Header */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <button
              onClick={() => setActiveTab('narration')}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: '6px',
                border: activeTab === 'narration' ? '1px solid #bfdbfe' : '1px solid transparent',
                background: activeTab === 'narration' ? '#eff6ff' : 'transparent',
                color: activeTab === 'narration' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'narration' ? 700 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <SparklesIcon size={12} color={activeTab === 'narration' ? '#2563eb' : '#64748b'} />
              <span>Instructor</span>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: '6px',
                border: activeTab === 'transcript' ? '1px solid #bfdbfe' : '1px solid transparent',
                background: activeTab === 'transcript' ? '#eff6ff' : 'transparent',
                color: activeTab === 'transcript' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'transcript' ? 700 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <MessageSquareIcon size={12} color={activeTab === 'transcript' ? '#2563eb' : '#64748b'} />
              <span>Transcript</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: '6px',
                border: activeTab === 'telemetry' ? '1px solid #bfdbfe' : '1px solid transparent',
                background: activeTab === 'telemetry' ? '#eff6ff' : 'transparent',
                color: activeTab === 'telemetry' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'telemetry' ? 700 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <BarChartIcon size={12} color={activeTab === 'telemetry' ? '#2563eb' : '#64748b'} />
              <span>Telemetry</span>
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
      <footer style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <CanvasTimeline />
      </footer>
    </div>
  );
}
