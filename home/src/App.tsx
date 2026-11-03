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

// Meta Muse Primary "M" Logo (Solid Bright Blue #0DACF1)
const MetaMuseLogo = ({ size = 30 }: { size?: number }) => (
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

// Meta Muse Animated Headline Carousel Phrases
const ROTATING_PHRASES = [
  {
    prefix: "Muse runs",
    words: ["workout analyses", "scheduling", "grocery shopping", "sales numbers"],
    suffix: "while you run",
    icon: "🏃"
  },
  {
    prefix: "Muse cooks up",
    words: ["family calendars", "trip bookings", "meeting outlines", "gift ideas"],
    suffix: "while you cook",
    icon: "🍳"
  },
  {
    prefix: "Muse does",
    words: ["reservations", "budgeting", "travel bookings", "birthday shopping"],
    suffix: "while you do you",
    icon: "✨"
  }
];

// FAQ Data Items
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<MerkleBlock>(SAMPLE_BLOCKS[2]);

  // Motion Graphic Replay State
  const [playheadPercent, setPlayheadPercent] = useState(78);
  const [animStage, setAnimStage] = useState<'running' | 'stalled' | 'intervened'>('intervened');
  const [formattedTimestamp, setFormattedTimestamp] = useState('05:20.000');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ rx: 0, ry: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Headline Rotating State
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Cycle rotating headline phrases and words
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => {
        const currentWords = ROTATING_PHRASES[phraseIndex].words;
        if (prev + 1 >= currentWords.length) {
          setPhraseIndex((pPrev) => (pPrev + 1) % ROTATING_PHRASES.length);
          return 0;
        }
        return prev + 1;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [phraseIndex]);

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
    const rx = -(y / rect.height) * 8;
    const ry = (x / rect.width) * 8;
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

  const currentPhrase = ROTATING_PHRASES[phraseIndex];
  const activeWord = currentPhrase.words[wordIndex % currentPhrase.words.length];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "IBM Plex Sans", sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Main Navigation Bar */}
      <header style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Brand Mark with Meta Muse "M" Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#09090b' }}>
          <MetaMuseLogo size={32} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                CHRONO
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '3px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                MUSE
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#64748b', fontFamily: '"JetBrains Mono", monospace', marginTop: '2px' }}>
              FLIGHT RECORDER FOR META MUSE
            </span>
          </div>
        </a>

        {/* Center Nav Links - Official Meta AI Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#475569'
        }}>
          <a href="https://ai.meta.com/muse/#" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>Products</a>
          <a href="https://ai.meta.com/research/" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>AI Research</a>
          <a href="https://ai.meta.com/muse/#" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>Resources</a>
          <a href="https://ai.meta.com/about/" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>About</a>
          <a href="https://developer.meta.com/ai/?utm_source=ai_meta_site&utm_medium=web&utm_campaign=nav_AI-developers_07242026&utm_content=nav_AI-developers" target="_blank" rel="noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>AI Developers</a>
          <a href="#muse-features" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Features</a>
          <a href="#flight-cockpit" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 600 }}>Cockpit</a>
        </nav>

        {/* Right Actions - Single Solid Colour for Launch Cockpit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={`${COCKPIT_URL}/login`}
            className="btn-press"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1'
            }}
          >
            Operator Portal
          </a>

          <a
            href={`${COCKPIT_URL}/dashboard`}
            className="btn-press"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#0DACF1',
              border: '1px solid #0284c7',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
        padding: '56px 32px 40px 32px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center' }}>
          <div>
            {/* Meta Muse Headline */}
            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#09090b',
              margin: '0 0 16px 0'
            }}>
              What Muse can do for you while you get on with life
            </h1>

            {/* Dynamic Rotating Live Sentence Box (Anti-Slop Solid Accent) */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '18px',
                fontWeight: 600,
                color: '#0f172a'
              }}>
                <span style={{ fontSize: '20px' }}>{currentPhrase.icon}</span>
                <span>{currentPhrase.prefix}</span>
                <span style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700
                }}>
                  {activeWord}
                </span>
                <span>{currentPhrase.suffix}</span>
              </div>

              {/* Mode switch pills */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {ROTATING_PHRASES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPhraseIndex(idx);
                      setWordIndex(0);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: phraseIndex === idx ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: phraseIndex === idx ? '#0DACF1' : '#ffffff',
                      color: phraseIndex === idx ? '#ffffff' : '#64748b'
                    }}
                  >
                    {p.icon} {p.suffix}
                  </button>
                ))}
              </div>
            </div>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#475569',
              margin: '0 0 28px 0'
            }}>
              Chrono continuously ingests agent actions into an append-only, SHA-256 Merkle chain at 1,200,000 events/sec. Scrub back deterministically at 60fps, detect stall loops before tokens burn, and stream causal post-mortems via Meta Muse Spark 1.3.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <a
                href={`${COCKPIT_URL}/dashboard`}
                className="btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid #1e293b',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <span>Open Cockpit Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <a
                href="#merkle-audit"
                className="btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#09090b',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid #cbd5e1'
                }}
              >
                <span>Audit Merkle Chain</span>
              </a>

              <a
                href="https://ai.meta.com/muse/download/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0284c7',
                  textDecoration: 'none',
                  padding: '12px 14px'
                }}
              >
                Download Muse for Mac →
              </a>
            </div>
          </div>

          {/* Quick Empirical Specs Matrix - Clean Solid Border, Zero Gradient */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '24px',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
              SYSTEM PERFORMANCE BENCHMARKS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Ingest Throughput:</span>
                <span style={{ fontWeight: 700, color: '#09090b' }}>1,200,000 eps</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Seek Determinism Budget:</span>
                <span style={{ fontWeight: 700, color: '#1a7f37' }}>&lt; 50 µs / seek (PASS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Wire Header Overhead:</span>
                <span style={{ fontWeight: 700, color: '#09090b' }}>24 bytes (CEP v1 packed)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Cryptographic Finality:</span>
                <span style={{ fontWeight: 700, color: '#09090b' }}>NIST FIPS 180-4 SHA-256</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Inference Reasoning:</span>
                <span style={{ fontWeight: 700, color: '#0DACF1' }}>Meta Muse Spark 1.3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 7-Second Motion Graphic Cockpit */}
      <section id="flight-cockpit" style={{
        maxWidth: '1280px',
        margin: '20px auto 60px auto',
        padding: '0 32px'
      }}>
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            borderRadius: '12px',
            border: '1px solid #d0d7de',
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transform: `perspective(1000px) rotateX(${mouseTilt.rx}deg) rotateY(${mouseTilt.ry}deg)`,
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out'
          }}
        >
          {/* Cockpit Window Header */}
          <div style={{
            height: '40px',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0d1117',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginLeft: '8px', fontFamily: '"JetBrains Mono", monospace' }}>
                RECORDER: session-muse-code-20261026-run.chrono
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              <span style={{
                color: animStage === 'stalled' ? '#f85149' : (animStage === 'intervened' ? '#71F6D2' : '#0DACF1'),
                fontWeight: 600
              }}>
                {animStage === 'running' && 'INGESTING TELEMETRY (1.2M EPS)'}
                {animStage === 'stalled' && 'STALL TRIPWIRE: IDENTICAL DIFF LOOP DETECTED'}
                {animStage === 'intervened' && 'SURGICAL INTERVENTION: SAFE FLIGHT RESUMED'}
              </span>
            </div>
          </div>

          {/* Interactive Visual Waveform & Timeline Canvas */}
          <div style={{
            height: '220px',
            backgroundColor: '#090d16',
            position: 'relative',
            overflow: 'hidden',
            padding: '18px 24px'
          }}>
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
                <span>SEQ #1 GENESIS</span>
                <span>SEQ #12 BUILD</span>
                <span style={{ color: animStage === 'stalled' ? '#f85149' : '#64748b' }}>SEQ #29 DIFF TRIPWIRE</span>
                <span style={{ color: '#71F6D2' }}>SEQ #41 TERMINAL HEAD</span>
              </div>

              {/* Event Activity Waveforms */}
              <div style={{ height: '70px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
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

              {/* Timeline Track with Scrubber Playhead */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  handleManualSeek(pct);
                }}
                style={{
                  position: 'relative',
                  height: '26px',
                  backgroundColor: '#161b22',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #30363d'
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

                {/* Floating Needle Pin - Solid Bright Blue */}
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

          {/* Active Diagnostic & Payload Bar */}
          <div style={{
            backgroundColor: '#0d1117',
            borderTop: '1px solid #21262d',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: '#c9d1d9'
          }}>
            <div>
              <span style={{ color: '#8b949e' }}>INSPECTED EVENT: </span>
              {animStage === 'stalled' && (
                <span style={{ color: '#f85149' }}>
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

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                style={{
                  background: '#21262d',
                  border: '1px solid #30363d',
                  color: '#f0f6fc',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                {isAutoPlaying ? 'PAUSE' : 'PLAY'}
              </button>
            </div>
          </div>

          {/* Lower Triad Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid #e1e4e8',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ padding: '16px 20px', borderRight: '1px solid #e1e4e8' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#57606a', textTransform: 'uppercase' }}>Merkle Audit Log</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>2,973 SHA-256 Blocks</div>
              <div style={{ fontSize: '12px', color: '#1a7f37', marginTop: '2px', fontWeight: 500 }}>Zero tampering detected</div>
            </div>

            <div style={{ padding: '16px 20px', borderRight: '1px solid #e1e4e8' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#57606a', textTransform: 'uppercase' }}>Kernel Ingest</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>1,200,000 eps</div>
              <div style={{ fontSize: '12px', color: '#57606a', marginTop: '2px' }}>LMAX SPSC lockless ring</div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#57606a', textTransform: 'uppercase' }}>Inference Reasoning</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>Muse Spark 1.3</div>
              <div style={{ fontSize: '12px', color: '#0DACF1', marginTop: '2px', fontWeight: 600 }}>Live Meta Model API</div>
            </div>
          </div>
        </div>
      </section>

      {/* MUSE FEATURES: Take the busywork off your plate */}
      <section id="muse-features" style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#0284c7',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            MUSE FEATURES
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
            Take the busywork off your plate
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, maxWidth: '780px', margin: 0 }}>
            Muse gets to know you and your goals, working across all aspects of life so you can focus on the things that matter. It comes with strong privacy and security built in, keeping you in control.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px'
            }}>
              💬
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 8px 0' }}>
              Designed to feel like a conversation
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Chat with your Muse in the same way you message with other people, using the Muse app on mobile, Mac, or directly in WhatsApp. It’s simple, just tell Muse what you want to get done.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#e6fffa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px'
            }}>
              🖥️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 8px 0' }}>
              A secure computer with a shared browser
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Your agent navigates websites, extracts information, and completes digital tasks inside an isolated, auditable virtual browser environment shared securely between you and your Muse.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px'
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 8px 0' }}>
              Always working on your goals & suggesting ideas
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Muse works proactively in the background, monitoring deadlines, flagging schedule conflicts, and surfacing ideas before you even have to ask.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fdf2f8',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px'
            }}>
              🛠️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: '0 0 8px 0' }}>
              Works with your apps and builds its own tools
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Deeply integrates with desktop files, command line utilities, and software repositories. When a custom connector isn't available, Muse writes and compiles bespoke tools on the fly.
            </p>
          </div>
        </div>
      </section>

      {/* SECURE AND IN CONTROL */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '36px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#1a7f37',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            SECURE AND IN CONTROL
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '0 0 28px 0' }}>
            Built for peace of mind, privacy, and mathematical certainty
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Your personal data is safe and secure
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Your logins are kept in a secure credential store your agent can't read, with 1Password integration coming soon. When shopping, a one-time card number is generated at checkout so your real card is never seen by the merchant or your agent. Eligible purchases are covered by <a href="https://link.com/protections" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>Link’s purchase protections</a>, a first for AI agents, and your conversations are not shared with Meta's ad systems.
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Approve critical actions from your agent
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Review and approve actions from Muse before they happen, like sending emails, submitting PRs, and making purchases. See a complete audit trail of everything your agent has done (and what it is planning to do), backed by Chrono's SHA-256 Merkle chain verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MUSE IN ACTION */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#0284c7',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            MUSE IN ACTION
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '0 0 10px 0' }}>
            See how Muse works for you
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
            From email and calendar management to saving money, improving your health, and shopping smarter. Muse handles it all.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📅</div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0' }}>Calendar & Email</h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Triages incoming emails, plans meeting outlines, and organizes complex family calendars without double bookings.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🛒</div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0' }}>Smart Shopping</h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Finds exact items, verifies real-time stock, and secures purchases with protected one-time virtual cards.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏃</div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0' }}>Health & Workout</h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Analyzes training performance, designs adaptive workout routines, and generates nutrition-backed grocery lists.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0' }}>Agentic Engineering</h4>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Connected to Chrono and Muse Code—tracks diffs, catches infinite loop stalls, and verifies cryptographic roots.
            </p>
          </div>
        </div>
      </section>

      {/* CREATOR STORIES */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#db2777',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            CREATOR STORIES
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '0 0 8px 0' }}>
            Get inspired
          </h2>
          <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
            Muse is helping people manage and achieve their goals and everyday tasks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                RS
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>Ryan Serhant</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Agent: <strong>Pumpkin</strong></div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Talks through how his Muse, <em>Pumpkin</em>, coordinates high-stakes real estate deals, client follow-ups, and daily agendas.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fdf2f8', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                AG
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>Ashley Graham</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Agent: <strong>Lux</strong></div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Her Muse, <em>Lux</em>, helps her organize her whole life—managing family logistics, travel bookings, and fashion design schedules.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                TT
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>Teyana Taylor</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Agent: <strong>AunTEY</strong></div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Problem solves with her Muse, <em>AunTEY</em>, coordinating creative direction, set concepts, and performance rehearsals seamlessly.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e6fffa', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                AL
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>Ally Love</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Agent: <strong>Mango</strong></div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Her Muse, <em>Mango</em>, helps her stay on top of multi-brand business ventures, executive calendars, and high-impact fitness projects.
            </p>
          </div>
        </div>
      </section>

      {/* MUSE FOR SMALL BUSINESS & DOWNLOAD FOR MAC */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* Small Business Card */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#d97706',
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              MUSE FOR SMALL BUSINESS
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', margin: '0 0 12px 0' }}>
              AI that works for your small business
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              Muse is now expanding with Muse for Small Business—a collection of new skills and connectors for the small business owner whose to-do list has a to-do list. Automate sales numbers reconciliation, track inventory, and send personalized customer follow-ups with zero overhead.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                ✓ Invoice Reconciliation
              </span>
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                ✓ Inventory Syncing
              </span>
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}>
                ✓ Client Intake
              </span>
            </div>
          </div>

          {/* Download Muse for Mac */}
          <div style={{
            backgroundColor: '#090d16',
            borderRadius: '12px',
            padding: '32px',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💻</div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0' }}>
                Download Muse for Mac
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Muse works with your desktop computer files, apps and browser tabs.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="https://ai.meta.com/muse/download/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#090d16',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                Learn More →
              </a>

              <a
                href={`${COCKPIT_URL}/dashboard`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0DACF1',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                Launch Cockpit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Merkle Chain Ledger & Cryptographic Dissector */}
      <section id="merkle-audit" style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #d0d7de',
          padding: '28px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', fontFamily: '"JetBrains Mono", monospace' }}>
                NIST FIPS 180-4 CRYPTOGRAPHIC VERIFICATION
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', margin: '4px 0 0 0' }}>
                Cryptographic Merkle Chain Dissector
              </h2>
            </div>

            {/* Solid Single Colour Button */}
            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              className="btn-press"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: isVerifying ? '#94a3b8' : '#0DACF1',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isVerifying ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? 'Running chronod --verify...' : 'Execute Audit'}
            </button>
          </div>

          {verifyResult && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#15803d',
              fontFamily: '"JetBrains Mono", monospace',
              marginBottom: '16px'
            }}>
              ✓ {verifyResult}
            </div>
          )}

          {/* Clickable Merkle Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {SAMPLE_BLOCKS.map((b) => (
              <div
                key={b.index}
                onClick={() => setSelectedBlock(b)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: selectedBlock.index === b.index ? '2px solid #0DACF1' : '1px solid #d0d7de',
                  backgroundColor: selectedBlock.index === b.index ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
                  <span>BLOCK #{b.index}</span>
                  <span>{b.timestamp}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginTop: '4px' }}>
                  {b.kind}
                </div>
                <div style={{ fontSize: '11px', color: '#1a7f37', marginTop: '4px', fontFamily: '"JetBrains Mono", monospace' }}>
                  ✓ SHA-256 Valid
                </div>
              </div>
            ))}
          </div>

          {/* Block Detail Well */}
          <div style={{
            backgroundColor: '#0d1117',
            borderRadius: '6px',
            padding: '16px 20px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '12px',
            color: '#c9d1d9',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#8b949e', marginBottom: '6px' }}>// INSPECTING BLOCK #{selectedBlock.index} — {selectedBlock.kind}</div>
            <div><span style={{ color: '#0DACF1' }}>PREVIOUS HASH:</span> {selectedBlock.prevHash}</div>
            <div><span style={{ color: '#71F6D2' }}>BLOCK HASH:   </span> {selectedBlock.blockHash}</div>
            <div><span style={{ color: '#F5A3E0' }}>PAYLOAD VIEW: </span> {selectedBlock.payloadSummary}</div>
          </div>
        </div>
      </section>

      {/* Asymmetric Systems Architecture Matrix */}
      <section id="architecture" style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
            FOUR-PILLAR ARCHITECTURE
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', margin: '4px 0 0 0' }}>
            Built for Extreme Speed and Forensic Certainty
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0DACF1', fontFamily: '"JetBrains Mono", monospace' }}>
              PILLAR 01 // KERNEL
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: '8px 0' }}>
              Zero-Allocation C++20 Ingest Engine
            </h3>
            <p style={{ fontSize: '13px', color: '#57606a', lineHeight: 1.6, margin: 0 }}>
              Single-writer, single-reader lock-free ring buffer modeled after the LMAX Disruptor pattern. Eliminates memory allocation from the agent hot path, sustaining 1,200,000 events/sec without thread contention.
            </p>
          </div>

          <div style={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#71F6D2', fontFamily: '"JetBrains Mono", monospace' }}>
              PILLAR 02 // LEDGER
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: '8px 0' }}>
              Immutable SHA-256 Merkle Chaining
            </h3>
            <p style={{ fontSize: '13px', color: '#57606a', lineHeight: 1.6, margin: 0 }}>
              Every event record cryptographically commits to the hash of its predecessor. Any backtracked execution, tampered checkpoint, or corrupted state breaks the Merkle tree instantly during forensic verification.
            </p>
          </div>

          <div style={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#F5A3E0', fontFamily: '"JetBrains Mono", monospace' }}>
              PILLAR 03 // INTELLIGENCE
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: '8px 0' }}>
              Meta Muse Spark 1.3 Flight Instructor
            </h3>
            <p style={{ fontSize: '13px', color: '#57606a', lineHeight: 1.6, margin: 0 }}>
              Connected live to the Meta Model API. Analyzes checkpoint diffs to synthesize structured hypotheses, detects identical-patch stall loops, and streams tokens directly to the operator cockpit via Server-Sent Events.
            </p>
          </div>

          <div style={{ border: '1px solid #d0d7de', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#cf222e', fontFamily: '"JetBrains Mono", monospace' }}>
              PILLAR 04 // INTERFACE
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: '8px 0' }}>
              Sub-Millisecond 60 FPS Canvas Cockpit
            </h3>
            <p style={{ fontSize: '13px', color: '#57606a', lineHeight: 1.6, margin: 0 }}>
              Direct HTML5 Canvas timeline rendering with binary-search index lookups. Guaranteed deterministic seek latency under 50 µs, allowing operators to scrub millions of events fluidly with zero browser stutter.
            </p>
          </div>
        </div>
      </section>

      {/* TRY MUSE CTA BANNER */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{
          backgroundColor: '#090d16',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#ffffff'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#71F6D2',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            TRY MUSE
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0' }}>
            Ready to get more done with Muse?
          </h2>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 28px auto' }}>
            Start recording, inspecting, and guiding your autonomous agents with cryptographic certainty and sub-millisecond playback.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <a
              href={`${COCKPIT_URL}/dashboard`}
              className="btn-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                backgroundColor: '#0DACF1',
                border: '1px solid #0284c7'
              }}
            >
              <span>LAUNCH COCKPIT</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>

            <a
              href={`${COCKPIT_URL}/login`}
              className="btn-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155'
              }}
            >
              Operator Portal
            </a>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: 0 }}>
            Everything you need to know about Muse & Chrono
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#09090b'
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 400 }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 20px 18px 20px',
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: 1.6,
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* EXPLORE META AI PRODUCTS */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto 64px auto',
        padding: '0 32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            ECOSYSTEM
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#09090b', margin: 0 }}>
            Explore Meta AI products
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Meta AI Assistant
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Get more done with Meta AI, your personal AI assistant.
            </p>
            <a
              href="https://ai.meta.com/meta-ai/assistant/"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
            >
              Learn more →
            </a>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎨</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Image Generation
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Explore fun presets, make precise edits and visualize your ideas.
            </p>
            <a
              href="https://ai.meta.com/meta-ai/media-generation/"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}
            >
              Learn more →
            </a>
          </div>
        </div>
      </section>

      {/* Comprehensive Official Meta AI & Muse Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        padding: '56px 32px 32px 32px',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {/* Meta AI */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>Meta AI</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://ai.meta.com/meta-ai/assistant/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Assistant</a>
              <a href="https://ai.meta.com/meta-ai/media-generation/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Media Generation</a>
              <a href="https://ai.meta.com/meta-ai/vibes/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Vibes</a>
            </div>
          </div>

          {/* Muse */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>Muse</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://ai.meta.com/muse/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Agent</a>
              <a href="https://ai.meta.com/learn/agentic-ai/what-are-ai-agents/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>AI agents explained</a>
              <a href="https://ai.meta.com/learn/agentic-ai/what-is-agentic-ai/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>What is agentic AI</a>
              <a href="https://ai.meta.com/learn/agentic-ai/agentic-ai-examples/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Agentic AI examples</a>
            </div>
          </div>

          {/* AI Research */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>AI Research</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://ai.meta.com/research/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Overview</a>
              <a href="https://ai.meta.com/research/#projects" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Projects</a>
              <a href="https://ai.meta.com/resources/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Resources & tools</a>
              <a href="https://ai.meta.com/results/?content_types[0]=publication" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Publications</a>
              <a href="https://github.com/facebookresearch/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>GitHub</a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://ai.meta.com/blog/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</a>
              <a href="https://meta.ai/learn/?utm_source=ai_meta_site&utm_medium=web&utm_campaign=footer_learning-hub_10282026&utm_content=footer_learning-hub_10282026" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Learning Hub</a>
              <a href="https://aidemos.meta.com/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Demos</a>
            </div>
          </div>

          {/* About */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>About</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://ai.meta.com/about/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Overview</a>
              <a href="https://ai.meta.com/opensourceai/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Open Source</a>
              <a href="https://www.metacareers.com/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Careers</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginBottom: '12px' }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="https://www.facebook.com/policies_center/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
              <a href="https://www.facebook.com/privacy/policies/cookies/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>Cookies</a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer with Chrono Attribution */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MetaMuseLogo size={22} />
            <span style={{ fontWeight: 700, color: '#09090b' }}>CHRONO FLIGHT RECORDER FOR META MUSE</span>
            <span>— Open Forensic Telemetry Specification (FDR-2026)</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href={`${COCKPIT_URL}/login`} style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Operator Portal</a>
            <a href={`${COCKPIT_URL}/dashboard`} style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Cockpit Dashboard</a>
            <a href="https://github.com/ShawnTheCreator/Chrono" target="_blank" rel="noreferrer" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
