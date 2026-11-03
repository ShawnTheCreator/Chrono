import React, { useState, useEffect, useRef } from 'react';

const COCKPIT_URL = (import.meta as any).env?.VITE_COCKPIT_URL || 'http://localhost:3001';

interface CheckpointBlock {
  index: number;
  kind: string;
  timestamp: string;
  actionSummary: string;
  status: string;
  verified: boolean;
}

const SAMPLE_BLOCKS: CheckpointBlock[] = [
  {
    index: 1,
    kind: 'SESSION STARTED',
    timestamp: '00:00',
    actionSummary: 'Workspace initialized and recorder connected to agent process',
    status: 'Verified Healthy',
    verified: true
  },
  {
    index: 12,
    kind: 'TOOL EXECUTION',
    timestamp: '02:30',
    actionSummary: 'Executed build target and updated dependencies',
    status: 'Verified Healthy',
    verified: true
  },
  {
    index: 29,
    kind: 'SAFETY TRIPWIRE',
    timestamp: '04:55',
    actionSummary: 'Paused execution: Agent repeated identical failing edits 3 times',
    status: 'Alert Triggered',
    verified: true
  },
  {
    index: 41,
    kind: 'TASK COMPLETED',
    timestamp: '05:20',
    actionSummary: 'Verified final codebase state and generated forensic report',
    status: 'Verified Complete',
    verified: true
  }
];

// Clean Modern SVG Icons
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

// Clear, Jargon-Free Hero Rotating Value Propositions
const HERO_ROTATING_LINES = [
  { prefix: "Chrono records", middle: "every decision", suffix: "while agents run" },
  { prefix: "Chrono stops", middle: "repetitive loops", suffix: "before budgets burn" },
  { prefix: "Chrono verifies", middle: "every step", suffix: "with complete certainty" },
  { prefix: "Chrono explains", middle: "why tasks fail", suffix: "and how to fix them" },
  { prefix: "Chrono protects", middle: "your codebase", suffix: "from runaway mistakes" },
  { prefix: "Chrono lets you", middle: "rewind history", suffix: "to any moment instantly" }
];

const HERO_VIDEOS = [
  '/videos/vid1.mp4',
  '/videos/vid2.mp4',
  '/videos/vid3.mp4',
  '/videos/vid4.mp4'
];

const FAQ_ITEMS = [
  {
    question: "What is Chrono?",
    answer: "Chrono is a flight data recorder for autonomous AI agents. It gives you full visibility into what your agents are doing, automatically detects when they get stuck, and lets you rewind to any point in time."
  },
  {
    question: "Does Chrono slow down my agents?",
    answer: "No. Chrono runs quietly in the background with zero noticeable impact on your agent's execution speed or responsiveness."
  },
  {
    question: "How does Chrono prevent runaway costs?",
    answer: "Agents often get trapped trying the same failing solution over and over. Chrono detects repetitive edits in real time and pauses execution automatically before hundreds of unnecessary calls are made."
  },
  {
    question: "Can I undo mistakes an agent made?",
    answer: "Yes. Chrono lets you rewind your agent's timeline to any historical checkpoint, update your prompt or code instructions, and resume smoothly."
  },
  {
    question: "How do I know the history hasn't been altered?",
    answer: "Chrono uses an append-only audit trail where every event is cryptographically sealed. Any deleted or modified step immediately shows up as invalid."
  },
  {
    question: "Can I understand why an agent failed without reading thousands of lines of logs?",
    answer: "Yes. When an agent runs into an error, Chrono automatically produces a clear, structured post-mortem explaining what went wrong and suggesting how to resolve it."
  },
  {
    question: "Does Chrono work with my existing tools?",
    answer: "Yes. Chrono connects to popular coding agents, CLI tools, and custom agent workflows with a lightweight adapter."
  },
  {
    question: "Who is Chrono for?",
    answer: "Chrono is built for software engineers, DevOps teams, and AI safety leaders building and relying on autonomous agents in production."
  }
];

