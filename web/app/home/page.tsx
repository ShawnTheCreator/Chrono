'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'forensics' | 'instructor' | 'benchmarks'>('architecture');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const handleVerifyDemo = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyResult('SHA-256 Chain Root: 3a37187767775b2c... [832 BLOCKS VERIFIED - ZERO TAMPER]');
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: `
        linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '36px 36px',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "IBM Plex Sans", sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo / Aperture Mark */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#0f172a' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Minimalist Aperture Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="#1a7f37" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: '#09090b' }}>
            CHRONO
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#64748b'
        }}>
          <a href="#architecture" style={{ color: '#0f172a', textDecoration: 'none', transition: 'color 0.15s ease' }}>Architecture</a>
          <a href="#forensics" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>Forensics</a>
          <a href="#instructor" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>Flight Instructor</a>
          <a href="#benchmarks" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>Benchmarks</a>
          <a href="#docs" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}>Docs</a>
        </nav>

        {/* Right Action / Cockpit Launch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#09090b',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              transition: 'all 0.15s ease'
            }}
          >
            <span>LAUNCH COCKPIT</span>
            <span style={{ color: '#94a3b8' }}>|</span>
            {/* Hamburger Icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Hero Section (Split Layout matching Reference Design) */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 32px 100px 32px',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        gap: '48px',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)'
      }}>
        
        {/* Left Column: Hero Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          
          {/* Subtle Top Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            marginBottom: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a7f37', display: 'inline-block' }} />
            <span>Next-Gen Agent Observability</span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: '64px',
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color: '#09090b',
            margin: '0 0 24px 0',
            maxWidth: '580px'
          }}>
            Elevate Your Coding Agents
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            lineHeight: 1.55,
            color: '#64748b',
            margin: '0 0 36px 0',
            maxWidth: '510px',
            fontWeight: 400
          }}>
            Deterministic execution replay, instant microsecond time-travel, and automated course-correction for autonomous development.
          </p>

          {/* Pill Action Button (Matching Reference Button Style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '64px' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#09090b',
                color: '#ffffff',
                padding: '8px 8px 8px 24px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(9, 9, 11, 0.15)',
                transition: 'transform 0.15s ease, background-color 0.15s ease'
              }}
            >
              <span>Get Started</span>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>

            <button
              onClick={handleVerifyDemo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#09090b',
                padding: '12px 20px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {isVerifying ? 'Computing SHA-256...' : 'Verify Merkle Receipt'}
            </button>
          </div>

          {verifyResult && (
            <div style={{
              marginBottom: '32px',
              padding: '10px 14px',
              backgroundColor: '#dafbe1',
              border: '1px solid #1a7f37',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#1a7f37',
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600
            }}>
              ✓ {verifyResult}
            </div>
          )}

          {/* Bottom Feature Chips Row (Matching [Smart] [Safe] [Secure] [Comfort] from Reference) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Deterministic', 'Real-Time', 'Audit-Ready', 'Resilient'].map((chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '100px',
                  padding: '7px 18px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#334155',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <span>{chip}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Interactive Chrono Replay & Course-Correction Hero Visual */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {/* Subtle Ambient Backlight Glow */}
          <div style={{
            position: 'absolute',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26, 127, 55, 0.06) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(50px)',
            zIndex: 0
          }} />

          {/* Floating Application Window */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '540px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.12), 0 10px 25px -5px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            zIndex: 1,
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            
            {/* Window Title Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: 500 }}>
                  chrono / session / loop-recovery-demo
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: '#1a7f37',
                fontWeight: 600,
                backgroundColor: '#dafbe1',
                padding: '2px 8px',
                borderRadius: '100px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a7f37' }} />
                <span>REPLAY 05:20</span>
              </div>
            </div>

            {/* File Path Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#09090b', fontWeight: 600 }}>core/src/stall_detector.cpp</span>
                <span style={{ color: '#64748b', fontSize: '11px' }}>chk_04n112tt8a</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ color: '#1a7f37' }}>+4</span>
                <span style={{ color: '#cf222e' }}>-2</span>
              </div>
            </div>

            {/* Code Diff Surface */}
            <div style={{
              padding: '12px 0',
              backgroundColor: '#ffffff',
              fontSize: '12px',
              lineHeight: 1.6
            }}>
              {/* Context Line 1 */}
              <div style={{ display: 'flex', padding: '1px 16px', color: '#64748b' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#94a3b8' }}>34</span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#94a3b8' }}>34</span>
                <span style={{ color: '#334155' }}>uint64_t patch_hash = compute_diff_hash(patch);</span>
              </div>
              {/* Context Line 2 */}
              <div style={{ display: 'flex', padding: '1px 16px', color: '#64748b' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#94a3b8' }}>35</span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#94a3b8' }}>35</span>
                <span style={{ color: '#334155' }}>recent_diff_hashes_.push_back(patch_hash);</span>
              </div>
              {/* Deletion Line 1 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#ffebe9', color: '#cf222e' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#cf222e' }}>36</span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span>- // Unbounded repetition check failed to trigger</span>
              </div>
              {/* Deletion Line 2 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#ffebe9', color: '#cf222e' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#cf222e' }}>37</span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span>- size_t count = count_occurrences(patch_hash);</span>
              </div>
              {/* Addition Line 1 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#e6ffec', color: '#1a7f37' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#1a7f37' }}>36</span>
                <span>+ if (count &gt;= threshold_cycles_) &#123;</span>
              </div>
              {/* Addition Line 2 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#e6ffec', color: '#1a7f37' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#1a7f37' }}>37</span>
                <span>+ &nbsp;&nbsp;&nbsp;&nbsp;StallAlert alert&#123;StallPattern::IDENTICAL_DIFF_LOOP&#125;;</span>
              </div>
              {/* Addition Line 3 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#e6ffec', color: '#1a7f37' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#1a7f37' }}>38</span>
                <span>+ &nbsp;&nbsp;&nbsp;&nbsp;bus_.publish(alert);</span>
              </div>
              {/* Addition Line 4 */}
              <div style={{ display: 'flex', padding: '1px 16px', backgroundColor: '#e6ffec', color: '#1a7f37' }}>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none' }}></span>
                <span style={{ width: '28px', flexShrink: 0, userSelect: 'none', color: '#1a7f37' }}>39</span>
                <span>+ &#125;</span>
              </div>
            </div>

            {/* Course-Correction Callout Card */}
            <div style={{
              margin: '8px 16px 14px 16px',
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#1a7f37' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>AUTOMATED COURSE-CORRECTION APPLIED</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>&lt;250ns Seek</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: 1.4, fontFamily: 'inherit' }}>
                Arrested repetitive edit cycle. Injected sliding-window threshold patch into agent context.
              </p>
            </div>

            {/* Timeline Scrub Preview Bar */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>00:00.000</span>
                <span style={{ fontWeight: 600, color: '#09090b' }}>05:20.000 (Scrub Point)</span>
                <span>06:40.000</span>
              </div>

              {/* Vector Track & Checkpoints */}
              <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                {/* Horizontal line */}
                <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                {/* Active progress */}
                <div style={{ position: 'absolute', left: 0, width: '78%', height: '3px', backgroundColor: '#1a7f37', borderRadius: '2px' }} />
                
                {/* Checkpoint Diamonds */}
                <div style={{ position: 'absolute', left: '15%', transform: 'rotate(45deg)', width: '8px', height: '8px', backgroundColor: '#64748b' }} title="cp_1" />
                <div style={{ position: 'absolute', left: '38%', transform: 'rotate(45deg)', width: '8px', height: '8px', backgroundColor: '#64748b' }} title="cp_2" />
                <div style={{ position: 'absolute', left: '60%', transform: 'rotate(45deg)', width: '8px', height: '8px', backgroundColor: '#64748b' }} title="cp_3" />
                
                {/* Stall Alert marker */}
                <div style={{ position: 'absolute', left: '72%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#cf222e', color: '#ffffff', fontSize: '9px', fontWeight: 700 }} title="Stall Detected">!</div>

                {/* Active Scrub Needle */}
                <div style={{
                  position: 'absolute',
                  left: '78%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1a7f37', border: '2px solid #ffffff', boxShadow: '0 0 6px rgba(26,127,55,0.6)' }} />
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Architecture Deep Dive Section */}
      <section id="architecture" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 32px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 16px 0', color: '#09090b' }}>
            Engineered for Ground Truth
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Built in C++20 with a lockless atomic ring buffer, cryptographic hash-chaining, and real-time causal replay.
          </p>
        </div>

        {/* 4 Feature Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              title: 'Microsecond Time-Travel',
              desc: 'Scrub instantaneously across hours of agent execution. Hydrate full workspace state and AST diffs in sub-millisecond seeks.',
              stat: '< 250ns seek latency'
            },
            {
              title: 'Tamper-Evident Ledger',
              desc: 'Every mutation, reasoning trace, and bash command is bound into an append-only SHA-256 Merkle chain. Impossible to forge.',
              stat: '100% Cryptographic Proof'
            },
            {
              title: 'Lockless Ingest Engine',
              desc: 'Zero locks, zero dropped events. Sustains 1,000,000 events/second burst loads without stalling the autonomous model.',
              stat: 'Zero drop guarantee'
            },
            {
              title: 'Flight Instructor Interventions',
              desc: 'Detects repetitive hallucination cycles and stalls in real time, injecting surgical course-correction directives.',
              stat: 'Automated stall recovery'
            }
          ].map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '28px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#09090b', margin: '0 0 10px 0' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#64748b', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1a7f37',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {item.stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 32px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: '#09090b' }}>CHRONO</span>
          <span>— Forensic Flight Recorder for AI Agents</span>
        </div>
        <div>
          <Link href="/login" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 600 }}>
            Launch Cockpit →
          </Link>
        </div>
      </footer>
    </div>
  );
}
