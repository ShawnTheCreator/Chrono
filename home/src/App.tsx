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

// Cockpit Interactive Tour Targets for Cursor & Highlighting (Simple, clean black text, zero emojis)
const COCKPIT_TARGETS = [
  {
    id: 1,
    name: 'Runaway Loop Intercepted',
    cursorX: 49,
    cursorY: 82,
    label: 'Runaway loop caught: paused to protect budget',
    labelPos: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    highlight: {
      left: '37%',
      top: '73%',
      width: '26%',
      height: '19%',
      border: '2px solid #EF4444',
      glow: '0 0 24px rgba(239, 68, 68, 0.35)',
      bg: 'rgba(239, 68, 68, 0.08)'
    }
  },
  {
    id: 2,
    name: 'Recorded Code Changes',
    cursorX: 42,
    cursorY: 38,
    label: 'Code diff recorded: verifies changes before applying',
    labelPos: {
      top: '10px',
      left: '12px',
      transform: 'none'
    },
    highlight: {
      left: '21%',
      top: '13%',
      width: '50%',
      height: '60%',
      border: '2px solid #0082FB',
      glow: '0 0 24px rgba(0, 130, 251, 0.35)',
      bg: 'rgba(0, 130, 251, 0.06)'
    }
  },
  {
    id: 3,
    name: 'Root-Cause Reasoner',
    cursorX: 84,
    cursorY: 46,
    label: 'Root-cause diagnosis: explains failure without raw logs',
    labelPos: {
      top: '10px',
      right: '10px',
      transform: 'none'
    },
    highlight: {
      left: '73%',
      top: '13%',
      width: '25%',
      height: '78%',
      border: '2px solid #8B5CF6',
      glow: '0 0 24px rgba(139, 92, 246, 0.35)',
      bg: 'rgba(139, 92, 246, 0.06)'
    }
  }
];

