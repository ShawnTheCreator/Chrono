import React, { useState, useEffect, useRef } from 'react';

const COCKPIT_URL = (import.meta as any).env?.VITE_COCKPIT_URL || (import.meta as any).env?.VITE_DASHBOARD_URL || 'https://chrono-dashboard-alpha.vercel.app';

interface CheckpointBlock {
  index: number;
  kind: string;
  timestamp: string;
  actionSummary: string;
  status: string;
  verified: boolean;
  hash?: string;
}

const SAMPLE_BLOCKS: CheckpointBlock[] = [
  {
    index: 1,
    kind: 'SESSION STARTED',
    timestamp: '00:00',
    actionSummary: 'Workspace initialized and recorder connected to agent process',
    status: 'Verified Healthy',
    verified: true,
    hash: '0x8f2c...e14d'
  },
  {
    index: 12,
    kind: 'TOOL EXECUTION',
    timestamp: '02:30',
    actionSummary: 'Executed build target and updated dependencies',
    status: 'Verified Healthy',
    verified: true,
    hash: '0x3a91...b572'
  },
  {
    index: 29,
    kind: 'SAFETY TRIPWIRE',
    timestamp: '04:55',
    actionSummary: 'Paused execution: Agent repeated identical failing edits 3 times',
    status: 'Alert Triggered',
    verified: true,
    hash: '0x7e44...c890'
  },
  {
    index: 41,
    kind: 'TASK COMPLETED',
    timestamp: '05:20',
    actionSummary: 'Verified final codebase state and generated forensic report',
    status: 'Verified Complete',
    verified: true,
    hash: '0x1d08...f633'
  }
];

