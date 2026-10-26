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
            <span>Flight Data Recorder for Autonomous AI Agents</span>
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
            The Flight Data Recorder for Autonomous Code
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
            Cryptographically sealed hash chains, microsecond time-travel seeks, and real-time causal intervention for autonomous agent workflows.
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
            {[
              { label: 'SHA-256 Chain', badge: 'FORENSIC' },
              { label: '<250ns Seeks', badge: 'REAL-TIME' },
              { label: 'Zero-Drop Ring', badge: 'INGEST' },
              { label: 'Causal Recovery', badge: 'INSTRUCTOR' }
            ].map((chip) => (
              <div
                key={chip.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#334155',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <span>{chip.label}</span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#1a7f37',
                  backgroundColor: '#f0fdf4',
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}>
                  {chip.badge}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: The Chrono Flight Recorder Unit ("The Black Box") */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Subtle Ambient Backlight Glow */}
          <div style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26, 127, 55, 0.08) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            zIndex: 0
          }} />

          {/* Industrial Tactile Hardware Cylinder */}
          <div style={{
            position: 'relative',
            width: '380px',
            height: '490px',
            borderRadius: '64px',
            backgroundColor: '#18181b',
            boxShadow: `
              0 30px 60px -12px rgba(0, 0, 0, 0.25),
              0 18px 36px -18px rgba(0, 0, 0, 0.2),
              inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -8px 24px 0 rgba(0, 0, 0, 0.6)
            `,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '32px 28px',
            zIndex: 1
          }}>
            
            {/* Diamond Micro-Perforated Mesh Texture Overlay (Mirroring Reference Image Mesh) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Top Laser Engraving & Hardware Markings */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#a1a1aa',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  CHRONO FLIGHT RECORDER
                </div>
                <div style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#71717a',
                  fontFamily: '"JetBrains Mono", monospace',
                  marginTop: '2px'
                }}>
                  MODEL FDR-2026 • SEALED MERKLE CORE
                </div>
              </div>

              {/* Status Green LED */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '100px',
                backgroundColor: 'rgba(26, 127, 55, 0.15)',
                border: '1px solid rgba(26, 127, 55, 0.4)'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e'
                }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', fontFamily: '"JetBrains Mono", monospace' }}>
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Center Digital Avionics Display / Real-Time Audit HUD */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(8px)',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#71717a',
                fontFamily: '"JetBrains Mono", monospace',
                marginBottom: '12px'
              }}>
                <span>FORENSIC LEDGER TELEMETRY</span>
                <span style={{ color: '#4ade80' }}>SHA-256 PASS</span>
              </div>

              {/* Live Metric Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#a1a1aa' }}>Verified Blocks:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>832 / 832</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#a1a1aa' }}>Seek Latency:</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>248 ns</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#a1a1aa' }}>Burst Ingest:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>1,000,000 evt/s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#a1a1aa' }}>Ring Buffer Loss:</span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>0 DROPS</span>
                </div>
              </div>

              {/* Visual Waveform Bar */}
              <div style={{ marginTop: '14px', height: '4px', backgroundColor: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '84%', height: '100%', backgroundColor: '#22c55e' }} />
              </div>
            </div>

            {/* Bottom Caution / Laser Warning Markings */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontSize: '9px',
              color: '#52525b',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              <div>
                <div>DO NOT TAMPER</div>
                <div>SECURE HASH CHAIN ENFORCED</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>TERMINAL HASH: 3a37...1a69</div>
                <div>AUTONOMOUS FLIGHT AUDIT</div>
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