// Blue Sticker Notes with White Text for Section 3 (Generously Spaced, Plain-English, Zero Emojis)
const BLUE_STICKER_NOTES = [
  {
    id: 1,
    left: '100%',
    top: '50%',
    tilt: '-2deg',
    title: 'Stops Runaway Loops',
    note: 'Pauses agents when they get stuck repeating failing edits so you do not burn your API budget.',
    tag: 'Budget Protected'
  },
  {
    id: 2,
    left: '75%',
    top: '93.3%',
    tilt: '2deg',
    title: 'Instant Project Rewind',
    note: 'Rewinds your codebase back to the exact clean checkpoint before the AI broke anything.',
    tag: 'Instant Undo'
  },
  {
    id: 3,
    left: '25%',
    top: '93.3%',
    tilt: '-1.5deg',
    title: 'Black Box Recorder',
    note: 'Records every terminal command, file change, and tool invocation in real-time at 60 FPS.',
    tag: 'Flight Log'
  },
  {
    id: 4,
    left: '0%',
    top: '50%',
    tilt: '2.5deg',
    title: 'Explains Why It Broke',
    note: 'Translates complex agent crashes into plain English explanations in seconds with zero raw log dumps.',
    tag: 'Root Cause AI'
  },
  {
    id: 5,
    left: '25%',
    top: '6.7%',
    tilt: '-2deg',
    title: 'Preflight Code Diff',
    note: 'Inspects every added and deleted line before code changes touch your production branch.',
    tag: 'Diff Inspector'
  },
  {
    id: 6,
    left: '75%',
    top: '6.7%',
    tilt: '1.8deg',
    title: 'Safe Sandbox',
    note: 'Isolates risky package installs and commands so broken agent experiments never damage your computer.',
    tag: 'Safe Workspace'
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
  const transitionTrackRef = useRef<HTMLDivElement | null>(null);
  const [section3Slide, setSection3Slide] = useState(100);
  const [section4Slide, setSection4Slide] = useState(-100);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);

          if (transitionTrackRef.current) {
            const rect = transitionTrackRef.current.getBoundingClientRect();
            const vh = window.innerHeight || 800;

            // When rect.top > 0, track is below top of viewport -> sections parked off-screen
            if (rect.top > 0) {
              setSection3Slide(100);
              setSection4Slide(-100);
            } else {
              // Distance scrolled into the pinned track
              const scrolled = -rect.top;

              // Phase 1: Section 2 Dwell (~35% of viewport)
              const dwell2 = vh * 0.35;
              // Phase 2: Section 3 Slide in from Right (~90% of viewport)
              const slide3 = vh * 0.90;
              // Phase 3: Section 3 Dwell (~35% of viewport)
              const dwell3 = vh * 0.35;
              // Phase 4: Section 4 Slide in from Left (~90% of viewport)
              const slide4 = vh * 0.90;

              // 1. Section 3 calculation (slides from right: 100% -> 0%)
              if (scrolled <= dwell2) {
                setSection3Slide(100);
              } else if (scrolled >= dwell2 + slide3) {
                setSection3Slide(0);
              } else {
                const p3 = (scrolled - dwell2) / slide3;
                setSection3Slide((1 - p3) * 100);
              }

              // 2. Section 4 calculation (slides from left: -100% -> 0%)
              const startSec4 = dwell2 + slide3 + dwell3;
              if (scrolled <= startSec4) {
                setSection4Slide(-100);
              } else if (scrolled >= startSec4 + slide4) {
                setSection4Slide(0);
              } else {
                const p4 = (scrolled - startSec4) / slide4;
                setSection4Slide((p4 - 1) * 100);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const isHeroCovered = scrollY >= vh;

    const currentHero = HERO_ROTATING_LINES[heroIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090D16',
      color: '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* 1. HERO SECTION WITH BACKGROUND VIDEO PLAYER (VID1 TO VID4) - FIXED 100VH STATIC */}
      <section style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
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
        visibility: isHeroCovered ? 'hidden' : 'visible',
        pointerEvents: isHeroCovered ? 'none' : 'auto'
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

      {/* RISING OVERLAY CONTENT CONTAINER (RISES UP & COVERS STATIC HERO ON SCROLL) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginTop: '100vh',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '40px',
        borderTopRightRadius: '40px',
        boxShadow: '0 -30px 90px rgba(0, 0, 0, 0.45), 0 -4px 16px rgba(0, 0, 0, 0.15)',
        minHeight: '100vh'
      }}>
        {/* 2, 3 & 4: PINNED MULTI-LAYER STAGE (SEC 2 STATIC, SEC 3 SLIDES FROM RIGHT, SEC 4 SLIDES FROM LEFT) */}
      <div
        ref={transitionTrackRef}
        style={{
          position: 'relative',
          height: '420vh',
          width: '100%',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          {/* SECTION 2 (STAGNANT IN THE BACKGROUND: NO BLACK BARS, PROPORTIONATE WINDOW) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 32px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              maxWidth: '980px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Header */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '14px',
                gap: '20px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: 'clamp(22px, 2.2vw, 30px)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    color: '#09090b',
                    lineHeight: 1.15,
                    margin: '0 0 4px 0'
                  }}>
                    Beyond raw log dumps.<br />
                    <span style={{ color: '#0064E0' }}>Complete visibility in 60 FPS motion.</span>
                  </h2>
                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.4,
                    margin: 0
                  }}>
                    Chrono transforms autonomous agent execution into an interactive, cryptographically verified flight recorder.
                  </p>
                </div>

                <a
                  href={COCKPIT_URL}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0064E0',
                    textDecoration: 'none',
                    borderBottom: '2px solid #0064E0',
                    paddingBottom: '2px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Launch Cockpit
                  <IconArrowUpRight size={14} />
                </a>
              </div>

              {/* Cockpit Frame (Zero Black Sides, Perfectly Fits Screen Without Cutoff) */}
              <div
                ref={cockpitFrameRef}
                onMouseMove={handleCockpitMouseMove}
                onMouseLeave={handleCockpitMouseLeave}
                style={{
                  position: 'relative',
                  perspective: '1400px',
                  width: '100%',
                  maxWidth: 'min(960px, 92vw, calc((100vh - 170px) * 16 / 9))'
                }}
              >
                {/* Ambient Glow */}
                <div style={{
                  position: 'absolute',
                  inset: '-15px',
                  background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0, 100, 224, 0.16) 0%, rgba(113, 246, 210, 0.08) 40%, transparent 75%)',
                  filter: 'blur(35px)',
                  zIndex: 0,
                  pointerEvents: 'none',
                  animation: 'cockpitAmbientGlow 6s ease-in-out infinite'
                }} />

                {/* Chassis Window */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  transform: `perspective(1400px) rotateX(${cockpitTilt.y}deg) rotateY(${cockpitTilt.x}deg)`,
                  transition: 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)',
                  transformStyle: 'preserve-3d'
                }}>
                  {/* Clean White Window Titlebar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '9px 16px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #E5E7EB'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                    </div>
                  </div>

                  {/* Screenshot Stage: Zero Black Sides (Image fills 100% width naturally) */}
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    lineHeight: 0,
                    width: '100%'
                  }}>
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

                    {/* Laser scanline */}
                    <div className="cockpit-laser-sweep">
                      <div className="cockpit-laser-bar" />
                    </div>

                    {/* Click Highlights: Simple, Clean Text Written in Black */}
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
                            borderRadius: '8px',
                            opacity: isSelected ? 1 : 0,
                            transform: isSelected ? 'scale(1)' : 'scale(0.98)',
                            transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 25,
                            cursor: 'pointer',
                            pointerEvents: 'auto'
                          }}
                        >
                          {/* Simple Label Written in Black */}
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              ...target.labelPos,
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid rgba(0, 0, 0, 0.2)',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
                              whiteSpace: 'nowrap',
                              zIndex: 40,
                              pointerEvents: 'none',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                              animation: 'heroFadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both'
                            }}>
                              {target.label}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Virtual Mouse Cursor */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${cursorPos.x}%`,
                        top: `${cursorPos.y}%`,
                        transform: `translate(-4px, -2px) scale(${isClicking ? 0.82 : 1})`,
                        transition: 'left 0.72s cubic-bezier(0.25, 1, 0.5, 1), top 0.72s cubic-bezier(0.25, 1, 0.5, 1), transform 0.14s ease',
                        pointerEvents: 'none',
                        zIndex: 40,
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4.5 3.5L11.5 20.5L14.2 13.8L21 11L4.5 3.5Z"
                          fill="#0F172A"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {isClicking && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: '4px',
                            width: '24px',
                            height: '24px',
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
            </div>
          </div>

          {/* SECTION 3 (SLIDES IN FROM THE RIGHT: CHRONO CAPABILITIES IN EDITORIAL CONSTELLATION) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translateX(${section3Slide}%)`,
            willChange: 'transform',
            backgroundColor: '#F3F3F5',
            borderTopLeftRadius: '40px',
            borderBottomLeftRadius: '40px',
            boxShadow: '-40px 0 100px rgba(0, 0, 0, 0.45), -6px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: 30,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Rotating Clockwise Orbit Track for Sticker Notes (Spacious 860px Diameter) */}
            <div
              className="sticker-orbit-track"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 'min(860px, 84vh)',
                height: 'min(860px, 84vh)',
                pointerEvents: 'none',
                zIndex: 15
              }}
            >
              {BLUE_STICKER_NOTES.map((card) => (
                <div
                  key={card.id}
                  className="sticker-orbit-note"
                  style={{
                    position: 'absolute',
                    left: card.left,
                    top: card.top,
                    width: '165px',
                    height: '142px',
                    backgroundColor: '#0064E0',
                    borderRadius: '8px',
                    color: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 12px 24px -4px rgba(0, 100, 224, 0.42), 0 -1px 2px rgba(255, 255, 255, 0.15) inset',
                    padding: '16px 14px 12px 14px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    pointerEvents: 'auto',
                    cursor: 'default',
                    overflow: 'hidden',
                    ['--sticker-tilt' as any]: card.tilt,
                    transition: 'box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 12px -1px rgba(0, 0, 0, 0.15), 0 20px 36px -4px rgba(0, 100, 224, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 12px 24px -4px rgba(0, 100, 224, 0.42), 0 -1px 2px rgba(255, 255, 255, 0.15) inset';
                  }}
                >
                  {/* Top Adhesive Glue Strip Accent (Authentic Sticky Note look) */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)'
                  }} />

                  {/* Subtle Peeling Dog-Ear Corner at Bottom-Right */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 0 13px 13px',
                    borderColor: 'transparent transparent #004BB3 transparent',
                    filter: 'drop-shadow(-1px -1px 2px rgba(0,0,0,0.25))'
                  }} />

                  {/* Content: Clean text only, ZERO emojis */}
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.25,
                      marginBottom: '5px',
                      letterSpacing: '-0.01em'
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#EFF6FF',
                      lineHeight: 1.35
                    }}>
                      {card.note}
                    </div>
                  </div>

                  {/* Bottom Tag Pill */}
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    width: 'fit-content',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {card.tag}
                  </div>
                </div>
              ))}
            </div>

            {/* Central Headline & Get Started Pill (Updated to Chrono Autonomous Agents) */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              maxWidth: '820px',
              padding: '0 24px'
            }}>
              <h2 style={{
                fontSize: 'clamp(36px, 4.4vw, 64px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#09090b',
                lineHeight: 1.08,
                margin: '0 0 16px 0'
              }}>
                Chrono Autonomous Agents<br />
                Real <span style={{ color: '#0064E0' }}>Observability</span>
              </h2>

              <p style={{
                fontSize: 'clamp(13px, 1.05vw, 15px)',
                color: '#4B5563',
                maxWidth: '520px',
                margin: '0 auto 26px auto',
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                Database-grade flight data recording, microsecond state rollback, and cryptographic audit proofs for autonomous coding agents.
              </p>

              <a
                href={COCKPIT_URL}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '13px 34px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)';
                }}
              >
                Get Started
                <IconArrowUpRight size={15} />
              </a>
            </div>
          </div>

          {/* SECTION 4 (SLIDES IN FROM LEFT TO RIGHT: SINGLE IMPACTFUL SENTENCE ABOUT CHRONO) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translateX(${section4Slide}%)`,
            willChange: 'transform',
            backgroundColor: '#FFFFFF',
            borderTopRightRadius: '40px',
            borderBottomRightRadius: '40px',
            boxShadow: '40px 0 100px rgba(0, 0, 0, 0.45), 6px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: 40,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 clamp(24px, 6vw, 96px)',
            boxSizing: 'border-box'
          }}>
            <div style={{
              maxWidth: '960px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Category kicker */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#0064E0',
                backgroundColor: 'rgba(0, 100, 224, 0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                marginBottom: '28px',
                fontFamily: 'monospace'
              }}>
                CHRONO FLIGHT RECORDER
              </div>

              {/* The Single Impactful Sentence about Chrono */}
              <h2 style={{
                fontFamily: '"Georgia", "Times New Roman", serif',
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: '#0F172A',
                lineHeight: 1.25,
                margin: '0 0 28px 0'
              }}>
                Chrono is the flight data recorder for autonomous AI agents, recording every decision, intercepting runaway mistakes, and guaranteeing complete cryptographic truth.
              </h2>

              <p style={{
                fontSize: 'clamp(14px, 1.1vw, 16px)',
                color: '#64748B',
                maxWidth: '620px',
                margin: '0 0 36px 0',
                lineHeight: 1.55
              }}>
                From background terminal commands to multi-file refactors, Chrono gives engineering teams the determinism, safety, and instant rollback needed to run autonomous coding agents in production.
              </p>

              {/* Call to Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <a
                  href={COCKPIT_URL}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0064E0',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '13px 32px',
                    borderRadius: '9999px',
                    boxShadow: '0 8px 24px rgba(0, 100, 224, 0.28), 0 2px 6px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 100, 224, 0.38)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 100, 224, 0.28), 0 2px 6px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  Launch Cockpit
                  <IconArrowUpRight size={15} />
                </a>

                <a
                  href="https://github.com/ShawnTheCreator/Chrono"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#334155',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '13px 26px',
                    borderRadius: '9999px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#94A3B8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                >
                  View on GitHub
                  <IconArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <span>The Flight Data Recorder for Autonomous AI Agents</span>
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
