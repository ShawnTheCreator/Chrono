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

// Meta "Infinity" Logo
const MetaInfinityLogo = ({ size = 26, color = '#0064E0' }: { size?: number; color?: string }) => (
  <svg width={size} height={size * 0.58} viewBox="0 0 100 58" fill="none">
    <path
      d="M78.6 3.6c-9.8 0-18.7 5.7-28.6 17.5C40.1 9.3 31.2 3.6 21.4 3.6 9.6 3.6 0 13.9 0 26.6c0 12.8 9.6 23.1 21.4 23.1 9.8 0 18.7-5.7 28.6-17.5 9.9 11.8 18.8 17.5 28.6 17.5 11.8 0 21.4-10.3 21.4-23.1C100 13.9 90.4 3.6 78.6 3.6zm-57.2 37.6c-7.2 0-12.8-6.4-12.8-14.6s5.6-14.6 12.8-14.6c7.2 0 13.7 5.6 21.2 14.6-7.5 9-14 14.6-21.2 14.6zm57.2 0c-7.2 0-13.7-5.6-21.2-14.6 7.5-9 14-14.6 21.2-14.6 7.2 0 12.8 6.4 12.8 14.6s-5.6 14.6-12.8 14.6z"
      fill={color}
    />
  </svg>
);

// Meta Muse Primary "M" Logo (Solid Bright Blue #0DACF1)
const MetaMuseLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#090d16" />
    <path
      d="M7.5 21.5V11.5C7.5 10.67 8.17 10 9 10C9.45 10 9.87 10.2 10.15 10.55L16 18L21.85 10.55C22.13 10.2 22.55 10 23 10C23.83 10 24.5 10.67 24.5 11.5V21.5"
      stroke="#0DACF1"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Hero Rotating Headlines matching real Meta Muse marketing
const HERO_ROTATING_LINES = [
  { prefix: "Muse runs", middle: "sales numbers", suffix: "while you run" },
  { prefix: "Muse runs", middle: "workout analyses", suffix: "while you run" },
  { prefix: "Muse runs", middle: "grocery shopping", suffix: "while you run" },
  { prefix: "Muse cooks up", middle: "family calendars", suffix: "while you cook" },
  { prefix: "Muse cooks up", middle: "trip bookings", suffix: "while you cook" },
  { prefix: "Muse does", middle: "travel reservations", suffix: "while you do you" },
  { prefix: "Muse does", middle: "budgeting & receipts", suffix: "while you do you" }
];

const FAQ_ITEMS = [
  {
    question: "What can Muse do?",
    answer: "Muse is a proactive personal AI agent that gets to know you and your goals, handling complex multi-step workflows across your email, calendar, travel, shopping, and everyday personal and business tasks."
  },
  {
    question: "How does Muse work?",
    answer: "Muse runs on advanced Meta AI models (including Muse Spark 1.3) combined with secure computer browser environments, custom app connectors, and Chrono's real-time flight telemetry recorder for full observability and tamper-evident auditing."
  },
  {
    question: "Is Muse free?",
    answer: "Core features of Muse and the Chrono flight recorder developer tools are free to explore during the early preview and developer release."
  },
  {
    question: "Is Muse safe?",
    answer: "Yes. Your logins are kept in a secure credential store your agent cannot read (with 1Password integration coming soon). When shopping, one-time card numbers protect your financial data, purchases are covered by Link purchase protections, and conversations are never shared with Meta's ad systems."
  },
  {
    question: "Does Muse keep working after I close the app?",
    answer: "Yes. Muse can continue working on long-running tasks and goals in the background, continuously recording every event into the immutable Chrono flight recorder so you can review exactly what transpired."
  },
  {
    question: "Does Muse ask before it acts on my behalf?",
    answer: "Yes. You have full approval control over critical actions such as sending emails, placing orders, or modifying code. Muse requests confirmation before executing high-impact steps."
  },
  {
    question: "What is a personal AI agent?",
    answer: "Unlike traditional static assistants that only answer prompts, a personal AI agent can autonomously navigate websites, use tools, create its own utilities, manage calendars, and accomplish multi-step objectives on your behalf."
  },
  {
    question: "How is a personal agent different from a chatbot or AI assistant?",
    answer: "A chatbot generates textual answers to prompts. A personal agent possesses persistent memory, plans complex action sequences, drives a secure browser, interacts with apps, and can be monitored through real-time forensic flight recorders."
  },
  {
    question: "What can a personal AI agent help with?",
    answer: "Everything from triaging overwhelming inboxes and coordinating family schedules, to tracking health routines, managing small business operations, and debugging autonomous codebases."
  }
];

