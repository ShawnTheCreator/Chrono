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

export default function CockpitDashboard() {
  const [sessions, setSessions] = useState<any[]>([
    { session_id: 'chrono-feature-attempt-1', task_name: '[SYNTHETIC BENCHMARK] C++20 Hash Chain & Ingest (Loop Recovery Demo)' },
    { session_id: 'live-agent-run', task_name: '[LIVE CAPTURE] Real Agent Execution Trace (832 Verified Blocks)' },
    { session_id: 'openrepo-maintenance-run', task_name: '[SYNTHETIC BENCHMARK] OpenRepo Scale Run' }
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 20px',
      background: '#eef2f6',
      overflow: 'hidden'
    }}>
      {/* Floating macOS-Style Window Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1720px',
        height: '100%',
        maxHeight: '940px',
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Top Window Chrome Header */}
        <header style={{
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {/* Left: Window Traffic Lights & App Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* macOS Traffic Lights */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', border: '1px solid #e0443e' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', border: '1px solid #dea123' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', border: '1px solid #1aab29' }} />
            </div>

            <div style={{ height: '16px', width: '1px', background: '#e2e8f0' }} />

            {/* App Dropdown Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Chrono
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>▾</span>
            </div>

            {/* Breadcrumb Path */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <span>#</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>sessions</span>
              <span>/</span>
              <span>feat/hash-chain-ingest</span>
              <span>/</span>
              <span style={{ color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '1px 6px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>
                {state.activeCheckpoint?.id || 'chk_04n112tt8a'}
              </span>
            </div>
          </div>

          {/* Right: Verified Badge & Session Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#15803d',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '3px 10px',
              borderRadius: '9999px'
            }}>
              <span>●</span>
              <span>SHA-256 HASH CHAIN VERIFIED</span>
            </div>

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
            gap: '14px'
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
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              ⏱️
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
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              📂
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
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              🛡️
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
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              +
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
                fontSize: '12px',
                fontWeight: 700
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
          <div style={{ flex: 1, height: '100%', borderRight: '1px solid #e2e8f0', minWidth: 0 }}>
            <DiffPanel />
          </div>

          {/* 4. Right Multi-Tab Inspector Panel */}
          <aside style={{ width: '340px', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', flexShrink: 0 }}>
            {/* Pill Tabs Header (matching reference image) */}
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
                  cursor: 'pointer'
                }}
              >
                🧠 Narration
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
                  cursor: 'pointer'
                }}
              >
                💬 Transcript
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
                  cursor: 'pointer'
                }}
              >
                📊 Telemetry
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
    </div>
  );
}
