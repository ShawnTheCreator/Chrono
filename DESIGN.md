# Chrono Design System & Anti-Slop Standards (DESIGN.md)

> **Standard Compliance**: Derived from `miqdadbadjuber/anti-slop`, `nutlope/hallmark` (Cobalt & Modern-Minimal materials), and `VoltAgent/awesome-design-md`.

---

## 1. Aesthetic Philosophy: High-Precision Forensic Instrument

Chrono is a flight data recorder for autonomous agents. It is not a consumer SaaS landing page; it is a **forensic instrumentation cockpit** designed to be scrutinized by systems engineers, cryptographers, and AI researchers.

Every pixel must communicate **speed, cryptographic finality, and auditability**:
- **Tone**: Spare, authoritative, empirical, mechanical.
- **Physicality**: Crisp 1px hairlines, machined borders, recessed monochrome wells, and tactile data density.
- **Truth over Decoration**: Every number is an exact metric (nanoseconds, bytes, hashes, tokens). No placeholder numbers, no decorative sparkles, no fake social proof.

---

## 2. Anti-Slop Hard Gates (Strict Prohibitions)

The following patterns are **permanently banned** from all Chrono surfaces:

1. **NO Neon/Purple "AI" Gradients**: Primary buttons and headers must NEVER use purple-to-blue linear gradients (`#8a2be2 -> #4169e1`).
2. **NO Tracked-Capital Eyebrows on Every Heading**: No repetitive `RELEASE 2.0 // INNOVATION` pills above ordinary titles.
3. **NO Cliché 3-Column Bento Cards**: No formulaic row of three identical rounded cards with generic SVGs (rocket, sparkle, shield).
4. **NO Hollow Marketing Prose**: Never use buzzwords like *"revolutionary"*, *"seamlessly orchestrate"*, *"supercharge"*, or *"cutting-edge"*. State concrete throughput, latency, and cryptographic properties.
5. **NO Single-Word Gradient Highlights**: Headlines must not contain exactly one rainbow or gradient-colored word.
6. **NO Fake Metrics or Testimonials**: No fabricated user quotes, fake enterprise logos, or synthetic review stars.
7. **NO Floating Glow Shadows**: Avoid excessive, unmotivated `box-shadow: 0 0 40px rgba(...)` blur halos. Shadows must reflect physical surfaces (`0 1px 2px rgba(0,0,0,0.06)` or crisp stepped borders).

---

## 3. Color Tokens & Semantic Palette

Chrono adheres to a light-dominant **GitHub Systems & Aviation Telemetry** palette with deep terminal contrast.

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `surface.bg` | `#ffffff` | Primary app & card background |
| `surface.canvas` | `#f6f8fa` | Structural outer canvas, telemetry well backdrop |
| `surface.inset` | `#0d1117` | Monospace code well, canvas scrubber viewport |
| `border.subtle` | `#e1e4e8` | Grid lines, secondary separators |
| `border.default` | `#d0d7de` | Primary card borders, button strokes |
| `border.strong` | `#24292f` | Active inputs, primary button edges |
| `text.primary` | `#0f172a` | High-contrast headings and body text |
| `text.secondary` | `#57606a` | Explanatory labels, parameter names |
| `text.muted` | `#8c959f` | Timestamps, sequence IDs, unit markers |
| `accent.green` | `#1a7f37` | **Diff Addition & Cryptographic Pass** (GitHub diff green) |
| `accent.oxblood` | `#cf222e` | **Diff Deletion & Stall Tripwire** (GitHub diff oxblood) |
| `accent.cyan` | `#0969da` | **Active Telemetry & Playhead** (Precision cobalt) |
| `accent.amber` | `#9a6700` | Warning, loop counter threshold warning |

---

## 4. Typography Scale & Hierarchies

Dual-type system: Monospace for empirical data + Grotesque for dense UI structure.

- **Primary UI / Headings**: `IBM Plex Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Hero Title: `44px - 48px`, weight `750`, letter-spacing `-0.03em`, line-height `1.15`
  - Section Title: `22px - 26px`, weight `700`, letter-spacing `-0.02em`
  - Card Title: `14px - 15px`, weight `650`, letter-spacing `-0.01em`
  - Body: `13px - 14px`, weight `400 / 500`, line-height `1.55`
- **Telemetry / Hashes / Code**: `JetBrains Mono`, `SF Mono`, `ui-monospace`, `monospace`
  - Readouts & Counters: `12px - 14px`, weight `600`, tabular figures (`font-variant-numeric: tabular-nums`)
  - Hash Chains & Wire Logs: `11px - 12px`, weight `500`

---

## 5. Layout Pacing & Asymmetry (Anti-Formula)

Pages must reject predictable card rows in favor of **asymmetric, technical macrostructures**:
1. **Split-Screen Telemetry Hero**: Left-heavy headline with concrete performance badges; right-anchored interactive 60fps canvas flight recorder.
2. **The Dissection Chamber**: Interactive, side-by-side comparison of **Corrupted Execution** vs **Surgically Intervened Flight**.
3. **Live Cryptographic Proof Feed**: Expandable table of actual SHA-256 Merkle records with root hash verification.
4. **Architectural Blueprints**: High-density circuit-style component diagrams with exact memory budgets (e.g. `24-byte CEP header`, `64MB circular ring`).

---

## 6. Micro-Interactions & Mechanical Tactility

- Buttons have a **1px tactile depress** on `:active` (`transform: translateY(1px)`).
- Hover transitions are fast and purposeful: `120ms ease-out` on border color and background; no languid float animations.
- All numbers and playheads animate with **tabular figures** to avoid layout twitching.
- The motion graphic loop is continuous, inspectable, and interactive: users can scrub, pause, and inspect the underlying payload.

---

## 7. Delivery Gate Checklist

Before shipping any UI revision, verify:
- [x] Zero purple/neon linear gradient buttons.
- [x] Zero generic 3-column card layouts.
- [x] All copy is factual systems engineering language.
- [x] High-contrast accessibility: `#0f172a` on `#ffffff` (ratio > 14:1).
- [x] Every button has `:hover`, `:active`, and `:focus-visible` rings.
- [x] Monospace data elements use tabular figures (`JetBrains Mono`).
- [x] Fully responsive from 360px mobile viewports to 4K ultra-wide displays.
