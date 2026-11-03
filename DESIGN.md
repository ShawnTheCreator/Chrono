# Chrono Design System & Anti-Slop Standards (DESIGN.md)

> **Standard Compliance**: Derived from `miqdadbadjuber/anti-slop`, `nutlope/hallmark` (Cobalt & Modern-Minimal materials), `VoltAgent/awesome-design-md`, and the **Official Meta Muse Design Language**.

---

## 1. Brand Identity & Color Systems

Chrono is engineered as the native Flight Data Recorder for **Meta Muse Code** and **Meta Muse Spark 1.3**. The system uses a two-tier color strategy separating external brand identity from high-density cockpit instrumentation:

### A. Meta Muse Primary Logo & Identity Colors (Home Page)
The external interface and primary "M" brand mark lean into the vibrant Meta AI signature color gradient, providing an energetic, approachable creative tone:
- **Bright Blue (`#0DACF1`)**: The dominant tone for the core Muse logo, primary brand accents, and active focus rings.
- **Vibrant Turquoise (`#71F6D2`)**: Energetic accent gradient used for telemetry pulses, verified cryptographic receipts, and safe flight indicators.
- **Soft Pink (`#F5A3E0`)**: Blended into the signature AI gradient (`linear-gradient(135deg, #0DACF1 0%, #71F6D2 50%, #F5A3E0 100%)`) to deliver a human-centric, creative tone.

### B. Muse App UI & Default Theme Colors (Dashboard & Cockpit)
Inside the cockpit workspace, UI elements shift to soft, readable shades to keep the chat-centric and telemetry-heavy screen completely distraction-free:
- **Clean True-to-White (`#FFFFFF`)**: Pure background color used for the core messaging layout, diff inspection panels, and chat bubbles.
- **Soft Pastel Pink (`#FDF2F8` / border `#FCE7F3`, text `#BE185D`) & Mint (`#E6FFFA` / border `#A7F3D0`, text `#0D9488`)**: Used for custom avatars, subtle category tags, and checkpoint badges.
- **Default Accent (Yellow / Red)**:
  - **Bold Mascot Yellow (`#F59E0B` / pill `#FEF3C7`)**: The signature Muse mascot profile and operator indicator.
  - **Stall Oxblood Red (`#EF4444` / `#CF222E`)**: Tripwire alerts and identical-diff loop detection.

---

## 2. Anti-Slop Hard Gates (Strict Prohibitions)

The following patterns are **permanently banned** across all Chrono surfaces:

1. **NO Generic Dark-Purple "AI" Gradients**: Banned lazy dark-purple-to-blue linear gradients (`#8a2be2 -> #4169e1`). Use the authentic Meta Muse triad (`#0DACF1` -> `#71F6D2` -> `#F5A3E0`).
2. **NO Tracked-Capital Eyebrows on Every Heading**: No repetitive `RELEASE 2.0 // INNOVATION` pills above ordinary titles.
3. **NO Cliché 3-Column Bento Cards**: No formulaic row of three identical rounded cards with generic SVGs (rocket, sparkle, shield).
4. **NO Hollow Marketing Prose**: Never use buzzwords like *"revolutionary"*, *"seamlessly orchestrate"*, *"supercharge"*, or *"cutting-edge"*. State concrete throughput, latency, and cryptographic properties.
5. **NO Single-Word Gradient Highlights**: Headlines must not contain exactly one rainbow or gradient-colored word.
6. **NO Fake Metrics or Testimonials**: No fabricated user quotes, fake enterprise logos, or synthetic review stars.
7. **NO Floating Glow Shadows**: Shadows must reflect physical surfaces (`0 1px 2px rgba(0,0,0,0.06)` or crisp stepped borders).

---

## 3. Typography Scale & Hierarchies

Dual-type system: Monospace for empirical telemetry + Grotesque for dense UI structure.

- **Primary UI / Headings**: `IBM Plex Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Hero Title: `48px`, weight `800`, letter-spacing `-0.035em`, line-height `1.12`
  - Section Title: `22px - 26px`, weight `700`, letter-spacing `-0.02em`
  - Body: `13px - 14px`, weight `400 / 500`, line-height `1.55`
- **Telemetry / Hashes / Code**: `JetBrains Mono`, `SF Mono`, `ui-monospace`, `monospace`
  - Readouts & Counters: `12px - 14px`, weight `600`, tabular figures (`font-variant-numeric: tabular-nums`)
  - Hash Chains & Wire Logs: `11px - 12px`, weight `500`

---

## 4. Delivery Gate Checklist

Before shipping any UI revision, verify:
- [x] Home Page uses authentic Meta Muse palette (`#0DACF1`, `#71F6D2`, `#F5A3E0`) and Muse "M" mark.
- [x] Dashboard uses Muse App UI theme (True-to-white `#FFFFFF`, Pastel Mint/Pink category highlights, Yellow mascot accent).
- [x] High-contrast accessibility: WCAG AAA text contrast across white surfaces.
- [x] Monospace data elements use tabular figures (`JetBrains Mono`).
- [x] Fully responsive across all viewports.