export default function App() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // Timeline Scrubber State
  const [playheadPercent, setPlayheadPercent] = useState(78);
  const [animStage, setAnimStage] = useState<'running' | 'stalled' | 'intervened'>('intervened');
  const [formattedTimestamp, setFormattedTimestamp] = useState('05:20');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audit State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<CheckpointBlock>(SAMPLE_BLOCKS[2]);

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Cycle Hero Text
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ROTATING_LINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Continuous narrative playback loop
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
      setVerifyResult('Audit Passed: All 41 checkpoints verified. Complete historical integrity confirmed.');
    }, 450);
  };

  const handleManualSeek = (pct: number) => {
    setIsAutoPlaying(false);
    setPlayheadPercent(pct);
    if (pct < 65) {
      setAnimStage('running');
      setFormattedTimestamp('02:15');
    } else if (pct < 76) {
      setAnimStage('stalled');
      setFormattedTimestamp('04:55');
    } else {
      setAnimStage('intervened');
      setFormattedTimestamp('05:20');
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
      {/* 1. HERO SECTION WITH BACKGROUND VIDEO PLAYER (VID1 TO VID4) */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        width: '100%',
        backgroundColor: '#090D16',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Background Video Player */}
        <video
          key={videoIndex}
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <source src={HERO_VIDEOS[videoIndex]} type="video/mp4" />
        </video>

        {/* Ambient Dark Overlay to Guarantee Crisp Typography */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(9, 13, 22, 0.70) 0%, rgba(9, 13, 22, 0.82) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Transparent Top Navigation Bar */}
        <header style={{
          position: 'relative',
          zIndex: 2,
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
            <a href="#cockpit-section" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Flight Cockpit</a>
            <a href="#audit-section" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Audit Trail</a>
            <a href="#capabilities" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Capabilities</a>
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
          position: 'relative',
          zIndex: 2,
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
            fontSize: '19px',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            lineHeight: 1.5,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)'
          }}>
            The flight data recorder for autonomous AI agents. Inspect every decision, stop runaway loops before budgets burn, and rewind to any moment in history.
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
              Explore Live Demo ↓
            </a>
          </div>
        </div>

        {/* Video Playlist Selector Controls */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          paddingBottom: '28px'
        }}>
          {HERO_VIDEOS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setVideoIndex(idx)}
              className="btn-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: videoIndex === idx ? '#0064E0' : 'rgba(255,255,255,0.16)',
                color: '#ffffff',
                border: videoIndex === idx ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.22)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: videoIndex === idx ? '#71F6D2' : 'rgba(255,255,255,0.5)'
              }} />
              <span>Video {idx + 1}</span>
            </button>
          ))}
        </div>
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
            Chrono continuously records what your agents are doing, why they make decisions, and what files changed. Get complete visibility, automatic loop protection, and instant rollback controls.
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
                  Instant Timeline Replay
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 0 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 0 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Rewind and scrub through your agent's entire run. See every tool call, file change, and decision clearly laid out on an interactive visual timeline.
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
                  Automatic Loop Protection
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 1 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 1 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Stop runaway costs before they escalate. Chrono detects when an agent gets stuck repeating the same mistakes and automatically pauses execution.
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
                  Tamper-Proof Audit History
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 2 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 2 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Every action is permanently recorded in a secure, verifiable log so you always have reliable proof of what happened and when.
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
                  Instant Root-Cause Explanations
                </h3>
                <span style={{ color: '#0064E0' }}>
                  {activeFeatureTab === 3 ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                </span>
              </div>
              {activeFeatureTab === 3 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  When an agent encounters an error or stalls, Chrono analyzes the failure and explains what went wrong in plain English with recommended fixes.
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
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Chrono Guardian</div>
                  <div style={{ fontSize: '11px', color: '#71F6D2' }}>Active Protection</div>
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ color: '#6B7280', marginBottom: '4px' }}>Checkpoint #29 (04:55)</div>
                  <div style={{ fontWeight: 700, color: '#DC2626' }}>Safety Alert: Stall Loop Detected</div>
                  <div style={{ color: '#4B5563', marginTop: '4px' }}>Target: Authentication Module</div>
                  <div style={{ color: '#4B5563' }}>Repeated failing edits: 3 attempts</div>
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
                  <div style={{ fontWeight: 700, color: '#0064E0', marginBottom: '4px' }}>Root-Cause Explanation</div>
                  <p style={{ margin: 0, color: '#4B5563', lineHeight: 1.4 }}>
                    "The agent is cycling identical edits without fixing the underlying configuration error. Execution paused to protect your budget."
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
                      Recommended Action
                    </span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <IconCheck size={12} color="#059669" /> Safe Rollback
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>
                    Rewind to Checkpoint #28
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px' }}>
                    Reverts failing edit and allows new instructions
                  </div>
                  <button
                    onClick={() => alert('Surgical Rollback Executed! Safe execution resumed at checkpoint #28.')}
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
          SECURE AND IN CONTROL
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 32px 0'
        }}>
          Built for privacy, safety, and undeniable proof
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
                Tamper-Proof Audit History
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 18px 0' }}>
                Every recorded action is permanently sealed in an append-only log. Once committed, the history cannot be silently edited or deleted, giving security and compliance teams undeniable proof of every step.
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
                <IconCheck size={14} color="#047857" /> Verifiable Audit Trail
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
                Instant Surgical Rollbacks
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 18px 0' }}>
                Review and pause agent actions before unintended damage happens. Rewind to any healthy historical moment, provide corrected guidance, and resume execution without losing prior work.
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
                <IconZap size={14} color="#0284C7" /> Zero Data Loss Guarantee
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

        {/* Large Clean Light-Blue Banner */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '24px',
          padding: '80px 48px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconClock size={15} color="#0064E0" /> COMPLETE VISIBILITY
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconShield size={15} color="#0064E0" /> TAMPER-PROOF AUDIT
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#E0F2FE', color: '#0064E0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IconActivity size={15} color="#0064E0" /> AUTOMATIC SAFEGUARDS
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
            Every decision recorded. Every mistake caught. Complete peace of mind.
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

      {/* 5. USER STORIES: OPERATOR EXPERIENCES */}
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
              USER STORIES
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Trusted by teams
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}>
              Teams rely on Chrono to supervise, audit, and debug complex autonomous agent tasks.
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

          {/* 4 Portrait Cards */}
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
                "Chrono caught an agent repeating the same failing test 14 times while our team was away, saving thousands in API costs."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— Engineering Lead</div>
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
                "Having an undeniable audit trail gave our legal and security teams the confidence to approve autonomous workflows."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— VP of AI Security</div>
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
                "Being able to rewind an agent to the exact moment it went off track and redirect it changed how we build software."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— Senior Developer</div>
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
                "The post-mortem explanations tell us why an agent failed in seconds rather than digging through raw log dumps."
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>— DevOps Engineer</div>
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
              Deploy Chrono across all your autonomous coding agents and background workers. Centralize visibility, maintain compliance-ready audit trails, and protect your cloud budgets with automated safety guardrails.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> Centralized Monitoring
              </span>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> Automatic Safeguards
              </span>
              <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1E40AF', fontWeight: 600, border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck size={14} color="#1E40AF" /> Compliance-Ready Exports
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
              Complete Certainty Across All Your Agents
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
              <span style={{ fontSize: '11px', color: '#6B7280', margin: '0 auto', fontWeight: 600 }}>Chrono Cockpit — Desktop App</span>
            </div>

            {/* Window Content */}
            <div style={{ height: '240px', backgroundColor: '#F9FAFB', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Continuous Background Recording Active
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
                Directly connected to local development agents. Smooth timeline scrubbing with instant historical verification. Zero performance impact on your workflow.
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
              Fast, responsive timeline inspection for macOS, Windows, and Linux.
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

      {/* 8. TRY CHRONO PANORAMIC BANNER */}
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
          {/* Subtle Watermarks */}
          <div style={{ position: 'absolute', top: '24px', left: '36px', opacity: 0.2, color: '#0064E0' }}>
            <IconClock size={36} />
          </div>
          <div style={{ position: 'absolute', bottom: '24px', left: '60px', opacity: 0.2, color: '#0064E0' }}>
            <IconShield size={36} />
          </div>
          <div style={{ position: 'absolute', top: '30px', right: '48px', opacity: 0.2, color: '#0064E0' }}>
            <IconZap size={36} />
          </div>
          <div style={{ position: 'absolute', bottom: '24px', right: '70px', opacity: 0.2, color: '#0064E0' }}>
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
            Ready to take control of your autonomous agents?
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

      {/* 9. CHRONO FLIGHT RECORDER & COCKPIT TIMELINE DEMO */}
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
            INTERACTIVE FLIGHT COCKPIT
          </div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#09090b',
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0'
          }}>
            Smooth, Instant Timeline Inspection
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#4B5563',
            margin: 0
          }}>
            Continuous recording with automatic stall tripwire detection and instant root-cause analysis.
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
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginLeft: '8px' }}>
                Session: Autonomous Code Refactoring Task
              </span>
            </div>

            <span style={{
              color: animStage === 'stalled' ? '#F85149' : (animStage === 'intervened' ? '#71F6D2' : '#0DACF1'),
              fontWeight: 600,
              fontSize: '11px'
            }}>
              {animStage === 'running' && 'NORMAL FLIGHT // EXECUTING TASKS'}
              {animStage === 'stalled' && 'SAFETY ALERT // STALL LOOP DETECTED'}
              {animStage === 'intervened' && 'COURSE-CORRECTED // SAFE EXECUTION RESUMED'}
            </span>
          </div>

          {/* Visual Activity Waveforms */}
          <div style={{
            height: '200px',
            backgroundColor: '#090D16',
            position: 'relative',
            overflow: 'hidden',
            padding: '18px 24px'
          }}>
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                <span>START OF RUN</span>
                <span>BUILD STEP</span>
                <span style={{ color: animStage === 'stalled' ? '#F85149' : '#64748B' }}>STALL DETECTED</span>
                <span style={{ color: '#71F6D2' }}>COMPLETED</span>
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
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '3px'
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
            fontSize: '12px',
            color: '#C9D1D9'
          }}>
            <div>
              <span style={{ color: '#8B949E' }}>STATUS: </span>
              {animStage === 'stalled' && (
                <span style={{ color: '#F85149' }}>
                  Safety Alert: Agent repeated identical changes 3 times. Execution paused to protect budget.
                </span>
              )}
              {animStage === 'intervened' && (
                <span style={{ color: '#71F6D2' }}>
                  Intervention #30: Operator rewound execution and updated instructions. Normal flight resumed.
                </span>
              )}
              {animStage === 'running' && (
                <span style={{ color: '#0DACF1' }}>
                  Normal Execution: Tool execution completed successfully.
                </span>
              )}
            </div>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                background: '#21262D',
                border: '1px solid #30363D',
                color: '#F0F6FC',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              {isAutoPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </section>

      {/* 10. AUDIT TRAIL & HISTORY INSPECTOR */}
      <section id="audit-section" style={{
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
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0064E0', letterSpacing: '0.04em' }}>
                VERIFIED AUDIT LOG
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', margin: '4px 0 0 0' }}>
                Tamper-Proof History Inspector
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
              {isVerifying ? 'Verifying Log Integrity...' : 'Verify Ledger Integrity'}
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
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IconCheck size={16} color="#15803D" /> {verifyResult}
            </div>
          )}

          {/* 4 Clickable Checkpoint Cards */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                  <span>Checkpoint #{b.index}</span>
                  <span>{b.timestamp}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b', marginTop: '6px' }}>
                  {b.kind}
                </div>
                <div style={{ fontSize: '11px', color: '#15803D', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheck size={12} color="#15803D" /> {b.status}
                </div>
              </div>
            ))}
          </div>

          {/* Checkpoint Detail Box */}
          <div style={{
            backgroundColor: '#0D1117',
            borderRadius: '8px',
            padding: '16px 20px',
            fontSize: '13px',
            color: '#C9D1D9',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#8B949E', marginBottom: '6px' }}>// Inspecting Checkpoint #{selectedBlock.index} — {selectedBlock.kind}</div>
            <div><span style={{ color: '#0DACF1' }}>Recorded Action:</span> {selectedBlock.actionSummary}</div>
            <div><span style={{ color: '#71F6D2' }}>Integrity Status:</span> Cryptographically verified • Unaltered</div>
          </div>
        </div>
      </section>

      {/* 11. CORE CAPABILITIES (REPLACED TECHNICAL SPEC JARGON WITH VALUE) */}
      <section id="capabilities" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0064E0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            CORE CAPABILITIES
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#09090b', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Built for Complete Visibility and Control
          </h2>
          <p style={{ fontSize: '16px', color: '#4B5563', margin: 0 }}>
            Everything you need to supervise, debug, and govern autonomous agents in development and production.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0064E0', marginBottom: '6px' }}>
              CAPABILITY 01
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Continuous Flight Recording
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Captures every tool call, file edit, command output, and prompt transition in real time with zero slowdown on your agent's execution.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', marginBottom: '6px' }}>
              CAPABILITY 02
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Permanent Tamper-Proof Logs
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Maintains an immutable record of every step taken. History cannot be silently modified or erased, ensuring reliable compliance and audit trails.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DB2777', marginBottom: '6px' }}>
              CAPABILITY 03
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Automatic Root-Cause Diagnosis
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Translates complex failures into clear explanations. Automatically analyzes why an agent stalled or failed and suggests actionable fixes.
            </p>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>
              CAPABILITY 04
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 10px 0' }}>
              Instant Rewind & Safe Branching
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
              Scrub back to any healthy checkpoint, inject updated instructions, and fork execution cleanly without having to restart from scratch.
            </p>
          </div>
        </div>

        {/* Core Product Guarantees (Clean, Jargon-Free Replacement for Specs Table) */}
        <div style={{
          marginTop: '32px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '28px 36px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
            CHRONO PRODUCT GUARANTEES
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>PERFORMANCE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>Zero Overhead</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Runs silently in background</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>SCRUBBING</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>Instant Rewind</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Jump to any checkpoint</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>COST PROTECTION</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>Circuit Breakers</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Prevents loop runaway</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>SECURITY</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>Tamper-Proof</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Verifiable audit trails</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>COMPATIBILITY</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090B', marginTop: '4px' }}>Universal</div>
              <div style={{ fontSize: '12px', color: '#0064E0', marginTop: '2px' }}>Any agent harness or CLI</div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS */}
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

      {/* 13. CHRONO PROFESSIONAL FOOTER */}
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
              Flight Data Recording and Observability for Autonomous AI Agents.
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
              <a href="#audit-section" style={{ color: '#64748B', textDecoration: 'none' }}>Audit Trail</a>
              <a href="#chrono-features" style={{ color: '#64748B', textDecoration: 'none' }}>Loop Protection</a>
              <a href={`${COCKPIT_URL}/login`} style={{ color: '#64748B', textDecoration: 'none' }}>Operator Portal</a>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Capabilities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="#capabilities" style={{ color: '#64748B', textDecoration: 'none' }}>Flight Recording</a>
              <a href="#capabilities" style={{ color: '#64748B', textDecoration: 'none' }}>Tamper-Proof Logs</a>
              <a href="#capabilities" style={{ color: '#64748B', textDecoration: 'none' }}>Root-Cause Analysis</a>
              <a href="#capabilities" style={{ color: '#64748B', textDecoration: 'none' }}>Instant Rewind</a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>GitHub Repository</a>
              <a href="https://github.com/ShawnTheCreator/Chrono/blob/main/DESIGN.md" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Design System</a>
              <a href="#faq" style={{ color: '#64748B', textDecoration: 'none' }}>Frequently Asked Questions</a>
              <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#64748B', textDecoration: 'none' }}>Live Demo</a>
            </div>
          </div>

          {/* Overview */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Overview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ color: '#64748B' }}>Zero Overhead Recording</span>
              <span style={{ color: '#64748B' }}>Cryptographic Verification</span>
              <span style={{ color: '#64748B' }}>Open Source (MIT)</span>
              <span style={{ color: '#64748B' }}>Version 1.0.0</span>
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
            <span>— The Flight Data Recorder for Autonomous AI Agents</span>
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
