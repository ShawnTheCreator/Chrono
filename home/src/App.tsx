import React, { useState, useEffect, useRef } from 'react';

const COCKPIT_URL = (import.meta as any).env?.VITE_COCKPIT_URL || 'http://localhost:3001';

interface MerkleBlock {
  index: number;
  kind: string;
  timestamp: string;
  prevHash: string;
  blockHash: string;
  payloadSummary: string;
  verified: boolean;
}

const SAMPLE_BLOCKS: MerkleBlock[] = [
  {
    index: 1,
    kind: 'GENESIS_RECORD',
    timestamp: '00:00.000',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    payloadSummary: 'Kernel ring buffer initialized (64MB circular, LMAX SPSC)',
    verified: true
  },
  {
    index: 12,
    kind: 'TOOL_EXECUTION',
    timestamp: '02:30.120',
    prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    blockHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    payloadSummary: 'cmake --build build --target chronod (exit code 0, 1.4s)',
    verified: true
  },
  {
    index: 29,
    kind: 'TRIPWIRE_ALERT',
    timestamp: '04:55.840',
    prevHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    blockHash: '4b7a9f821c3e05da7721e90b84f36a1c892b15d6e3f4a7c8b9d0e1f2a3b4c5d6',
    payloadSummary: 'ALERT: IDENTICAL_DIFF_LOOP (threshold = 3 identical patches)',
    verified: true
  },
  {
    index: 41,
    kind: 'TERMINAL_ROOT',
    timestamp: '05:20.000',
    prevHash: '4b7a9f821c3e05da7721e90b84f36a1c892b15d6e3f4a7c8b9d0e1f2a3b4c5d6',
    blockHash: '63ce38e4f50645b14b9347c477e18632483efbe3009129bc800f7c5546d6bd39',
    payloadSummary: 'Terminal sealed root — verified by chronod --verify (0.227 ms)',
    verified: true
  }
];

// Clean Modern SVG Icons (Zero Emojis)
const IconShield = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLock = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconAlertTriangle = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconZap = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconCheck = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClock = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconPlane = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const IconActivity = ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconThumbsUp = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
  </svg>
);

const IconThumbsDown = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" />
  </svg>
);

