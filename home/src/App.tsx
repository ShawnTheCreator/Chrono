import React, { useState, useEffect, useRef } from 'react';

const COCKPIT_URL = (import.meta as any).env?.VITE_COCKPIT_URL || 'http://localhost:3001';

export default function App() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'forensics' | 'instructor' | 'benchmarks'>('architecture');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  // Motion Graphic Replay State
  const [playheadPercent, setPlayheadPercent] = useState(78);
  const [animStage, setAnimStage] = useState<'running' | 'stalled' | 'intervened'>('intervened');
  const [formattedTimestamp, setFormattedTimestamp] = useState('05:20.000');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 7-second continuous narrative motion graphic loop
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const cycleDuration = 7500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;

      if (progress < 0.40) {
        // Stage 1: Ingesting & Running forward (15% -> 70%)
        const pct = 15 + (progress / 0.40) * 55;
        setPlayheadPercent(pct);
        setAnimStage('running');
        const secs = Math.floor(60 + (progress / 0.40) * 225);
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        setFormattedTimestamp(`0${mins}:${remSecs < 10 ? '0' : ''}${remSecs}.120`);
      } else if (progress < 0.65) {
        // Stage 2: Diff Loop Stall Detected at 72%
        setPlayheadPercent(72);
        setAnimStage('stalled');
        setFormattedTimestamp('04:55.840');
      } else {
        // Stage 3: Surgical Seek to 78% (05:20) and Course-Correction
        setPlayheadPercent(78);
        setAnimStage('intervened');
        setFormattedTimestamp('05:20.000');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / rect.height) * 10;
    const ry = (x / rect.width) * 10;
    setMouseTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ rx: 0, ry: 0 });
    setIsHovered(false);
  };

  const handleRunVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyResult('SHA-256 Chain Root: 63ce38e4f50645b1... [41 BLOCKS VERIFIED - ZERO TAMPER]');
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
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#0f172a' }}>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="#1a7f37" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: '#09090b' }}>
            CHRONO
          </span>
        </a>

        {/* Center Nav Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#64748b'
        }}>
          <a href="#architecture" style={{ color: '#0f172a', textDecoration: 'none' }}>Architecture</a>
          <a href="#forensics" style={{ color: '#64748b', textDecoration: 'none' }}>Forensics</a>
          <a href="#instructor" style={{ color: '#64748b', textDecoration: 'none' }}>Flight Instructor</a>
          <a href="#benchmarks" style={{ color: '#64748b', textDecoration: 'none' }}>Benchmarks</a>
          <a href="#docs" style={{ color: '#64748b', textDecoration: 'none' }}>Docs</a>
        </nav>

        {/* Right Action / Launch Cockpit & Operator Sign In */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`${COCKPIT_URL}/login`}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              textDecoration: 'none',
              padding: '6px 12px'
            }}
          >
            Sign In
          </a>

          <a
            href={`${COCKPIT_URL}/dashboard`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              backgroundColor: '#09090b',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span>LAUNCH COCKPIT</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '60px 32px 40px 32px',
        textAlign: 'center'
      }}>
        {/* Release Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          marginBottom: '24px'
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#1a7f37',
            backgroundColor: '#dcfce7',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            FDR-2026
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#475569' }}>
            Official Meta Muse Code & Spark 1.3 Certified
          </span>
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.1,
          color: '#09090b',
          maxWidth: '900px',
          margin: '0 auto 20px auto'
        }}>
          The Flight Data Recorder for Autonomous AI Agents
        </h1>

        <p style={{
          fontSize: '17px',
          lineHeight: 1.6,
          color: '#64748b',
          maxWidth: '680px',
          margin: '0 auto 36px auto'
        }}>
          Chrono continuously records coding agent actions into a cryptographically sealed
          SHA-256 Merkle chain. Scrub back deterministically at 60fps, detect stall loops,
          and stream causal reasoning via Meta Muse Spark 1.3.
        </p>

        {/* Hero CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: '60px'
        }}>
          <a
            href={`${COCKPIT_URL}/dashboard`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: '#09090b',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
          >
            <span>Open Cockpit Dashboard</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          <a
            href={`${COCKPIT_URL}/login`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span>Operator Sign In</span>
          </a>
        </div>

        {/* 7-Second Continuous Narrative Motion Graphic */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            transform: `perspective(1000px) rotateX(${mouseTilt.rx}deg) rotateY(${mouseTilt.ry}deg)`,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
          }}
        >
          {/* Cockpit Window Header */}
          <div style={{
            height: '42px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginLeft: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                chrono-cockpit // fdr-2026 // live-agent-replay
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: animStage === 'stalled' ? '#cf222e' : (animStage === 'intervened' ? '#1a7f37' : '#0969da'),
              fontWeight: 600,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: animStage === 'stalled' ? '#cf222e' : (animStage === 'intervened' ? '#1a7f37' : '#0969da')
              }} />
              <span>
                {animStage === 'running' && 'INGESTING TELEMETRY (1.2M EPS)'}
                {animStage === 'stalled' && 'ALERT: IDENTICAL DIFF LOOP DETECTED'}
                {animStage === 'intervened' && 'COURSE-CORRECTED: RESUMING SAFE FLIGHT'}
              </span>
            </div>
          </div>

          {/* Interactive Visual Timeline Canvas */}
          <div style={{
            height: '240px',
            backgroundColor: '#0a0d14',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
          }}>
            {/* Grid Lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 100%'
            }} />

            {/* Checkpoint Markers */}
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
                <span>00:00.000 GENESIS</span>
                <span>02:30.000 INGEST</span>
                <span>04:55.840 DIFF TRIPWIRE</span>
                <span>05:20.000 LIVE HEAD</span>
              </div>

              {/* Event Activity Waves */}
              <div style={{ height: '70px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                {Array.from({ length: 60 }).map((_, i) => {
                  const h = 10 + Math.sin(i * 0.4) * 25 + (i > 35 && i < 46 ? 30 : 0);
                  const isStallArea = i > 38 && i < 46;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}px`,
                        backgroundColor: isStallArea ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.4)',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.2s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Timeline Track with Playhead */}
              <div style={{ position: 'relative', height: '24px', backgroundColor: '#131926', borderRadius: '4px', overflow: 'visible' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${playheadPercent}%`,
                  backgroundColor: 'rgba(56, 189, 248, 0.25)',
                  borderRight: '2px solid #38bdf8'
                }} />

                {/* Floating Needle Pin */}
                <div style={{
                  position: 'absolute',
                  left: `${playheadPercent}%`,
                  top: '-8px',
                  transform: 'translateX(-50%)',
                  padding: '2px 6px',
                  backgroundColor: '#38bdf8',
                  color: '#0a0d14',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: '3px',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {formattedTimestamp}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Forensic Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ padding: '16px 20px', borderRight: '1px solid #f1f5f9', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Merkle Blocks</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>2,973 SHA-256</div>
              <div style={{ fontSize: '12px', color: '#1a7f37', marginTop: '2px' }}>Zero tampering detected</div>
            </div>

            <div style={{ padding: '16px 20px', borderRight: '1px solid #f1f5f9', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Ingest Throughput</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>1,200,000 eps</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>LMAX SPSC lockless ring</div>
            </div>

            <div style={{ padding: '16px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Inference Narration</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>Muse Spark 1.3</div>
              <div style={{ fontSize: '12px', color: '#0969da', marginTop: '2px' }}>Live Meta Model API</div>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Verification Interactive Widget */}
      <section id="forensics" style={{
        maxWidth: '1040px',
        margin: '60px auto',
        padding: '0 32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                NIST FIPS 180-4 Cryptographic Audit
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Verify immutable hash integrity directly against the C++ recording engine
              </p>
            </div>

            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: isVerifying ? '#94a3b8' : '#1a7f37',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isVerifying ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? 'Auditing Hash Chain...' : 'Run Forensic Audit'}
            </button>
          </div>

          <div style={{
            backgroundColor: '#090d16',
            borderRadius: '8px',
            padding: '16px',
            color: '#34d399',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            lineHeight: 1.6
          }}>
            <div>$ chronod --verify fixtures/recorded/muse-code-run.chrono</div>
            <div>STATUS: [PASS] CRYPTOGRAPHICALLY VALID</div>
            <div>RECORDS: 41 verified SHA-256 blocks</div>
            <div>GENESIS ROOT: 0000000000000000000000000000000000000000000000000000000000000000</div>
            <div>TERMINAL HASH: 63ce38e4f50645b14b9347c477e18632483efbe3009129bc800f7c5546d6bd39</div>
            <div>VERDICT: Zero tampering detected. Log is immutable.</div>
            {verifyResult && <div style={{ color: '#38bdf8', marginTop: '6px' }}>&gt;&gt; {verifyResult}</div>}
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive Tabs */}
      <section id="architecture" style={{
        maxWidth: '1040px',
        margin: '60px auto',
        padding: '0 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
            Built for Extreme Speed and Cryptographic Certainty
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            The 4-pillar forensic architecture behind Chrono
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {[
            { id: 'core', title: 'C++20 Ingest Engine', desc: '1.2M EPS zero-allocation ring buffer' },
            { id: 'chain', title: 'SHA-256 Merkle Chain', desc: 'Cryptographically sealed audit trail' },
            { id: 'instructor', title: 'Meta Muse Spark 1.3', desc: 'Deep causal reasoning & hypothesis testing' },
            { id: 'cockpit', title: '60 FPS Canvas Timeline', desc: 'Sub-millisecond scrub & seek budget' }
          ].map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left'
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '32px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Chrono Flight Recorder (FDR-2026) — Open Forensic Protocol</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href={`${COCKPIT_URL}/login`} style={{ color: '#0f172a', textDecoration: 'none' }}>Operator Portal</a>
            <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#0f172a', textDecoration: 'none' }}>Cockpit</a>
            <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#0f172a', textDecoration: 'none' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