export default function App() {
  // Navigation & Hero States
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

  // FAQ Accordion State (first item open by default like Meta Muse screenshot)
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
      {/* 1. HERO SECTION WITH RUNNER BACKGROUND & TOP NAV */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=2000&q=80')`,
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
          {/* Left Brand with Meta + Muse Mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}>
              <MetaInfinityLogo size={32} color="#ffffff" />
              <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>Muse</span>
            </a>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>|</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              CHRONO FLIGHT RECORDER
            </span>
          </div>

          {/* Center Links - Verbatim Meta AI Nav */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <a href="https://ai.meta.com/muse/#" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Products</a>
            <a href="https://ai.meta.com/research/" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>AI Research</a>
            <a href="https://ai.meta.com/muse/#" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Resources</a>
            <a href="https://ai.meta.com/about/" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>About</a>
            <a href="https://developer.meta.com/ai/?utm_source=ai_meta_site&utm_medium=web&utm_campaign=nav_AI-developers_07242026&utm_content=nav_AI-developers" target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>AI Developers</a>
            <a href="#cockpit-section" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Cockpit</a>
            <a href="#merkle-section" style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.9 }}>Ledger</a>
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <span>Try Muse</span>
            </a>
          </div>
        </header>

        {/* Center Hero Copy: Exactly like screenshot */}
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
            textShadow: '0 2px 14px rgba(0,0,0,0.45)'
          }}>
            {currentHero.prefix}<br />
            <span style={{ color: '#71F6D2' }}>{currentHero.middle}</span><br />
            {currentHero.suffix}
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '680px',
            margin: '0 auto 32px auto',
            lineHeight: 1.5,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)'
          }}>
            The autonomous personal AI agent that gets things done while you get on with life. Audited in real time by the Chrono flight data recorder.
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
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
            >
              Launch Cockpit
            </a>

            <a
              href="#muse-features"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
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

        {/* Bottom spacer for clean breathing room */}
        <div style={{ height: '40px' }} />
      </section>

      {/* 2. MUSE FEATURES: TAKE THE BUSYWORK OFF YOUR PLATE (2-COL ACCORDION + DEVICE MOCKUP) */}
      <section id="muse-features" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '96px 36px 80px 36px'
      }}>
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '56px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0064E0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            MUSE FEATURES
          </div>
          <h2 style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#09090b',
            lineHeight: 1.15,
            margin: '0 0 16px 0'
          }}>
            Take the busywork off your plate
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#475569',
            lineHeight: 1.6,
            margin: 0
          }}>
            Muse gets to know you and your goals, working across all aspects of life so you can focus on the things that matter. It comes with strong privacy and security built in, keeping you in control.
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
                  Designed to feel like a conversation
                </h3>
                <span style={{ fontSize: '20px', color: '#64748b' }}>{activeFeatureTab === 0 ? '⌄' : '›'}</span>
              </div>
              {activeFeatureTab === 0 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Chat with your Muse in the same way you message with other people, using the Muse app on mobile, Mac, or directly in WhatsApp. It’s simple, just tell Muse what you want to get done.
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
                  A secure computer with a browser shared by you and your agent
                </h3>
                <span style={{ fontSize: '20px', color: '#64748b' }}>{activeFeatureTab === 1 ? '⌄' : '›'}</span>
              </div>
              {activeFeatureTab === 1 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Your agent navigates, extracts information, and completes digital tasks inside an isolated, auditable virtual browser environment shared securely between you and your Muse.
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
                  Always working on your goals and suggesting ideas
                </h3>
                <span style={{ fontSize: '20px', color: '#64748b' }}>{activeFeatureTab === 2 ? '⌄' : '›'}</span>
              </div>
              {activeFeatureTab === 2 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Muse proactively monitors project deadlines, flags schedule conflicts, and surfaces ideas before you even have to ask.
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
                  Works with your apps and builds its own tools
                </h3>
                <span style={{ fontSize: '20px', color: '#64748b' }}>{activeFeatureTab === 3 ? '⌄' : '›'}</span>
              </div>
              {activeFeatureTab === 3 && (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '14px 0 0 0' }}>
                  Connects directly to your desktop files, CLI commands, and code repositories. When a custom connector isn't available, Muse writes and compiles bespoke tools on the fly.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Realistic Phone Mockup showing WhatsApp + One-time checkout card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: '40px',
              border: '10px solid #1f2937',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* WhatsApp / Muse Header */}
              <div style={{
                backgroundColor: '#075E54',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px'
                }}>
                  M
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>Muse Agent</div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>Online • WhatsApp</div>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div style={{
                backgroundColor: '#ECE5DD',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '380px'
              }}>
                {/* User Bubble */}
                <div style={{
                  alignSelf: 'flex-end',
                  backgroundColor: '#E7FFDB',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 2px 12px',
                  fontSize: '13px',
                  color: '#111827',
                  maxWidth: '80%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  Can you book the morning flight to Seattle and send me the receipt?
                </div>

                {/* Muse Bubble */}
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '12px 12px 12px 2px',
                  fontSize: '13px',
                  color: '#111827',
                  maxWidth: '88%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  I found the best itinerary (8:15 AM nonstop). Ready to purchase with a one-time Link virtual card:
                </div>

                {/* Protected Transaction Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #D1D5DB',
                  padding: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0064E0', textTransform: 'uppercase' }}>
                      Link Purchase Protection
                    </span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Covered ✓</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>
                    $225.00
                  </div>
                  <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '12px' }}>
                    One-time virtual card •••• 4921
                  </div>
                  <button
                    onClick={() => alert('Action Approved! Cryptographically committed to Chrono block #42.')}
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
                    Approve Purchase
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
          Built for privacy, peace of mind, and mathematical auditability
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
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '20px'
              }}>
                🔒
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                Your personal data is safe and secure
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                Your logins are kept in a secure credential store your agent can't read, with 1Password integration coming soon. When shopping, a one-time card number is generated at checkout so your real card is never seen by the merchant or your agent. Eligible purchases are covered by <a href="https://link.com/protections" target="_blank" rel="noreferrer" style={{ color: '#0064E0', textDecoration: 'underline' }}>Link’s purchase protections</a>, a first for AI agents, and your conversations are not shared with Meta's ad systems.
              </p>
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
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '20px'
              }}>
                🛡️
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px 0' }}>
                Approve critical actions from your agent
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Review and approve actions from Muse before they happen, like sending emails and making purchases. See a complete audit trail of everything your agent has done (and what it is planning to do).
              </p>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#047857',
                backgroundColor: '#ECFDF5',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                ✓ Backed by Chrono SHA-256 Merkle chain verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MUSE IN ACTION: "SEE HOW MUSE WORKS FOR YOU" BANNER */}
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
          MUSE IN ACTION
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 12px 0'
        }}>
          See how Muse works for you
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#4B5563',
          maxWidth: '720px',
          margin: '0 0 36px 0'
        }}>
          From email and calendar management to saving money, improving your health, and shopping smarter. Muse handles it all.
        </p>

        {/* Large Playful Light-Blue Banner exactly like screenshot */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '24px',
          padding: '80px 48px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h3 style={{
            fontSize: '52px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            lineHeight: 1.25,
            margin: '0 0 20px 0'
          }}>
            Muse 🐶 is your 📅 <br />
            personal AI 💼 agent
          </h3>

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
              fontSize: '16px'
            }}>
              👍
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
              fontSize: '16px'
            }}>
              👎
            </button>
          </div>
        </div>
      </section>

      {/* 5. CREATOR STORIES: "GET INSPIRED" (RYAN SERHANT, ASHLEY GRAHAM, TEYANA TAYLOR, ALLY LOVE) */}
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
              CREATOR STORIES
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Get inspired
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}>
              Muse is helping people manage and achieve their goals and everyday tasks.
            </p>
            <a
              href="https://ai.meta.com/muse/#"
              target="_blank"
              rel="noreferrer"
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
              Watch stories
            </a>
          </div>

          {/* 4 Portrait Creator Video Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Card 1: Ryan Serhant */}
            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%), url('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ▶
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                Ryan Serhant talks through how his Muse, <strong>Pumpkin</strong>, gets tasks done
              </div>
            </div>

            {/* Card 2: Ashley Graham */}
            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%), url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ▶
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                Ashley Graham’s Muse, <strong>Lux</strong>, helps her organize her whole life
              </div>
            </div>

            {/* Card 3: Teyana Taylor */}
            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%), url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ▶
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                Teyana Taylor problem solves with her Muse, <strong>AunTEY</strong>
              </div>
            </div>

            {/* Card 4: Ally Love */}
            <div style={{
              height: '380px',
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%), url('https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '18px',
              color: '#ffffff'
            }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ▶
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>
                Ally Love’s Muse, <strong>Mango</strong>, helps her stay on top of business
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MUSE FOR SMALL BUSINESS */}
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
              MUSE FOR SMALL BUSINESS
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#09090b',
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0'
            }}>
              AI that works for your small business
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#4B5563',
              lineHeight: 1.6,
              margin: '0 0 28px 0'
            }}>
              Muse is now expanding with Muse for Small Business—a collection of new skills and connectors for the small business owner whose to-do list has a to-do list.
            </p>
            <a
              href="https://ai.meta.com/muse/#"
              target="_blank"
              rel="noreferrer"
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
              Learn more
            </a>
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
              An AI agent that works for small business
            </h3>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>👍</span>
              <span style={{ fontSize: '18px' }}>👎</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DOWNLOAD MUSE FOR MAC */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          {/* macOS App Window Preview */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #D1D5DB',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}>
            {/* macOS Title Bar */}
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
              <span style={{ fontSize: '11px', color: '#6B7280', margin: '0 auto', fontWeight: 600 }}>Muse — Desktop Agent (Mac)</span>
            </div>

            {/* Window Content */}
            <div style={{ height: '240px', backgroundColor: '#F9FAFB', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                Files & Browser Sync Active
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>
                Connected to VS Code, Terminal, Safari tabs, and local workspace. Real-time telemetry streaming to Chrono flight recorder at 1.2M eps.
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
              Download Muse for Mac
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#4B5563',
              lineHeight: 1.5,
              margin: '0 0 32px 0'
            }}>
              Muse works with your desktop computer files, apps and browser tabs.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a
                href="https://ai.meta.com/muse/download/"
                target="_blank"
                rel="noreferrer"
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
                Download for Mac
              </a>

              <a
                href="https://ai.meta.com/muse/download/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0064E0',
                  textDecoration: 'none'
                }}
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRY MUSE FLOATING 3D ICONS PANORAMIC BANNER */}
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
          {/* Floating Icons */}
          <div style={{ position: 'absolute', top: '24px', left: '36px', fontSize: '32px' }}>📦</div>
          <div style={{ position: 'absolute', bottom: '24px', left: '60px', fontSize: '32px' }}>🎧</div>
          <div style={{ position: 'absolute', top: '30px', right: '48px', fontSize: '32px' }}>👟</div>
          <div style={{ position: 'absolute', bottom: '24px', right: '70px', fontSize: '32px' }}>📷</div>

          {/* Center Meta Muse "M" */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <MetaMuseLogo size={48} />
          </div>

          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#0064E0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            TRY MUSE
          </div>

          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: '0 0 24px 0'
          }}>
            Ready to get more done with Muse?
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
            Try Muse
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
            Continuous LMAX ring buffer telemetry at 1,200,000 eps with automated stall tripwire detection and live Meta Model API reasoning.
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
                RECORDER: session-muse-code-20261026-run.chrono
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
              marginBottom: '20px'
            }}>
              ✓ {verifyResult}
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
                <div style={{ fontSize: '11px', color: '#15803D', marginTop: '4px', fontFamily: '"JetBrains Mono", monospace' }}>
                  ✓ SHA-256 Valid
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

      {/* 11. FREQUENTLY ASKED QUESTIONS: VERTICAL CLEAN ACCORDION */}
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
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 36px 0'
        }}>
          Frequently Asked Questions
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
                  <span style={{ fontSize: '22px', color: '#6B7280', fontWeight: 300 }}>
                    {isOpen ? '−' : '+'}
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

      {/* 12. EXPLORE META AI PRODUCTS: 2 IMAGE CARDS */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 36px 96px 36px'
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 800,
          color: '#09090b',
          letterSpacing: '-0.02em',
          margin: '0 0 32px 0'
        }}>
          Explore Meta AI products
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Card 1: Meta AI Assistant */}
          <div style={{
            height: '340px',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%), url('https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '36px',
            color: '#ffffff'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '6px' }}>
              Meta AI Assistant
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.3 }}>
              Get more done with Meta AI, your personal AI assistant.
            </h3>
            <a
              href="https://ai.meta.com/meta-ai/assistant/"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textDecoration: 'none' }}
            >
              Learn more →
            </a>
          </div>

          {/* Card 2: Image Generation */}
          <div style={{
            height: '340px',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%), url('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '36px',
            color: '#ffffff'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '6px' }}>
              Media Generation
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.3 }}>
              Explore fun presets, make precise edits and visualize your ideas.
            </h3>
            <a
              href="https://ai.meta.com/meta-ai/media-generation/"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', textDecoration: 'none' }}
            >
              Learn more →
            </a>
          </div>
        </div>
      </section>

      {/* 13. OFFICIAL META FOOTER */}
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
          gridTemplateColumns: '1.2fr repeat(5, 1fr)',
          gap: '32px',
          marginBottom: '56px'
        }}>
          {/* Brand & Socials */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', marginBottom: '16px' }}>
              <MetaInfinityLogo size={32} color="#0064E0" />
              <span style={{ fontSize: '18px', fontWeight: 700 }}>Meta</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '16px', color: '#6B7280' }}>
              <span>📘</span>
              <span>📷</span>
              <span>💼</span>
              <span>▶</span>
              <span>𝕏</span>
            </div>
          </div>

          {/* Meta AI */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Meta AI</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://ai.meta.com/meta-ai/assistant/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Assistant</a>
              <a href="https://ai.meta.com/meta-ai/media-generation/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Media Generation</a>
              <a href="https://ai.meta.com/meta-ai/vibes/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Vibes</a>
            </div>
          </div>

          {/* Muse */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Muse</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://ai.meta.com/muse/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Agent</a>
              <a href="https://ai.meta.com/learn/agentic-ai/what-are-ai-agents/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>AI agents explained</a>
              <a href="https://ai.meta.com/learn/agentic-ai/what-is-agentic-ai/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>What is agentic AI</a>
              <a href="https://ai.meta.com/learn/agentic-ai/agentic-ai-examples/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Agentic AI examples</a>
            </div>
          </div>

          {/* AI Research */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>AI Research</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://ai.meta.com/research/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Overview</a>
              <a href="https://ai.meta.com/research/#projects" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Projects</a>
              <a href="https://ai.meta.com/resources/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Resources & tools</a>
              <a href="https://ai.meta.com/results/?content_types[0]=publication" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Publications</a>
              <a href="https://github.com/facebookresearch/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>GitHub</a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://ai.meta.com/blog/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Blog</a>
              <a href="https://meta.ai/learn/?utm_source=ai_meta_site&utm_medium=web&utm_campaign=footer_learning-hub_10282026&utm_content=footer_learning-hub_10282026" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Learning Hub</a>
              <a href="https://aidemos.meta.com/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Demos</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="https://www.facebook.com/policies_center/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Terms</a>
              <a href="https://www.facebook.com/privacy/policies/cookies/" target="_blank" rel="noreferrer" style={{ color: '#64748B', textDecoration: 'none' }}>Cookies</a>
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
            <MetaMuseLogo size={20} />
            <span style={{ fontWeight: 700, color: '#111827' }}>CHRONO FLIGHT RECORDER</span>
            <span>— Open Forensic Telemetry for Meta Muse (FDR-2026)</span>
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