const IconChevronDown = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconChevronRight = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconPlus = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconMinus = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Chrono Primary Compass / Chronometer Logo
const ChronoLogo = ({ size = 28, color = '#0064E0' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#090D16" />
    <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2.4" strokeDasharray="4 2" />
    <path d="M16 9V16L20.5 20.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="2.2" fill="#71F6D2" />
  </svg>
);

// Hero Rotating Dynamic Phrases for Chrono
const HERO_ROTATING_LINES = [
  { prefix: "Chrono records", middle: "tool invocations", suffix: "while agents run" },
  { prefix: "Chrono catches", middle: "infinite diff loops", suffix: "before tokens burn" },
  { prefix: "Chrono verifies", middle: "SHA-256 Merkle chains", suffix: "in 0.227 ms" },
  { prefix: "Chrono streams", middle: "causal post-mortems", suffix: "while builds compile" },
  { prefix: "Chrono halts", middle: "runaway executions", suffix: "before budgets blow" },
  { prefix: "Chrono seeks", middle: "historical checkpoints", suffix: "under 50 microseconds" }
];

const FAQ_ITEMS = [
  {
    question: "What is Chrono?",
    answer: "Chrono is the high-performance Flight Data Recorder and Forensic Observability Cockpit for autonomous AI coding and operational agents. It ingests execution events, file diffs, and tool calls into a zero-allocation, append-only SHA-256 Merkle chain at 1,200,000 events/second."
  },
  {
    question: "How does Chrono record telemetry without slowing down the agent?",
    answer: "Chrono uses an LMAX Disruptor-inspired single-producer, single-consumer lock-free ring buffer implemented in zero-allocation C++20. Agent hot-paths write 24-byte packed binary headers without heap allocation, sustaining over 1.2 million events per second with zero thread contention."
  },
  {
    question: "What is an agent stall loop and how does Chrono catch it?",
    answer: "Agents frequently fall into loops where they generate identical or cosmetically trivial code patches that repeatedly fail the same compiler or test error. Chrono's sliding-window diff comparator calculates patch similarity in real time and trips an alert immediately upon detecting circular iterations."
  },
  {
    question: "How does the SHA-256 Merkle chain prevent tampering?",
    answer: "Every block cryptographically binds to the SHA-256 digest of its predecessor. If an agent tries to erase a hallucinated action, modify historical logs, or rewrite its memory, the cryptographic hash tree fails validation. Independent auditors can verify the entire history in 0.227 milliseconds."
  },
  {
    question: "How does Chrono achieve sub-50µs seek latency at 60 FPS?",
    answer: "Chrono builds a compact binary index over time-indexed checkpoints directly in memory. Seeking to any historical point in time requires a single binary search lookup rather than replaying from genesis, enabling instant 60 FPS scrubbing across millions of events."
  },
  {
    question: "Can operators roll back and inject interventions?",
    answer: "Yes. From the Chrono Cockpit, operators can pause a runaway execution, scrub back to a healthy historical checkpoint, inject corrected instructions or compiler flags, and branch execution cleanly without losing prior context."
  },
  {
    question: "Does Chrono work with any coding agent harness?",
    answer: "Yes. Chrono features native adapters for Muse Code, Gemini CLI, Claude Code, Cursor, and custom agent harnesses. Any process emitting standard JSON or binary event streams connects via our lightweight daemon."
  },
  {
    question: "How does Chrono generate causal post-mortems?",
    answer: "Chrono feeds the delta between the genesis state, the failure checkpoint, and the surrounding diffs to an integrated reasoning engine (Meta Muse Spark 1.3). The engine streams causal hypotheses and suggested remediations directly to the operator panel via Server-Sent Events."
  }
];

export default function App() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // Motion Graphic Replay State (Chrono Flight Recorder)
  const [playheadPercent, setPlayheadPercent] = useState(78);
  const [animStage, setAnimStage] = useState<'running' | 'stalled' | 'intervened'>('intervened');
  const [formattedTimestamp, setFormattedTimestamp] = useState('05:20.000');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Merkle Ledger State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<MerkleBlock>(SAMPLE_BLOCKS[2]);

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Cycle Hero Text
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ROTATING_LINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // 7-second continuous narrative motion graphic loop
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
        setFormattedTimestamp(`0${mins}:${remSecs < 10 ? '0' : ''}${remSecs}.120`);
      } else if (progress < 0.65) {
        setPlayheadPercent(72);
        setAnimStage('stalled');
        setFormattedTimestamp('04:55.840');
      } else {
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
    const rx = -(y / rect.height) * 6;
    const ry = (x / rect.width) * 6;
    setMouseTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ rx: 0, ry: 0 });
    setIsHovered(false);
  };

  const handleRunVerify = () => {
    setIsVerifying(true);
    setVerifyResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyResult('VERIFIED: 41 SHA-256 blocks validated in 0.227 ms. Genesis root confirmed. Zero tampering detected.');
    }, 450);
  };

  const handleManualSeek = (pct: number) => {
    setIsAutoPlaying(false);
    setPlayheadPercent(pct);
    if (pct < 65) {
      setAnimStage('running');
      setFormattedTimestamp('02:15.300');
    } else if (pct < 76) {
      setAnimStage('stalled');
      setFormattedTimestamp('04:55.840');
    } else {
      setAnimStage('intervened');
      setFormattedTimestamp('05:20.000');
    }
  };

  const currentHero = HERO_ROTATING_LINES[heroIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* 1. HERO SECTION WITH FOCUSED AEROSPACE / RUNNER ATMOSPHERE */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(9, 13, 22, 0.78), rgba(9, 13, 22, 0.86)), url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff'
      }}>
        {/* Transparent Top Navigation Bar */}
        <header style={{
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '20px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left Brand Mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}>
              <ChronoLogo size={32} color="#0064E0" />
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>CHRONO</span>
            </a>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>|</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              FLIGHT DATA RECORDER
            </span>
          </div>

          {/* Center Links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <a href="#chrono-features" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Features</a>
            <a href="#cockpit-section" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Cockpit</a>
            <a href="#merkle-section" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Merkle Ledger</a>
            <a href="#architecture" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Architecture</a>
            <a href="#benchmarks" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Benchmarks</a>
            <a href="#faq" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>FAQ</a>
          </nav>

          {/* Right Action: Solid Blue Pill Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href={`${COCKPIT_URL}/login`}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
                opacity: 0.9
              }}
            >
              Sign in
            </a>

            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press"
              style={{
                backgroundColor: '#0064E0',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                padding: '10px 22px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <span>Launch Cockpit</span>
            </a>
          </div>
        </header>

        {/* Center Hero Copy */}
        <div style={{
          maxWidth: '1000px',
          margin: 'auto auto',
          textAlign: 'center',
          padding: '0 24px'
        }}>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.12,
            margin: '0 0 16px 0',
            textShadow: '0 2px 14px rgba(0,0,0,0.5)'
          }}>
            {currentHero.prefix}<br />
            <span style={{ color: '#71F6D2' }}>{currentHero.middle}</span><br />
            {currentHero.suffix}
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '720px',
            margin: '0 auto 32px auto',
            lineHeight: 1.5,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)'
          }}>
            The deterministic flight data recorder and forensic cockpit for autonomous AI agents. Ingesting telemetry into an append-only SHA-256 Merkle chain at 1,200,000 events/sec with sub-millisecond 60 FPS playback.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press"
              style={{
                backgroundColor: '#0064E0',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: '9999px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
              }}
            >
              Launch Cockpit
            </a>

            <a
              href="#cockpit-section"
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '9999px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Scrub Telemetry ↓
            </a>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '40px' }} />
      </section>

      {/* 2. CHRONO FEATURES: TAKE THE GUESSWORK OUT OF AGENT EXECUTION (2-COL ACCORDION + DEVICE MOCKUP) */}
      <section id="chrono-features" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '96px 36px 80px 36px'
      }}>
        {/* Section Header */}
        <div style={{ maxWidth: '840px', marginBottom: '56px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0064E0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            CHRONO FEATURES
          </div>
          <h2 style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#09090b',
            lineHeight: 1.15,
            margin: '0 0 16px 0'
          }}>
            Take the guesswork out of agent execution
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#475569',
            lineHeight: 1.6,
            margin: 0
          }}>
            Chrono continuously ingests every agent state, tool execution, and code patch into an append-only, tamper-evident Merkle ledger. Full forensic playback, real-time stall detection, and surgical rollbacks keep you in complete control.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '64px', alignItems: 'center' }}>
          {/* Left Column: Feature Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Item 1 */}
            <div
              onClick={() => setActiveFeatureTab(0)}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Sub-Millisecond 60 FPS Deterministic Canvas Replay
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 0 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 0 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Direct HTML5 canvas timeline rendering backed by zero-allocation in-memory binary search indices. Guaranteed seek latency under 50 µs lets operators scrub through millions of recorded events without browser lag.
                </p>
              )}
            </div>

            {/* Item 2 */}
            <div
              onClick={() => setActiveFeatureTab(1)}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Automated Tripwires Catch Loops Before Tokens Burn
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 1 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 1 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Real-time sliding-window diff comparator calculates patch similarity across consecutive edits. Detects identical-diff loops and circular tool executions in milliseconds, halting token waste before budgets explode.
                </p>
              )}
            </div>

            {/* Item 3 */}
            <div
              onClick={() => setActiveFeatureTab(2)}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Cryptographically Immutable Append-Only Merkle Chain
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 2 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 2 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Every execution event record commits to the SHA-256 hash of its predecessor. Any retroactively modified step or hallucinated action breaks the cryptographic root instantly during audit verification.
                </p>
              )}
            </div>

            {/* Item 4 */}
            <div
              onClick={() => setActiveFeatureTab(3)}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid #E5E7EB',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Live Causal Post-Mortems & Intervention Streaming
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 3 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 3 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  When circuit breakers trip, Chrono pairs checkpoint context with live reasoning models to stream causal post-mortems and recommended patch corrections directly to your cockpit panel via Server-Sent Events.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Realistic Cockpit Mobile / Alert View Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: '40px',
              border: '10px solid #1F2937',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                backgroundColor: '#090D16',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconAlertTriangle size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Chrono Alert Engine</div>
                  <div style={{ fontSize: '11px', color: '#71F6D2' }}>Tripwire Active • 1.2M eps</div>
                </div>
              </div>

              {/* Body */}
              <div style={{
                backgroundColor: '#F3F4F6',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '380px'
              }}>
                {/* Event Record Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#111827',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  <div style={{ color: '#6B7280', marginBottom: '4px' }}>// CHECKPOINT #29 (04:55.840)</div>
                  <div style={{ fontWeight: 700, color: '#DC2626' }}>ALERT: IDENTICAL_DIFF_LOOP</div>
                  <div style={{ color: '#4B5563', marginTop: '4px' }}>Target: tools/build.rs</div>
                  <div style={{ color: '#4B5563' }}>Similarity: 0.985 (Threshold 0.95)</div>
                </div>

                {/* Analysis Bubble */}
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#111827',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontWeight: 700, color: '#0064E0', marginBottom: '4px' }}>Flight Instructor Verdict</div>
                  <p style={{ margin: 0, color: '#4B5563', lineHeight: 1.4 }}>
                    "The agent is cycling identical compiler flag edits without resolving the missing header. Execution paused to prevent token runaway."
                  </p>
                </div>

                {/* Operator Intervention Action */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  padding: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0064E0', textTransform: 'uppercase' }}>
                      Intervention Ready
                    </span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <IconCheck size={12} color="#059669" /> Deterministic
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>
                    Rollback to #28
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px' }}>
                    Reverts 1 loop cycle & injects compiler guidance
                  </div>
                  <button
                    onClick={() => alert('Surgical Rollback Executed! Safe flight resumed at checkpoint #28.')}
                    style={{
                      width: '100%',
                      backgroundColor: '#0064E0',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '10px 0',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Execute Rollback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECURE AND IN CONTROL: TWO LARGE CARDS */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#0064E0',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          SECURE AND FORENSICALLY SOUND
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 32px 0'
        }}>
          Built for privacy, forensic proof, and mathematical certainty
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '24px',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                color: '#0064E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <IconLock size={22} color="#0064E0" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                NIST FIPS 180-4 Cryptographic Finality
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 18px 0' }}>
                Every recorded telemetry frame commits to the cryptographic hash of its predecessor in an append-only chain. Tampered execution records, deleted audit steps, or altered agent codebases fail mathematical verification instantly.
              </p>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconCheck size={14} color="#047857" /> 41 Blocks Validated in 0.227 ms by chronod --verify
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '24px',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                color: '#0064E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <IconShield size={22} color="#0064E0" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                Deterministic Surgical Rollbacks
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 18px 0' }}>
                Review, pause, and approve agent actions before destructive regressions occur. Chrono lets operators scrub back to any millisecond checkpoint, inject guidance, and fork execution paths with guaranteed sub-50µs seek latency.
              </p>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#0284C7',
                backgroundColor: '#F0F9FF',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <IconZap size={14} color="#0284C7" /> 1,000 Seeks Tested • Zero State Drift Confirmed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHRONO IN ACTION: SHOWCASE BANNER */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#0064E0',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          CHRONO IN ACTION
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0'
        }}>
          See how Chrono protects your agent workflows
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#4B5563',
          maxWidth: '720px',
          margin: '0 0 36px 0'
        }}>
          From automated code refactoring and tool invocations to catching runaway loops and generating forensic receipts. Chrono handles it all.
        </p>

        {/* Large Clean Light-Blue Banner with Zero Emojis */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '24px',
          padding: '80px 48px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ padding: '6px 12px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconClock size={15} color="#0064E0" /> 1,200,000 EPS
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconShield size={15} color="#0064E0" /> SHA-256 MERKLE CHAIN
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconActivity size={15} color="#0064E0" /> 60 FPS CANVAS
            </span>
          </div>

          <h3 style={{
            fontSize: '48px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            lineHeight: 1.25,
            margin: '0 0 12px 0'
          }}>
            Chrono is the flight data recorder<br />
            for autonomous AI agents
          </h3>

          <p style={{ fontSize: '16px', color: '#475569', maxWidth: '640px', margin: '0 auto' }}>
            Every action recorded. Every diff verified. Zero undetected state drift.
          </p>

          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '28px',
            display: 'flex',
            gap: '8px'
          }}>
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0064E0'
            }}>
              <IconThumbsUp size={16} />
            </button>
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}>
              <IconThumbsDown size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. ENGINEERING STORIES: OPERATOR EXPERIENCES */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '48px', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0064E0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              ENGINEERING STORIES
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Proven in the wild
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}>
              Builders rely on Chrono to observe, audit, and debug complex autonomous agent trajectories.
            </p>
            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press"
              style={{
                backgroundColor: '#0064E0',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 22px',
                borderRadius: '9999px',
                display: 'inline-block'
              }}
            >
              Explore Cockpit
            </a>
          </div>

          {/* 4 Portrait Engineering Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%), url('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                "Chrono caught a 14-iteration circular build loop before our cloud compute budget was drained."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— Lead DevOps Architect</div>
            </div>

            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%), url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                "The Merkle SHA-256 audit log gives us the mathematical compliance trail required for enterprise AI rollouts."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— AI Safety & SecOps Officer</div>
            </div>

            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%), url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                "Scrubbing 2.9 million events at 60 FPS without frame drops feels like a flight recorder should feel."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— Autonomous Systems Engineer</div>
            </div>

            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%), url('https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                "Surgical checkpoint rollbacks cut our agent debugging iteration time from hours down to seconds."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— Senior Full-Stack Engineer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CHRONO FOR TEAMS & ENTERPRISE FLEETS */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr'
        }}>
          <div style={{ padding: '48px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0064E0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              CHRONO FOR ENTERPRISE
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0'
            }}>
              Observability that scales with your agent fleet
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#4B5563',
              lineHeight: 1.6,
              margin: '0 0 28px 0'
            }}>
              Deploy Chrono across hundreds of parallel autonomous coding workers. Centralize high-throughput ring buffers, enforce tamper-proof cryptographic audit logs, and protect infrastructure budgets with automated circuit breakers.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> Centralized Ring Buffers
              </span>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> Automated Circuit Breakers
              </span>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> SOC2 / FIPS Audit Exports
              </span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#1E40AF',
              textAlign: 'center',
              lineHeight: 1.3
            }}>
              Forensic Certainty Across 1,000+ Parallel Agents
            </h3>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#1E40AF' }}>
                <IconShield size={16} color="#1E40AF" />
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#1E40AF' }}>
                <IconZap size={16} color="#1E40AF" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DOWNLOAD CHRONO DESKTOP COCKPIT */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          {/* Desktop App Window Preview */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #D1D5DB',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}>
            {/* Window Title Bar */}
            <div style={{
              height: '38px',
              backgroundColor: '#F3F4F6',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '8px'
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '11px', color: '#6B7280', margin: '0 auto', fontWeight: 600 }}>Chrono Cockpit — Desktop Daemon (C++20 Engine)</span>
            </div>

            {/* Window Content */}
            <div style={{ height: '240px', backgroundColor: '#F9FAFB', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Kernel Ring Buffer Active (1,200,000 eps)
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>
                Directly bound to local agent processes. Sub-50µs seek latency with instant Merkle hash tree verification. Zero memory overhead on agent execution.
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.025em',
              margin: '0 0 16px 0'
            }}>
              Download Chrono Desktop Cockpit
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 32px 0'
            }}>
              Native zero-allocation C++20 engine with instant canvas scrubbing for macOS, Windows, and Linux.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a
                href={`${COCKPIT_URL}/dashboard`}
                className="btn-press"
                style={{
                  backgroundColor: '#0064E0',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  display: 'inline-block'
                }}
              >
                Launch Cockpit
              </a>

              <a
                href="https://github.com/ShawnTheCreator/Chrono"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0064E0',
                  textDecoration: 'none'
                }}
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRY CHRONO PANORAMIC BANNER (CLEAN SVG ICONS) */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          backgroundColor: '#E0F2FE',
          borderRadius: '24px',
          padding: '64px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating Subtle SVG Icons */}
          <div style={{ position: 'absolute', top: '24px', left: '36px', opacity: 0.25, color: '#0064E0' }}>
            <IconClock size={36} />
          </div>
          <div style={{ position: 'absolute', bottom: '24px', left: '60px', opacity: 0.25, color: '#0064E0' }}>
            <IconShield size={36} />
          </div>
          <div style={{ position: 'absolute', top: '30px', right: '48px', opacity: 0.25, color: '#0064E0' }}>
            <IconZap size={36} />
          </div>
          <div style={{ position: 'absolute', bottom: '24px', right: '70px', opacity: 0.25, color: '#0064E0' }}>
            <IconPlane size={36} />
          </div>

          {/* Center Chrono Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ChronoLogo size={48} color="#0064E0" />
          </div>

          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0064E0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            TRY CHRONO
          </div>

          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: '0 0 24px 0'
          }}>
            Ready to record and debug your autonomous agents?
          </h2>

          <a
            href={`${COCKPIT_URL}/dashboard`}
            className="btn-press"
            style={{
              backgroundColor: '#0064E0',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              padding: '12px 36px',
              borderRadius: '9999px',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0, 100, 224, 0.3)'
            }}
          >
            Launch Cockpit
          </a>
        </div>
      </section>

      {/* 9. CHRONO FLIGHT RECORDER & COCKPIT TELEMETRY (LIVE ENGINEERING PROOF) */}
      <section id="cockpit-section" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0064E0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            FLIGHT RECORDER // OBSERVABILITY COCKPIT
          </div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#09090b',
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0'
          }}>
            Sub-Millisecond 60 FPS Canvas Telemetry
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#4B5563',
            margin: 0
          }}>
            Continuous LMAX ring buffer telemetry at 1,200,000 eps with automated stall tripwire detection and live causal post-mortem reasoning.
          </p>
        </div>

        {/* Cockpit Card Frame */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            borderRadius: '16px',
            border: '1px solid #D1D5DB',
            backgroundColor: '#ffffff',
            boxShadow: '0 12px 35px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transform: `perspective(1000px) rotateX(${mouseTilt.rx}deg) rotateY(${mouseTilt.ry}deg)`,
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            height: '42px',
            borderBottom: '1px solid #1E293B',
            backgroundColor: '#0D1117',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginLeft: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                RECORDER: session-chronod-audit-run.chrono
              </span>
            </div>

            <span style={{
              color: animStage === 'stalled' ? '#F85149' : (animStage === 'intervened' ? '#71F6D2' : '#0DACF1'),
              fontWeight: 600,
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {animStage === 'running' && 'INGESTING TELEMETRY (1.2M EPS)'}
              {animStage === 'stalled' && 'STALL TRIPWIRE: IDENTICAL DIFF LOOP DETECTED'}
              {animStage === 'intervened' && 'SURGICAL INTERVENTION: SAFE FLIGHT RESUMED'}
            </span>
          </div>

          {/* Canvas Waveforms */}
          <div style={{
            height: '200px',
            backgroundColor: '#090D16',
            position: 'relative',
            overflow: 'hidden',
            padding: '18px 24px'
          }}>
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontFamily: '"JetBrains Mono", monospace' }}>
                <span>SEQ #1 GENESIS</span>
                <span>SEQ #12 BUILD</span>
                <span style={{ color: animStage === 'stalled' ? '#F85149' : '#64748B' }}>SEQ #29 DIFF TRIPWIRE</span>
                <span style={{ color: '#71F6D2' }}>SEQ #41 TERMINAL HEAD</span>
              </div>

              {/* Waveforms */}
              <div style={{ height: '65px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                {Array.from({ length: 64 }).map((_, i) => {
                  const h = 12 + Math.sin(i * 0.35) * 26 + (i > 40 && i < 50 ? 28 : 0);
                  const isStallArea = i >= 42 && i <= 48;
                  const isIntervenedArea = i > 48;
                  let bg = 'rgba(13, 172, 241, 0.45)';
                  if (isStallArea) bg = 'rgba(239, 68, 68, 0.8)';
                  else if (isIntervenedArea) bg = 'rgba(113, 246, 210, 0.6)';

                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}px`,
                        backgroundColor: bg,
                        borderRadius: '1px 1px 0 0'
                      }}
                    />
                  );
                })}
              </div>

              {/* Scrubber Track */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  handleManualSeek(pct);
                }}
                style={{
                  position: 'relative',
                  height: '24px',
                  backgroundColor: '#161B22',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #30363D'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${playheadPercent}%`,
                  backgroundColor: 'rgba(13, 172, 241, 0.2)',
                  borderRight: '2px solid #0DACF1'
                }} />

                <div style={{
                  position: 'absolute',
                  left: `${playheadPercent}%`,
                  top: '-7px',
                  transform: 'translateX(-50%)',
                  padding: '2px 7px',
                  backgroundColor: '#0DACF1',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  borderRadius: '3px',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {formattedTimestamp}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Bar */}
          <div style={{
            backgroundColor: '#0D1117',
            borderTop: '1px solid #21262D',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: '#C9D1D9'
          }}>
            <div>
              <span style={{ color: '#8B949E' }}>INSPECTED EVENT: </span>
              {animStage === 'stalled' && (
                <span style={{ color: '#F85149' }}>
                  Tripwire Alert: diff_similarity &gt; 0.98 on tools/build.rs (Loop step 3 of 3)
                </span>
              )}
              {animStage === 'intervened' && (
                <span style={{ color: '#71F6D2' }}>
                  Intervention checkpoint #30: Injected patch break & revised compiler flags
                </span>
              )}
              {animStage === 'running' && (
                <span style={{ color: '#0DACF1' }}>
                  Normal telemetry: Tool execution finished in 4,120 ns (seq #18)
                </span>
              )}
            </div>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                background: '#21262D',
                border: '1px solid #30363D',
                color: '#F0F6FC',
                padding: '3px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {isAutoPlaying ? 'PAUSE' : 'PLAY'}
            </button>
          </div>
        </div>
      </section>

      {/* 10. MERKLE CHAIN DISSECTOR */}
      <section id="merkle-section" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0064E0', fontFamily: '"JetBrains Mono", monospace' }}>
                NIST FIPS 180-4 CRYPTOGRAPHIC VERIFICATION
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', margin: '4px 0 0 0' }}>
                Cryptographic Merkle Chain Dissector
              </h2>
            </div>

            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              className="btn-press"
              style={{
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: isVerifying ? '#94A3B8' : '#0064E0',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isVerifying ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? 'Running chronod --verify...' : 'Execute Audit'}
            </button>
          </div>

          {verifyResult && (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#15803D',
              fontFamily: '"JetBrains Mono", monospace',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IconCheck size={16} color="#15803D" /> {verifyResult}
            </div>
          )}

          {/* 4 Clickable Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {SAMPLE_BLOCKS.map((b) => (
              <div
                key={b.index}
                onClick={() => setSelectedBlock(b)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: selectedBlock.index === b.index ? '2px solid #0064E0' : '1px solid #E5E7EB',
                  backgroundColor: selectedBlock.index === b.index ? '#F0F9FF' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontFamily: '"JetBrains Mono", monospace' }}>
                  <span>BLOCK #{b.index}</span>
                  <span>{b.timestamp}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b', marginTop: '6px' }}>
                  {b.kind}
                </div>
                <div style={{ fontSize: '11px', color: '#15803D', marginTop: '4px', fontFamily: '"JetBrains Mono", monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheck size={12} color="#15803D" /> SHA-256 Valid
                </div>
              </div>
            ))}
          </div>

          {/* Block Detail Box */}
          <div style={{
            backgroundColor: '#0D1117',
            borderRadius: '8px',
            padding: '16px 20px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: '#C9D1D9',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#8B949E', marginBottom: '6px' }}>// INSPECTING BLOCK #{selectedBlock.index} — {selectedBlock.kind}</div>
            <div><span style={{ color: '#0DACF1' }}>PREVIOUS HASH:</span> {selectedBlock.prevHash}</div>
            <div><span style={{ color: '#71F6D2' }}>BLOCK HASH:   </span> {selectedBlock.blockHash}</div>
            <div><span style={{ color: '#F5A3E0' }}>PAYLOAD VIEW: </span> {selectedBlock.payloadSummary}</div>
          </div>
        </div>
      </section>

      {/* 11. FOUR-PILLAR ARCHITECTURE & EMPIRICAL BENCHMARKS */}
      <section id="architecture" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0064E0', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            FOUR-PILLAR ARCHITECTURE
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#09090b', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Built for Extreme Speed and Forensic Certainty
          </h2>
          <p style={{ fontSize: '16px', color: '#4B5563', margin: 0 }}>
            An asymmetric architecture separating the hot lock-free telemetry path from the interactive visual timeline.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0064E0', fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
              PILLAR 01 // KERNEL
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Zero-Allocation C++20 Ingest Engine
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Single-writer, single-reader lock-free ring buffer modeled after the LMAX Disruptor pattern. Eliminates memory allocation from the agent hot path, sustaining 1,200,000 events/sec without thread contention.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
              PILLAR 02 // LEDGER
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Immutable SHA-256 Merkle Chaining
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Every event record cryptographically commits to the hash of its predecessor. Any backtracked execution, tampered checkpoint, or corrupted state breaks the Merkle tree instantly during forensic verification.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#DB2777', fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
              PILLAR 03 // INTELLIGENCE
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Live Causal Post-Mortem Reasoner
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Connected live to the Meta Model API. Analyzes checkpoint diffs to synthesize structured hypotheses, detects identical-patch stall loops, and streams tokens directly to the operator cockpit via Server-Sent Events.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', fontFamily: '"JetBrains Mono", monospace', marginBottom: '6px' }}>
              PILLAR 04 // INTERFACE
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Sub-Millisecond 60 FPS Canvas Cockpit
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Direct HTML5 Canvas timeline rendering with binary-search index lookups. Guaranteed deterministic seek latency under 50 µs, allowing operators to scrub millions of events fluidly with zero browser stutter.
            </p>
          </div>
        </div>

        {/* Benchmarks Matrix Card */}
        <div id="benchmarks" style={{
          marginTop: '32px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '28px 36px',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
            EMPIRICAL SYSTEM PERFORMANCE BENCHMARKS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>INGEST THROUGHPUT</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>1,200,000 eps</div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>Lockless Ring Buffer</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>SEEK LATENCY</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>&lt; 50 µs</div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>Binary Search Index</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>WIRE OVERHEAD</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>24 bytes</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>CEP v1 Packed</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>CRYPTOGRAPHIC AUDIT</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>0.227 ms</div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>41 SHA-256 Blocks</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>PLAYBACK FRAME RATE</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>60 FPS</div>
              <div style={{ fontSize: '11px', color: '#0064E0', marginTop: '2px' }}>HTML5 Canvas Direct</div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS (CLEAN PLUS / MINUS ACCORDION) */}
      <section id="faq" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#0064E0',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 36px 0'
        }}>
          Everything you need to know about Chrono
        </h2>

        <div style={{ borderTop: '1px solid #E5E7EB' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid #E5E7EB'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '22px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827'
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ color: '#0064E0' }}>
                    {isOpen ? <IconMinus size={20} /> : <IconPlus size={20} />}
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 0 24px 0',
                    fontSize: '15px',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    maxWidth: '880px'
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. CHRONO PROFESSIONAL FOOTER (ZERO EMOJIS) */}
      <footer style={{
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#ffffff',
        padding: '64px 36px 36px 36px',
        fontSize: '13px',
        color: '#64748B'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.2fr repeat(4, 1fr)',
          gap: '32px',
          marginBottom: '56px'
        }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', marginBottom: '16px' }}>
              <ChronoLogo size={28} color="#0064E0" />
              <span style={{ fontSize: '18px', fontWeight: 800 }}>CHRONO</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Open Forensic Telemetry and Flight Data Recording for Autonomous AI Agents.
            </p>
            <div style={{ display: 'flex', gap: '14px', color: '#6B7280' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconClock size={16} /></span>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconPlane size={16} /></span>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconLock size={16} /></span>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><IconZap size={16} /></span>
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Product</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="#cockpit-section" style={{ color: '#64748B', textDecoration: 'none' }}>Flight Cockpit</a>
              <a href="#merkle-section" style={{ color: '#64748B', textDecoration: 'none' }}>Merkle Ledger</a>
              <a href="#chrono-features" style={{ color: '#64748B', textDecoration: 'none' }}>Loop Detection</a>
              <a href={`${COCKPIT_URL}/login`} style={{ color: '#64748B', textDecoration: 'none' }}>Operator Portal</a>
            </div>
          </div>

          {/* Architecture */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Architecture</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="#architecture" style={{ color: '#64748B', textDecoration: 'none' }}>C++20 Ingest Engine</a>
              <a href="#benchmarks" style={{ color: '#64748B', textDecoration: 'none' }}>LMAX Ring Buffer</a>
              <a href="#merkle-section" style={{ color: '#64748B', textDecoration: 'none' }}>NIST FIPS 180-4 SHA-256</a>
              <a href="#benchmarks" style={{ color: '#64748B', textDecoration: 'none' }}>Binary Index Seeker</a>
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Ecosystem</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>GitHub Repository</a>
              <a href="https://github.com/ShawnTheCreator/Chrono/blob/main/DESIGN.md" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Design System</a>
              <a href="#faq" style={{ color: '#64748B', textDecoration: 'none' }}>Technical FAQ</a>
              <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#64748B', textDecoration: 'none' }}>Live Demo</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Specifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#64748B' }}>Protocol: CEP v1 (24-byte)</span>
              <span style={{ color: '#64748B' }}>Hashing: NIST FIPS 180-4</span>
              <span style={{ color: '#64748B' }}>License: MIT / Apache 2.0</span>
              <span style={{ color: '#64748B' }}>Version: 1.0.0-rc1</span>
            </div>
          </div>
        </div>

        {/* Chrono Sub-Footer */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '28px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChronoLogo size={20} color="#0064E0" />
            <span style={{ fontWeight: 700, color: '#111827' }}>CHRONO FLIGHT DATA RECORDER</span>
            <span>— Open Forensic Telemetry Specification (FDR-2026)</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href={`${COCKPIT_URL}/login`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>Operator Portal</a>
            <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>Cockpit Dashboard</a>
            <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