// Chrono Signature Logo: Stylized "C" with Clock Hands in Meta Metallic Blue
const ChronoLogo = ({ size = 26, color = '#0064E0' }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="chronoHomeGrad" x1="10%" y1="10%" x2="90%" y2="90%">
        <stop offset="0%" stopColor="#0082FB" />
        <stop offset="50%" stopColor="#0064E0" />
        <stop offset="100%" stopColor="#0052B8" />
      </linearGradient>
      <linearGradient id="chronoHomeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#71F6D2" />
        <stop offset="100%" stopColor="#0082FB" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" stroke="url(#chronoHomeGrad)" strokeWidth="6" strokeOpacity="0.3" fill="none" />
    <circle
      cx="50"
      cy="50"
      r="46"
      stroke="url(#chronoHomeGrad)"
      strokeWidth="6"
      strokeDasharray="210 80"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="50" cy="50" r="5" fill="url(#chronoHomeAccent)" />
    <line x1="50" y1="50" x2="50" y2="24" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="50" y1="50" x2="68" y2="50" stroke="url(#chronoHomeAccent)" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const HERO_VIDEOS = [
  '/videos/vid1.mp4',
  '/videos/vid2.mp4',
  '/videos/vid3.mp4',
  '/videos/vid4.mp4'
];

// Forensic Showcase Slides Data (Replaces generic icons & user stories with real interactive capabilities)
const FORENSIC_SLIDES = [
  {
    id: 'ledger',
    badge: 'CAPABILITY 01 // IMMUTABLE LEDGER',
    title: 'Tamper-Proof Audit History',
    tagline: 'Cryptographically sealed in an append-only hash chain',
    description: 'Every tool invocation, bash execution, file patch, and agent transition is sealed in an append-only SHA-256 Merkle chain. Once written, past records cannot be quietly edited, reordered, or deleted, providing internal security and external compliance auditors with mathematical certainty of every action.',
    stats: [
      { label: 'Integrity Seal', val: 'SHA-256 Merkle' },
      { label: 'Seal Latency', val: '< 0.8ms' },
      { label: 'Tamper Resistance', val: '100% Immutable' }
    ],
    demoType: 'ledger'
  },
  {
    id: 'stall',
    badge: 'CAPABILITY 02 // STALL TRIPWIRE',
    title: 'Autonomous Stall Loop Breaker',
    tagline: 'Intercept runaway loops before API budgets vanish',
    description: 'As events flow in real time, Chrono maintains a sliding window over file diffs and tool failures. When the detector spots ping-pong edits, repeated bash errors, or high token consumption with zero forward progress, it triggers an instant stall tripwire, halting the agent before thousands of dollars in cloud tokens burn.',
    stats: [
      { label: 'Loop Detection', val: 'Sliding Window' },
      { label: 'Alert Latency', val: 'Instant (0ms)' },
      { label: 'Token Waste Saved', val: '100% Prevented' }
    ],
    demoType: 'diff'
  },
  {
    id: 'muse',
    badge: 'CAPABILITY 03 // META MUSE SPARK',
    title: 'Cognitive Root-Cause Analysis',
    tagline: 'Plain-English diagnosis with actionable recovery directives',
    description: 'Instead of forcing human operators to dig through 10,000 lines of terminal logs, Chrono passes checkpoint telemetry into Meta Muse Spark. It delivers an instant plain-English post-mortem explaining exactly why the agent got stuck, paired with an exact course-correction directive ready to paste back into the agent.',
    stats: [
      { label: 'Analysis Model', val: 'Muse Spark 1.3' },
      { label: 'Context Horizon', val: 'Full Checkpoint' },
      { label: 'Diagnosis Speed', val: '~22s Live Gen' }
    ],
    demoType: 'forensic'
  },
  {
    id: 'rewind',
    badge: 'CAPABILITY 04 // TIME MACHINE',
    title: 'Surgical Rewind & Safe Branching',
    tagline: 'Jump to any healthy historical moment without data loss',
    description: 'When an agent goes off track, you never need to restart from scratch. Chrono allows you to scrub backward along the verified timeline, preview codebase state at any past checkpoint, inject updated instructions, and fork execution into a clean new branch while preserving the complete historical record.',
    stats: [
      { label: 'Rollback Granularity', val: 'Per-Checkpoint' },
      { label: 'State Restoration', val: 'Zero Data Loss' },
      { label: 'Branching Mode', val: 'Non-Destructive' }
    ],
    demoType: 'rewind'
  }
];

const FAQ_ITEMS = [
  {
    question: "How does Chrono know when an agent is working or stuck?",
    answer: "Chrono attaches directly to the agent's live event stream or JSONL session transcript in real time. It monitors file diffs, tool errors, and token velocity using a high-speed sliding window algorithm. The moment the agent begins looping on identical failed edits, Chrono appends a StallAlert event to the chain."
  },
  {
    question: "Does Chrono slow down my coding agent?",
    answer: "No. The core chronod recorder is written in modern C++20 and ingests events via a zero-copy ring buffer with less than 0.8ms latency and under 0.4% host CPU usage. It operates completely out-of-band."
  },
  {
    question: "What makes the audit history tamper-proof?",
    answer: "Every recorded checkpoint block incorporates the cryptographic SHA-256 hash of its predecessor, creating an unbroken chain. If even a single byte of past tool output or code diff is modified after the fact, the mathematical receipt immediately fails verification."
  },
  {
    question: "Which AI agents and harnesses are supported?",
    answer: "Chrono works universally with any coding agent that writes an event stream or file transcript, including Muse Code, Claude Code, Cursor, OpenDevin, and custom autonomous scripts."
  }
];

export default function App() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSlideAutoplaying, setIsSlideAutoplaying] = useState(true);

  // Unique Navbar Ticker State
  const [navbarTickerIndex, setNavbarTickerIndex] = useState(0);

  // Timeline Scrubber State (Studio Cockpit Demo)
  const [playheadPercent, setPlayheadPercent] = useState(78);
  const [animStage, setAnimStage] = useState<'running' | 'stalled' | 'intervened'>('intervened');
  const [formattedTimestamp, setFormattedTimestamp] = useState('05:20');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Audit State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<CheckpointBlock>(SAMPLE_BLOCKS[2]);

  // Rewind demo state in slide 4
  const [rewindBranchActive, setRewindBranchActive] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [videoIndex]);

  // Unique Navbar Ticker Cycle
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setNavbarTickerIndex((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(tickerInterval);
  }, []);

  // Slide Show Auto-advance
  useEffect(() => {
    if (!isSlideAutoplaying) return;
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FORENSIC_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [isSlideAutoplaying]);

  // Timeline Auto-play Loop
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const cycleDuration = 7500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) % cycleDuration;
      const progress = elapsed / cycleDuration;

      if (progress < 0.40) {
        const pct = 15 + (progress / 0.40) * 55;
        setPlayheadPercent(pct);
        setAnimStage('running');
        const secs = Math.floor(60 + (progress / 0.40) * 225);
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        setFormattedTimestamp(`0${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`);
      } else if (progress < 0.65) {
        setPlayheadPercent(72);
        setAnimStage('stalled');
        setFormattedTimestamp('04:55');
      } else {
        setPlayheadPercent(78);
        setAnimStage('intervened');
        setFormattedTimestamp('05:20');
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setVerifyResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyResult("Cryptographic chain verified: 41 blocks unaltered • Merkle Root: 0x8f2c...e14d");
    }, 850);
  };

  const tickerItems = [
    { tag: 'REC', label: 'FLIGHT BLACK BOX ACTIVE', code: '00:04:55' },
    { tag: 'MERKLE', label: 'BLOCK #41 SEALED', code: '0x8f2c..e14d' },
    { tag: 'SENTRY', label: 'STALL TRIPWIRE ARMED', code: '0.85 RISK DETECTED' },
    { tag: 'STREAM', label: 'STARLETTE 60FPS SSE', code: 'SUB-MS LATENCY' }
  ];

  const currentSlide = FORENSIC_SLIDES[activeSlide];

  return (
    <div style={{
      backgroundColor: '#090D16',
      color: '#F8FAFC',
      minHeight: '100vh',
      fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>

      {/* ─────────────────────────────────────────────────────────────
          1. FLOATING DYNAMIC ISLAND NAVBAR (AWWWARDS UNIQUE DESIGN)
      ───────────────────────────────────────────────────────────── */}
      <header
        className="hero-animate-header"
        style={{
          position: 'fixed',
          top: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: 'calc(100% - 40px)',
          maxWidth: '1240px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(10, 15, 26, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          padding: '10px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Left: Brand + Unique Live Telemetry Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#ffffff'
            }}
          >
            <ChronoLogo size={28} color="#0064E0" />
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em' }}>CHRONO</span>
          </a>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          {/* THE UNIQUE CHANGING NAVBAR ANIMATION: Dynamic Radar & Live Telemetry Ticker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(113, 246, 210, 0.25)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace"
            }}
            title="Real-time flight data recorder status"
          >
            {/* Pulsing Live Radar Indicator */}
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'inline-block',
                animation: 'radarPulse 2s infinite ease-out'
              }}
            />

            {/* Dancing Telemetry Waveform Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', width: '14px' }}>
              <span className="wave-bar-1" style={{ width: '2.5px', backgroundColor: '#71F6D2', borderRadius: '1px', display: 'block' }} />
              <span className="wave-bar-2" style={{ width: '2.5px', backgroundColor: '#0DACF1', borderRadius: '1px', display: 'block' }} />
              <span className="wave-bar-3" style={{ width: '2.5px', backgroundColor: '#0082FB', borderRadius: '1px', display: 'block' }} />
            </div>

            {/* Unique Vertical Sliding Status Ticker */}
            <div style={{ overflow: 'hidden', height: '16px', display: 'flex', alignItems: 'center' }}>
              <span
                key={navbarTickerIndex}
                className="navbar-ticker-text"
                style={{
                  color: '#E2E8F0',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#71F6D2', marginRight: '6px' }}>
                  {tickerItems[navbarTickerIndex].tag}
                </span>
                {tickerItems[navbarTickerIndex].label}
                <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px' }}>
                  [{tickerItems[navbarTickerIndex].code}]
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Minimalist Nav Anchors */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontSize: '13px',
          fontWeight: 500
        }}>
          <a href="#slideshow" style={{ color: '#E2E8F0', textDecoration: 'none', opacity: 0.85, transition: 'opacity 0.2s' }}>
            Forensics
          </a>
          <a href="#cockpit-section" style={{ color: '#E2E8F0', textDecoration: 'none', opacity: 0.85 }}>
            Flight Cockpit
          </a>
          <a href="#architecture" style={{ color: '#E2E8F0', textDecoration: 'none', opacity: 0.85 }}>
            Architecture
          </a>
          <a href="#audit-section" style={{ color: '#E2E8F0', textDecoration: 'none', opacity: 0.85 }}>
            Ledger Audit
          </a>
          <a href="#faq" style={{ color: '#E2E8F0', textDecoration: 'none', opacity: 0.85 }}>
            FAQ
          </a>
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href={`${COCKPIT_URL}/login`}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffffff',
              textDecoration: 'none',
              opacity: 0.85,
              padding: '6px 12px'
            }}
          >
            Sign In
          </a>

          <a
            href={`${COCKPIT_URL}/dashboard`}
            className="btn-press shimmer-hover"
            style={{
              backgroundColor: '#0064E0',
              backgroundImage: 'linear-gradient(135deg, #0082FB 0%, #0064E0 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 100, 224, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <span>Launch Cockpit</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>→</span>
          </a>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. CINEMATIC HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '140px 36px 72px 36px',
        overflow: 'hidden'
      }}>
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop={false}
          muted
          playsInline
          onEnded={() => setVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            backgroundColor: '#090D16',
            filter: 'brightness(0.72) contrast(1.1)'
          }}
        >
          <source src={HERO_VIDEOS[videoIndex]} type="video/mp4" />
        </video>

        {/* Ambient Dark Gradient Vignette */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, rgba(9, 13, 22, 0.25) 0%, rgba(9, 13, 22, 0.85) 75%, #090D16 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Eyebrow Pill */}
          <div
            className="hero-line-1"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#71F6D2',
              marginBottom: '26px'
            }}
          >
            <span>✦</span>
            <span>THE BLACK BOX FLIGHT RECORDER FOR AI AGENTS</span>
          </div>

          {/* High-Contrast Bold Headline */}
          <h1 style={{
            fontSize: '68px',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#FFFFFF',
            margin: '0 0 24px 0'
          }}>
            <span className="hero-line-1">Every decision recorded.</span><br />
            <span className="hero-line-2" style={{
              background: 'linear-gradient(135deg, #71F6D2 0%, #0DACF1 50%, #0082FB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Every runaway loop caught.
            </span><br />
            <span className="hero-line-3" style={{ opacity: 0.9 }}>Complete peace of mind.</span>
          </h1>

          {/* Editorial Subtitle */}
          <p
            className="hero-animate-text"
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#94A3B8',
              maxWidth: '680px',
              margin: '0 auto 40px auto'
            }}
          >
            Chrono continuously captures every file patch, tool invocation, and command output in an immutable cryptographic hash chain. When an agent stalls, Chrono detects the loop, diagnoses the root cause, and hands you the fix.
          </p>

          {/* Action CTAs */}
          <div
            className="hero-animate-cta"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press shimmer-hover"
              style={{
                backgroundColor: '#0064E0',
                backgroundImage: 'linear-gradient(135deg, #0082FB 0%, #0064E0 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '14px 34px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(0, 100, 224, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <span>Explore Flight Cockpit</span>
              <span>→</span>
            </a>

            <a
              href="https://github.com/ShawnTheCreator/Chrono"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span>View Source on GitHub</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>↗</span>
            </a>
          </div>

          {/* Video Selector Dots */}
          <div
            className="hero-animate-dots"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '56px'
            }}
          >
            {HERO_VIDEOS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setVideoIndex(idx)}
                aria-label={`Switch to video background ${idx + 1}`}
                className="btn-press"
                style={{
                  width: videoIndex === idx ? '28px' : '8px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: videoIndex === idx ? '#71F6D2' : 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. AWWWARDS FORENSIC SHOWCASE SLIDESHOW
          (Replaces generic icons, "CHRONO IN ACTION", and "SECURE AND IN CONTROL")
      ───────────────────────────────────────────────────────────── */}
      <section
        id="slideshow"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '110px 36px 90px 36px'
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#71F6D2',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              01 // FLIGHT DECK FORENSICS
            </div>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              margin: 0
            }}>
              See how Chrono protects your agent workflows
            </h2>
          </div>

          {/* Autoplay / Manual Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsSlideAutoplaying(!isSlideAutoplaying)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isSlideAutoplaying ? '#10B981' : '#64748B' }} />
              {isSlideAutoplaying ? 'AUTOPLAY ON' : 'PAUSED'}
            </button>

            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? FORENSIC_SLIDES.length - 1 : prev - 1))}
              aria-label="Previous slide"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              ←
            </button>

            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % FORENSIC_SLIDES.length)}
              aria-label="Next slide"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Slide Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {FORENSIC_SLIDES.map((slide, idx) => {
            const isCurrent = activeSlide === idx;
            return (
              <div
                key={slide.id}
                onClick={() => {
                  setActiveSlide(idx);
                  setIsSlideAutoplaying(false);
                }}
                style={{
                  backgroundColor: isCurrent ? 'rgba(0, 100, 224, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent ? '1px solid #0082FB' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Active progress bar indicator */}
                {isCurrent && isSlideAutoplaying && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    backgroundColor: 'rgba(0, 130, 251, 0.08)',
                    zIndex: 0
                  }} />
                )}

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isCurrent ? '#71F6D2' : '#64748B',
                    marginBottom: '4px'
                  }}>
                    0{idx + 1} //
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isCurrent ? '#FFFFFF' : '#94A3B8'
                  }}>
                    {slide.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slide Stage Deck: 2-Column High-Craft Visualizer */}
        <div style={{
          backgroundColor: '#0E1424',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: '56px',
          alignItems: 'center'
        }}>
          {/* Left Column: Editorial Explanation & Proof Stats */}
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#0DACF1',
              letterSpacing: '0.08em',
              marginBottom: '10px'
            }}>
              {currentSlide.badge}
            </div>

            <h3 style={{
              fontSize: '34px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              lineHeight: 1.18,
              margin: '0 0 12px 0'
            }}>
              {currentSlide.title}
            </h3>

            <div style={{
              fontSize: '15px',
              color: '#71F6D2',
              fontWeight: 600,
              marginBottom: '18px'
            }}>
              {currentSlide.tagline}
            </div>

            <p style={{
              fontSize: '15px',
              color: '#94A3B8',
              lineHeight: 1.65,
              margin: '0 0 32px 0'
            }}>
              {currentSlide.description}
            </p>

            {/* Metric Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {currentSlide.stats.map((st, sidx) => (
                <div key={sidx}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>{st.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', marginTop: '4px' }}>{st.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Bespoke Visualizer (NO generic SVG circles) */}
          <div style={{
            backgroundColor: '#060911',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)'
          }}>
            {/* Visualizer Window Header */}
            <div style={{
              backgroundColor: '#0A0F1D',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#94A3B8',
                  marginLeft: '8px'
                }}>
                  chrono-engine // {currentSlide.id}.telemetry
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#71F6D2',
                backgroundColor: 'rgba(113, 246, 210, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                SEALED
              </span>
            </div>

            {/* Visualizer Body by Slide Type */}
            <div style={{ padding: '24px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* SLIDE 0: MERKLE LEDGER STREAM */}
              {activeSlide === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>// HASH CHAIN VERIFIED BLOCKS</div>
                  {[
                    { blk: 39, hash: '0x32c1..90fa', evt: 'DIFF_APPLIED (auth/login.py)', status: 'SEALED' },
                    { blk: 40, hash: '0x17b4..008e', evt: 'TOOL_EXEC (pytest -v tests/)', status: 'SEALED' },
                    { blk: 41, hash: '0x8f2c..e14d', evt: 'STALL_ALERT (3x identical edit)', status: 'TRIPWIRE' }
                  ].map((b) => (
                    <div
                      key={b.blk}
                      style={{
                        backgroundColor: b.blk === 41 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                        border: b.blk === 41 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#0DACF1' }}>BLOCK #{b.blk}</span>
                        <span style={{ color: '#E2E8F0' }}>{b.evt}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748B', fontSize: '11px' }}>{b.hash}</span>
                        <span style={{
                          fontSize: '10px',
                          color: b.blk === 41 ? '#EF4444' : '#10B981',
                          fontWeight: 700
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '11px',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>✓ Merkle Root: 0x8f2ce14da983b7</span>
                    <span>100% Tamper Proof</span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: RUNAWAY LOOP DIFF COMPARISON */}
              {activeSlide === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#FCA5A5',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>⚠️ STALL ALERT: 3X IDENTICAL DIFFS DETECTED</span>
                    <span style={{ color: '#EF4444' }}>HALTED AT 04:55</span>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '11px',
                    lineHeight: 1.6,
                    color: '#94A3B8'
                  }}>
                    <div style={{ color: '#64748B' }}>--- a/core/token_auth.py (Cycle 1 vs Cycle 2 vs Cycle 3)</div>
                    <div style={{ color: '#EF4444' }}>- if not token or token == &apos;invalid&apos;: raise AuthError()</div>
                    <div style={{ color: '#10B981' }}>+ if token is None or len(token) == 0: raise AuthError()</div>
                    <div style={{ color: '#EF4444', marginTop: '4px' }}>// Detected exact same diff reverted and re-applied 3x</div>
                    <div style={{ color: '#71F6D2' }}>// Velocity: 0 progress / 2,400 tokens burned</div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#94A3B8',
                    paddingTop: '6px'
                  }}>
                    <span>Risk Score: <strong style={{ color: '#EF4444' }}>0.85 (STALL_RISK)</strong></span>
                    <span>Action: <strong>Circuit Breaker Tripped</strong></span>
                  </div>
                </div>
              )}

              {/* SLIDE 2: META MUSE SPARK FORENSICS */}
              {activeSlide === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{
                    backgroundColor: 'rgba(13, 172, 241, 0.12)',
                    border: '1px solid rgba(13, 172, 241, 0.3)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{ color: '#71F6D2', fontSize: '10px', marginBottom: '2px' }}>// META MUSE SPARK LIVE INFERENCE RECEIPT</div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700 }}>Model: muse-spark-1.3 • Latency: 22.2s</div>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#E2E8F0'
                  }}>
                    <div style={{ color: '#0DACF1', fontWeight: 600, marginBottom: '6px' }}>Headline Diagnosis:</div>
                    <div style={{ color: '#F1F5F9', marginBottom: '10px' }}>
                      &quot;Added unthrottled identical-diff alert without recovery, risking bus spam.&quot;
                    </div>
                    <div style={{ color: '#10B981', fontWeight: 600, marginBottom: '4px' }}>Prescribed Directive:</div>
                    <div style={{ color: '#94A3B8', fontSize: '11px' }}>
                      &quot;Stop editing token_auth.py. The issue is in test_index.cpp line 38 where result variable was unused.&quot;
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                    <span>Prompt Tokens: 506</span>
                    <span>Completion: 1,751</span>
                    <span style={{ color: '#10B981' }}>Est Cost: $0.0011</span>
                  </div>
                </div>
              )}

              {/* SLIDE 3: SURGICAL TIMELINE REWIND */}
              {activeSlide === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>// CODEBASE REWIND &amp; BRANCH SELECTOR</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      backgroundColor: rewindBranchActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: rewindBranchActive ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <div>
                        <div style={{ color: '#71F6D2', fontWeight: 700 }}>Checkpoint #28 (04:15)</div>
                        <div style={{ color: '#94A3B8', fontSize: '11px' }}>Healthy Build Before Infinite Loop</div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#10B981',
                        color: '#090D16',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}>
                        {rewindBranchActive ? 'FORK RESTORED' : 'RESTORE TARGET'}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      opacity: rewindBranchActive ? 0.4 : 1
                    }}>
                      <div>
                        <div style={{ color: '#EF4444' }}>Checkpoint #29 (04:55)</div>
                        <div style={{ color: '#64748B' }}>Runaway Loop Detected (Abandoned)</div>
                      </div>
                      <span style={{ color: '#EF4444' }}>PRUNED</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setRewindBranchActive(!rewindBranchActive)}
                    style={{
                      backgroundColor: '#0064E0',
                      border: 'none',
                      color: '#ffffff',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>↺</span>
                    <span>{rewindBranchActive ? 'Reset Simulation' : 'Execute Surgical Rewind to #28'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. STUDIO-GRADE INTERACTIVE FLIGHT COCKPIT
      ───────────────────────────────────────────────────────────── */}
      <section
        id="cockpit-section"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 36px 90px 36px'
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#71F6D2',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            INTERACTIVE FLIGHT COCKPIT
          </div>
          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            margin: '0 0 10px 0'
          }}>
            Smooth, instant timeline inspection
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', margin: 0, maxWidth: '720px' }}>
            Directly attached to your agent&apos;s live execution stream. Drag the playhead to inspect code diffs, verify tool receipts, or observe stall alerts as they fire.
          </p>
        </div>

        {/* Cockpit Shell */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: '#0E1424',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Top Console Bar */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
              <span style={{
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: '#E2E8F0'
              }}>
                session_04n112tt8a // refactor_auth_pipeline.py
              </span>
            </div>

            {/* Dynamic Status Callout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {animStage === 'stalled' && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.18)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  ⚠️ TRIPWIRE: STALL LOOP DETECTED (3X REPEAT)
                </span>
              )}
              {animStage === 'intervened' && (
                <span style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  ✓ RECOVERY INJECTED &bull; COMPLETED
                </span>
              )}
              <span style={{
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#71F6D2',
                fontWeight: 700
              }}>
                {formattedTimestamp} / 05:20
              </span>
            </div>
          </div>

          {/* Timeline Visual Track */}
          <div style={{ padding: '36px 32px' }}>
            {/* Timeline Scrub Track */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setPlayheadPercent(pct);
                setIsAutoPlaying(false);
              }}
              style={{
                position: 'relative',
                height: '48px',
                backgroundColor: 'rgba(0,0,0,0.45)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                marginBottom: '28px'
              }}
            >
              {/* Stall zone highlight */}
              <div style={{
                position: 'absolute',
                left: '68%',
                width: '12%',
                top: 0,
                bottom: 0,
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                borderLeft: '1px dashed #EF4444',
                borderRight: '1px dashed #EF4444'
              }} />

              {/* Checkpoint Pins */}
              {SAMPLE_BLOCKS.map((blk) => {
                const leftPct = blk.index === 1 ? 4 : blk.index === 12 ? 35 : blk.index === 29 ? 72 : 94;
                const isSelected = selectedBlock.index === blk.index;
                return (
                  <div
                    key={blk.index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlock(blk);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isSelected ? '24px' : '18px',
                      height: isSelected ? '24px' : '18px',
                      borderRadius: '50%',
                      backgroundColor: blk.kind.includes('SAFETY') ? '#EF4444' : isSelected ? '#0082FB' : '#0DACF1',
                      border: '3px solid #090D16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#ffffff',
                      zIndex: 3,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 12px #0082FB' : 'none'
                    }}
                    title={`Checkpoint #${blk.index}: ${blk.kind}`}
                  >
                    #{blk.index}
                  </div>
                );
              })}

              {/* Scrub Playhead Indicator */}
              <div style={{
                position: 'absolute',
                left: `${playheadPercent}%`,
                top: '-6px',
                bottom: '-6px',
                width: '3px',
                backgroundColor: '#71F6D2',
                boxShadow: '0 0 14px #71F6D2',
                zIndex: 4,
                pointerEvents: 'none'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#71F6D2',
                  color: '#090D16',
                  fontSize: '10px',
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {formattedTimestamp}
                </div>
              </div>
            </div>

            {/* Playhead Controls & Inspector Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '24px',
              alignItems: 'center'
            }}>
              {/* Selected Checkpoint Inspector */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px'
              }}>
                <div style={{ color: '#64748B', marginBottom: '4px' }}>
                  // Selected Block #{selectedBlock.index} &bull; {selectedBlock.kind} [{selectedBlock.timestamp}]
                </div>
                <div style={{ color: '#E2E8F0', marginBottom: '6px' }}>
                  <span style={{ color: '#0DACF1' }}>Action:</span> {selectedBlock.actionSummary}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
                  <span style={{ color: '#10B981' }}>✓ Integrity: Verified Unaltered</span>
                  <span style={{ color: '#64748B' }}>Hash: {selectedBlock.hash || '0x8f2c..e14d'}</span>
                </div>
              </div>

              {/* Interactive Scrub Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isAutoPlaying ? 'Pause Playback' : 'Resume Playback'}
                </button>

                <a
                  href={`${COCKPIT_URL}/dashboard`}
                  style={{
                    backgroundColor: '#0064E0',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0, 100, 224, 0.35)'
                  }}
                >
                  Open Live Cockpit →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ENGINE ARCHITECTURE & FLEET GOVERNANCE
          (Replaces generic "CHRONO FOR ENTERPRISE" & "TRY CHRONO")
      ───────────────────────────────────────────────────────────── */}
      <section
        id="architecture"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 36px 90px 36px'
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#71F6D2',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            02 // ENGINE ARCHITECTURE
          </div>
          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            margin: '0 0 10px 0'
          }}>
            Zero-overhead C++ core. Uncompromising agent safety.
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', margin: 0, maxWidth: '720px' }}>
            Built as a native flight recorder that tails your agent&apos;s event stream out-of-band. Zero runtime dependencies, sub-millisecond cryptographic sealing, and direct streaming to your cockpit.
          </p>
        </div>

        {/* 3-Column Bento Tech Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#0E1424',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#0DACF1', marginBottom: '8px' }}>
                SUBSYSTEM 01 // CORE
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0' }}>
                chronod C++20 Daemon
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                High-throughput zero-copy ring buffer with native Linux/macOS/Windows filesystem event listeners. Captures thousands of events per second with under 0.4% host CPU usage.
              </p>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '12px', color: '#71F6D2', fontFamily: "'JetBrains Mono', monospace" }}>
              Latency: &lt; 0.8ms &bull; Zero Overhead
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#0E1424',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#71F6D2', marginBottom: '8px' }}>
                SUBSYSTEM 02 // STREAMING
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0' }}>
                Starlette 60fps SSE Bus
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                Low-latency Server-Sent Events bridge that broadcasts sealed Merkle blocks and stall tripwire interrupts directly into the Next.js visual cockpit at 60fps.
              </p>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '12px', color: '#0DACF1', fontFamily: "'JetBrains Mono', monospace" }}>
              Protocol: SSE + IPC &bull; 60fps Stream
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#0E1424',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#F5A3E0', marginBottom: '8px' }}>
                SUBSYSTEM 03 // INTELLIGENCE
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0' }}>
                Meta Muse Spark Pipeline
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                On-demand cognitive diagnostics engine powered by Muse Spark. Translates token velocity dips and recurring error stacks into human-actionable directives.
              </p>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '12px', color: '#F5A3E0', fontFamily: "'JetBrains Mono', monospace" }}>
              Inference: Meta AI Model API
            </div>
          </div>
        </div>

        {/* Live Terminal Spec Window */}
        <div style={{
          backgroundColor: '#060911',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          lineHeight: 1.6
        }}>
          <div style={{ color: '#64748B', marginBottom: '8px' }}>// Terminal: Launching chronod flight recorder on live agent session</div>
          <div><span style={{ color: '#10B981' }}>$</span> <span style={{ color: '#E2E8F0' }}>chronod --record --watch ./agent_transcript.jsonl --tripwire 0.85</span></div>
          <div style={{ color: '#0DACF1', marginTop: '6px' }}>[chronod] Initialized ring buffer (capacity: 65,536 events)</div>
          <div style={{ color: '#71F6D2' }}>[chronod] Merkle root established: 0x8f2ce14da983b7</div>
          <div style={{ color: '#E2E8F0' }}>[chronod] Attached to agent PID 4819 &bull; Zero overhead mode active</div>
          <div style={{ color: '#EF4444', marginTop: '4px' }}>[sentry] Checkpoint #29: Stall pattern detected (3x identical edits) &rarr; Paused</div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. VERIFIED AUDIT LEDGER
      ───────────────────────────────────────────────────────────── */}
      <section
        id="audit-section"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 36px 90px 36px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#71F6D2',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              VERIFIED AUDIT LOG
            </div>
            <h2 style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              margin: '0 0 10px 0'
            }}>
              Tamper-proof history inspector
            </h2>
            <p style={{ fontSize: '16px', color: '#94A3B8', margin: 0, maxWidth: '640px' }}>
              Inspect permanently recorded checkpoints. Click any block to view its cryptographic signature or run a live integrity check over the entire hash chain.
            </p>
          </div>

          <button
            onClick={handleVerifyLedger}
            disabled={isVerifying}
            className="btn-press"
            style={{
              backgroundColor: isVerifying ? '#1E293B' : '#0064E0',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isVerifying ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Ledger Cryptography'}</span>
          </button>
        </div>

        {/* Verification Toast Banner */}
        {verifyResult && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            color: '#A7F3D0',
            fontSize: '13px',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>✓ {verifyResult}</span>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>PROOF VALIDATED</span>
          </div>
        )}

        {/* Audit Log Table */}
        <div style={{
          backgroundColor: '#0E1424',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          overflow: 'hidden'
        }}>
          {SAMPLE_BLOCKS.map((blk, idx) => {
            const isSelected = selectedBlock.index === blk.index;
            return (
              <div
                key={blk.index}
                onClick={() => setSelectedBlock(blk)}
                style={{
                  padding: '20px 24px',
                  borderBottom: idx < SAMPLE_BLOCKS.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                  backgroundColor: isSelected ? 'rgba(0, 100, 224, 0.12)' : 'transparent',
                  display: 'grid',
                  gridTemplateColumns: '100px 180px 1fr 140px',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '13px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: isSelected ? '#71F6D2' : '#0DACF1'
                }}>
                  #{blk.index} ({blk.timestamp})
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: blk.kind.includes('SAFETY') ? '#EF4444' : '#E2E8F0'
                }}>
                  {blk.kind}
                </div>

                <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                  {blk.actionSummary}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: blk.kind.includes('SAFETY') ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                    color: blk.kind.includes('SAFETY') ? '#EF4444' : '#10B981',
                    fontWeight: 600
                  }}>
                    {blk.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. CORE CAPABILITIES & PRODUCT GUARANTEES
      ───────────────────────────────────────────────────────────── */}
      <section
        id="capabilities"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 36px 90px 36px'
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#71F6D2',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            CORE CAPABILITIES
          </div>
          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            margin: '0 0 10px 0'
          }}>
            Built for complete visibility and control
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', margin: 0, maxWidth: '720px' }}>
            Everything you need to supervise, debug, and govern autonomous agents in development and production.
          </p>
        </div>

        {/* 4 Precision Capability Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            {
              num: '01',
              title: 'Continuous Flight Recording',
              color: '#0DACF1',
              desc: 'Captures every tool call, file edit, command output, and prompt transition in real time with zero slowdown on your agent’s execution.'
            },
            {
              num: '02',
              title: 'Permanent Tamper-Proof Logs',
              color: '#10B981',
              desc: 'Maintains an immutable record of every step taken. History cannot be silently modified or erased, ensuring reliable compliance and audit trails.'
            },
            {
              num: '03',
              title: 'Automatic Root-Cause Diagnosis',
              color: '#F5A3E0',
              desc: 'Translates complex failures into clear explanations. Automatically analyzes why an agent stalled or failed and suggests actionable fixes.'
            },
            {
              num: '04',
              title: 'Instant Rewind & Safe Branching',
              color: '#0082FB',
              desc: 'Scrub back to any healthy checkpoint, inject updated instructions, and fork execution cleanly without having to restart from scratch.'
            }
          ].map((cap) => (
            <div
              key={cap.num}
              style={{
                backgroundColor: '#0E1424',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '30px'
              }}
            >
              <div style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: cap.color,
                marginBottom: '8px'
              }}>
                CAPABILITY {cap.num}
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                {cap.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                {cap.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 5 Product Guarantees Bar */}
        <div style={{
          backgroundColor: '#0A0E1A',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '28px 36px'
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            marginBottom: '16px',
            letterSpacing: '0.08em'
          }}>
            CHRONO PRODUCT GUARANTEES
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>PERFORMANCE</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>Zero Overhead</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>&lt; 0.4% host CPU</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>SCRUBBING</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>Instant Rewind</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Jump to any checkpoint</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>COST SHIELD</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>Circuit Breakers</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Prevents loop runaway</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>SECURITY</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>Tamper-Proof</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Verifiable audit trails</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontFamily: "'JetBrains Mono', monospace" }}>COMPATIBILITY</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>Universal</div>
              <div style={{ fontSize: '12px', color: '#0DACF1', marginTop: '2px' }}>Any agent harness or CLI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FREQUENTLY ASKED QUESTIONS
      ───────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 36px 90px 36px'
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#71F6D2',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            margin: 0
          }}>
            Everything you need to know
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                style={{
                  backgroundColor: '#0E1424',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '22px 26px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    {item.question}
                  </h3>
                  <span style={{ fontSize: '16px', color: '#0DACF1' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                {isOpen && (
                  <p style={{
                    fontSize: '14px',
                    color: '#94A3B8',
                    lineHeight: 1.65,
                    margin: '14px 0 0 0'
                  }}>
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. HIGH-IMPACT FINALE BANNER & MINIMALIST FOOTER
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 100px 36px'
      }}>
        <div style={{
          backgroundColor: '#0E1424',
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0, 130, 251, 0.25) 0%, transparent 70%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '28px',
          padding: '72px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ChronoLogo size={42} color="#0082FB" />
          </div>

          <h2 style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '0 0 16px 0'
          }}>
            Ready to take control of your autonomous agents?
          </h2>

          <p style={{
            fontSize: '17px',
            color: '#94A3B8',
            maxWidth: '600px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Seal your agent runs in an immutable black box. Detect runaway loops in real time, obtain instant Meta Muse Spark diagnoses, and rewind safely with zero data loss.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press shimmer-hover"
              style={{
                backgroundColor: '#0064E0',
                backgroundImage: 'linear-gradient(135deg, #0082FB 0%, #0064E0 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '14px 34px',
                borderRadius: '9999px',
                boxShadow: '0 4px 18px rgba(0, 100, 224, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Launch Cockpit →
            </a>

            <a
              href={`${COCKPIT_URL}/login`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
                padding: '14px 28px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.14)'
              }}
            >
              Operator Portal
            </a>
          </div>
        </div>

        {/* Minimalist Studio Footer */}
        <footer style={{
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px',
          color: '#64748B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChronoLogo size={20} color="#0082FB" />
            <span style={{ fontWeight: 700, color: '#E2E8F0' }}>CHRONO</span>
            <span>&bull;</span>
            <span>Flight Data Recorder for Autonomous Agents</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#94A3B8', textDecoration: 'none' }}>Flight Cockpit</a>
            <a href={`${COCKPIT_URL}/login`} style={{ color: '#94A3B8', textDecoration: 'none' }}>Operator Portal</a>
            <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', textDecoration: 'none' }}>GitHub</a>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10B981', fontSize: '11px' }}>
              REC ACTIVE // V2.4
            </span>
          </div>
        </footer>
      </section>
    </div>
  );
}
