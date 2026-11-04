import React, { useState, useEffect, useRef } from 'react';

const COCKPIT_URL = (import.meta as any).env?.VITE_COCKPIT_URL || (import.meta as any).env?.VITE_DASHBOARD_URL || 'https://chrono-dashboard-alpha.vercel.app';

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

const IconArrowUpRight = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// Chrono Signature Logo: Stylized "C" with Clock Hands in Meta Metallic Blue
const ChronoLogo = ({ size = 28 }: { size?: number; color?: string }) => (
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
        <stop offset="45%" stopColor="#0073EE" />
        <stop offset="100%" stopColor="#0064E0" />
      </linearGradient>
      <linearGradient id="chronoHomeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#71F6D2" />
        <stop offset="100%" stopColor="#0082FB" />
      </linearGradient>
    </defs>
    {/* Main "C" Arc */}
    <path
      d="M 74 26 A 35 35 0 1 0 74 74"
      fill="none"
      stroke="url(#chronoHomeGrad)"
      strokeWidth="11"
      strokeLinecap="round"
    />
    {/* Center Pivot */}
    <circle cx="50" cy="50" r="6" fill="url(#chronoHomeGrad)" />
    {/* Hour Hand (10 o'clock stance) */}
    <line
      x1="50"
      y1="50"
      x2="35"
      y2="33"
      stroke="url(#chronoHomeGrad)"
      strokeWidth="6.5"
      strokeLinecap="round"
    />
    {/* Minute Hand pointing gracefully into opening of the C */}
    <line
      x1="50"
      y1="50"
      x2="68"
      y2="38"
      stroke="url(#chronoHomeAccent)"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    {/* Polished Center Pin */}
    <circle cx="50" cy="50" r="2.2" fill="#FFFFFF" />
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

// Cockpit Interactive Tour Targets for Cursor & Highlighting
const COCKPIT_TARGETS = [
  {
    id: 1,
    name: 'Timeline Checkpoint #29',
    cursorX: 49,
    cursorY: 82,
    highlight: {
      left: '37%',
      top: '75%',
      width: '26%',
      height: '16%',
      border: '2px solid #EF4444',
      glow: '0 0 28px rgba(239, 68, 68, 0.45), inset 0 0 16px rgba(239, 68, 68, 0.15)',
      bg: 'rgba(239, 68, 68, 0.08)',
      tagBg: '#EF4444',
      tagText: 'CHECKPOINT #29 // STALL DETECTED'
    }
  },
  {
    id: 2,
    name: 'Code Diff Inspector',
    cursorX: 42,
    cursorY: 38,
    highlight: {
      left: '21%',
      top: '13%',
      width: '50%',
      height: '60%',
      border: '2px solid #0082FB',
      glow: '0 0 32px rgba(0, 130, 251, 0.45), inset 0 0 20px rgba(0, 130, 251, 0.12)',
      bg: 'rgba(0, 130, 251, 0.06)',
      tagBg: '#0082FB',
      tagText: 'DIFF INSPECTOR // src/auth/provider.ts'
    }
  },
  {
    id: 3,
    name: 'Root-Cause Reasoner',
    cursorX: 84,
    cursorY: 46,
    highlight: {
      left: '73%',
      top: '13%',
      width: '25%',
      height: '78%',
      border: '2px solid #6366F1',
      glow: '0 0 32px rgba(99, 102, 241, 0.45), inset 0 0 20px rgba(99, 102, 241, 0.12)',
      bg: 'rgba(99, 102, 241, 0.07)',
      tagBg: '#6366F1',
      tagText: 'REASONING // AUTOMATED POST-MORTEM'
    }
  }
];

export default function App() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [cursorStep, setCursorStep] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 49, y: 82 });
  const [isClicking, setIsClicking] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<number>(1);

  // Automatic Cursor Tour Loop
  useEffect(() => {
    const cycle = setInterval(() => {
      setCursorStep((prev) => (prev + 1) % COCKPIT_TARGETS.length);
    }, 3200);
    return () => clearInterval(cycle);
  }, []);

  // Sync cursor glide, click ripple, and zone highlighting
  useEffect(() => {
    const target = COCKPIT_TARGETS[cursorStep];
    if (!target) return;

    setCursorPos({ x: target.cursorX, y: target.cursorY });

    const clickTimer = setTimeout(() => {
      setIsClicking(true);
      setActiveHighlightId(target.id);

      const unclickTimer = setTimeout(() => {
        setIsClicking(false);
      }, 240);
      return () => clearTimeout(unclickTimer);
    }, 720);

    return () => clearTimeout(clickTimer);
  }, [cursorStep]);
  const [cockpitTilt, setCockpitTilt] = useState({ x: 0, y: 0 });
  const cockpitFrameRef = useRef<HTMLDivElement | null>(null);

  const handleCockpitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cockpitFrameRef.current) return;
    const rect = cockpitFrameRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCockpitTilt({ x: x * 5, y: -y * 5 });
  };

  const handleCockpitMouseLeave = () => {
    setCockpitTilt({ x: 0, y: 0 });
  };

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hero Video Ref & Playback
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [videoIndex]);

  // Cycle Hero Text
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_ROTATING_LINES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const heroProgress = Math.min(1, Math.max(0, scrollY / (vh || 1)));
  const heroScale = 1 - heroProgress * 0.05;
  const heroOpacity = 1 - heroProgress * 0.45;

    const currentHero = HERO_ROTATING_LINES[heroIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090D16',
      color: '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflowX: 'clip'
    }}>
      {/* 1. HERO SECTION WITH BACKGROUND VIDEO PLAYER (VID1 TO VID4) - STICKY 100VH */}
      <section style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: '#090D16',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff',
        overflow: 'hidden',
        transform: `scale(${heroScale})`,
        opacity: heroOpacity,
        transformOrigin: 'center 40%',
        willChange: 'transform, opacity'
      }}>
        {/* Full-Bleed Background Video Player */}
        <video
          ref={videoRef}
          key={videoIndex}
          autoPlay
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
            display: 'block',
            zIndex: 0,
            pointerEvents: 'none',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            backgroundColor: '#090D16'
          }}
        >
          <source src={HERO_VIDEOS[videoIndex]} type="video/mp4" />
        </video>

        {/* Ambient Dark Overlay to Guarantee Crisp Typography */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.20) 40%, rgba(9, 13, 22, 0.55) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        {/* Transparent Top Navigation Bar */}
        <header
          className="hero-animate-header"
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '24px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
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
          {/* Animated 3-Line Headline */}
          <h1
            key={heroIndex}
            style={{
              fontSize: '64px',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              margin: '0 0 16px 0',
              textShadow: '0 2px 14px rgba(0,0,0,0.5)'
            }}
          >
            <span className="hero-line-1">{currentHero.prefix}</span><br />
            <span className="hero-line-2" style={{ color: '#71F6D2' }}>{currentHero.middle}</span><br />
            <span className="hero-line-3">{currentHero.suffix}</span>
          </h1>

          <p
            className="hero-animate-text"
            style={{
              fontSize: '19px',
              color: 'rgba(255, 255, 255, 0.92)',
              maxWidth: '680px',
              margin: '0 auto 32px auto',
              lineHeight: 1.5,
              textShadow: '0 1px 6px rgba(0,0,0,0.4)'
            }}
          >
            The flight data recorder for autonomous AI agents. Inspect every decision, stop runaway loops before budgets burn, and rewind to any moment in history.
          </p>

          <div
            className="hero-animate-cta"
            style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}
          >
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
              href="#chrono-features"
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
              Explore Features ↓
            </a>
          </div>
        </div>

        {/* Video Playlist Indicator Dots (Titles Video 1-4 Removed) */}
        <div
          className="hero-animate-dots"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            paddingBottom: '32px'
          }}
        >
          {HERO_VIDEOS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setVideoIndex(idx)}
              aria-label={`Switch to video ${idx + 1}`}
              className="btn-press"
              style={{
                width: videoIndex === idx ? '26px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: videoIndex === idx ? '#0064E0' : 'rgba(255,255,255,0.4)',
                border: videoIndex === idx ? '1px solid #71F6D2' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </div>
      </section>

      {/* RISING OVERLAY CONTENT CONTAINER (RISES & COVERS HERO ON SCROLL) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '36px',
        borderTopRightRadius: '36px',
        boxShadow: '0 -25px 70px rgba(0, 0, 0, 0.45), 0 -4px 16px rgba(0, 0, 0, 0.15)',
        marginTop: 0
      }}>
        {/* 2. CHRONO COCKPIT MOTION GRAPHIC SHOWCASE */}
      <section id="chrono-features" style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '96px 36px 90px 36px',
        position: 'relative'
      }}>
        {/* Editorial Narrative Header (Inspired by high-fashion / design journal layout) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '48px',
          alignItems: 'flex-end',
          marginBottom: '54px'
        }}>
          {/* Left Column: Narrative Headline */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0064E0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#0082FB',
                boxShadow: '0 0 10px #0082FB'
              }} />
              FLIGHT DECK TELEMETRY
            </div>

            <h2 style={{
              fontSize: '48px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#09090b',
              lineHeight: 1.12,
              margin: '0 0 20px 0'
            }}>
              Beyond raw log dumps.<br />
              <span style={{
                background: 'linear-gradient(90deg, #0064E0 0%, #0082FB 50%, #0DACF1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Complete visibility in 60 FPS motion.
              </span>
            </h2>

            <p style={{
              fontSize: '17px',
              color: '#475569',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: 0
            }}>
              Autonomous agents write code, invoke external APIs, and mutate infrastructure. When mistakes occur, terminal logs leave you blind. Chrono transforms the agent lifecycle into an interactive, cryptographically verified black-box flight recorder.
            </p>
          </div>

          {/* Right Column: Editorial Details & Launch Cockpit Link */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            gap: '24px'
          }}>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              lineHeight: 1.6,
              margin: 0
            }}>
              Scrub back to any second, inspect surgical diffs before and after every tool invocation, and watch stall tripwires automatically intercept runaway loops.
            </p>

            <a
              href={COCKPIT_URL}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#0064E0',
                textDecoration: 'none',
                borderBottom: '2px solid #0064E0',
                paddingBottom: '3px',
                transition: 'all 0.2s ease'
              }}
            >
              Launch the live Cockpit
              <IconArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* MOTION GRAPHIC COCKPIT FRAME */}
        <div
          ref={cockpitFrameRef}
          onMouseMove={handleCockpitMouseMove}
          onMouseLeave={handleCockpitMouseLeave}
          style={{
            position: 'relative',
            perspective: '1400px',
            marginBottom: '48px'
          }}
        >
          {/* Ambient Colored Back-Glow (Neon Cockpit Aura) */}
          <div style={{
            position: 'absolute',
            inset: '-20px -20px -20px -20px',
            background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0, 100, 224, 0.22) 0%, rgba(113, 246, 210, 0.12) 40%, transparent 75%)',
            filter: 'blur(40px)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: 'cockpitAmbientGlow 6s ease-in-out infinite'
          }} />

          {/* Cockpit Chassis Frame */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            transform: `perspective(1400px) rotateX(${cockpitTilt.y}deg) rotateY(${cockpitTilt.x}deg)`,
            transition: 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)',
            transformStyle: 'preserve-3d'
          }}>
            {/* Window Titlebar / Chrome (Clean White) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 22px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #E5E7EB'
            }}>
              {/* Traffic Light Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5F56', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFBD2E', display: 'inline-block' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27C93F', display: 'inline-block' }} />
              </div>
            </div>

            {/* SCREENSHOT STAGE WITH MOTION GRAPHIC OVERLAYS */}
            <div style={{ position: 'relative', overflow: 'hidden', lineHeight: 0 }}>
              {/* Cockpit High-Res Screenshot */}
              <img
                src="/cockpit-screenshot.png"
                alt="Chrono Cockpit Live Flight Recording"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: 'contrast(1.03) brightness(1.01)'
                }}
              />

              {/* Animated Laser Scanning Beam */}
              <div className="cockpit-laser-sweep">
                <div className="cockpit-laser-bar" />
              </div>

              {/* CLICK HIGHLIGHT OVERLAYS */}
              {COCKPIT_TARGETS.map((target) => {
                const isSelected = activeHighlightId === target.id;
                return (
                  <div
                    key={target.id}
                    onClick={() => {
                      setCursorStep(COCKPIT_TARGETS.findIndex((t) => t.id === target.id));
                      setActiveHighlightId(target.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: target.highlight.left,
                      top: target.highlight.top,
                      width: target.highlight.width,
                      height: target.highlight.height,
                      border: target.highlight.border,
                      backgroundColor: target.highlight.bg,
                      boxShadow: target.highlight.glow,
                      borderRadius: '10px',
                      opacity: isSelected ? 1 : 0,
                      transform: isSelected ? 'scale(1)' : 'scale(0.98)',
                      transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 25,
                      cursor: 'pointer',
                      pointerEvents: 'auto'
                    }}
                  >
                    {/* Glowing High-Tech Tag */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '10px',
                      backgroundColor: target.highlight.tagBg,
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      fontFamily: 'monospace',
                      pointerEvents: 'none'
                    }}>
                      {target.highlight.tagText}
                    </div>
                  </div>
                );
              })}

              {/* ANIMATED VIRTUAL CURSOR (Clicks and Highlights targets in sequence) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  transform: `translate(-4px, -2px) scale(${isClicking ? 0.82 : 1})`,
                  transition: 'left 0.72s cubic-bezier(0.25, 1, 0.5, 1), top 0.72s cubic-bezier(0.25, 1, 0.5, 1), transform 0.14s ease',
                  pointerEvents: 'none',
                  zIndex: 40,
                  filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))'
                }}
              >
                {/* SVG Mouse Pointer */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.5 3.5L11.5 20.5L14.2 13.8L21 11L4.5 3.5Z"
                    fill="#0F172A"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Click Ripple Wave */}
                {isClicking && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: '4px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      border: '2px solid #0082FB',
                      backgroundColor: 'rgba(0, 130, 251, 0.25)',
                      transform: 'translate(-50%, -50%)',
                      animation: 'cursorClickRipple 0.35s ease-out forwards',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3 EDITORIAL CARDS BELOW SCREENSHOT (Inspired by user's reference image style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '36px'
        }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#6B7280',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                EVERYDAY RELIABILITY
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#09090b',
                lineHeight: 1.3,
                marginBottom: '12px',
                textDecoration: 'underline',
                textDecorationColor: '#E5E7EB',
                textUnderlineOffset: '6px'
              }}>
                Instant stall tripwire detection
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Agents often get trapped executing identical failing edits in a loop. Chrono's flight recorder flags cyclic behavior and pauses execution before API tokens burn out.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#6B7280',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                CONSIDERED DETAILS
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#09090b',
                lineHeight: 1.3,
                marginBottom: '12px',
                textDecoration: 'underline',
                textDecorationColor: '#E5E7EB',
                textUnderlineOffset: '6px'
              }}>
                Sub-frame timeline replay
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Scrub back and forward through the entire agent run with fluid 60 FPS precision. Inspect every file diff, shell execution, and prompt state at that exact millisecond.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#6B7280',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                IMMUTABLE PROOF
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#09090b',
                lineHeight: 1.3,
                marginBottom: '12px',
                textDecoration: 'underline',
                textDecorationColor: '#E5E7EB',
                textUnderlineOffset: '6px'
              }}>
                Tamper-proof cryptographic seals
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Every action is sealed in an append-only cryptographic hash chain. No deleted steps, no retroactively edited prompts &mdash; verifiable certainty for security teams.
              </p>
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

      {/* 9. CORE CAPABILITIES (REPLACED TECHNICAL SPEC JARGON WITH VALUE) */}
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
              <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#64748B', textDecoration: 'none' }}>Flight Cockpit</a>
              <a href="#capabilities" style={{ color: '#64748B', textDecoration: 'none' }}>Capabilities</a>
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
    </div>
  );
}
