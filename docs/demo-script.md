# Chrono — 3-Minute Demo Script

> **Setting**: Cockpit open in browser (`http://localhost:5173`), terminal split showing `chronod` and `bridge`.
> **Audience**: Hackathon judges, systems engineers, AI platform leads.

---

### [00:00 - 00:30] — The Hook & The Problem
*"When an AI coding agent runs for 4 hours and succeeds, nobody knows what happened. When it burns 100,000 tokens in a loop and fails, nobody can explain why. Current agent logging is mutable, slow, and reports what happened, never why.*

*This is **Chrono**: the flight recorder and flight instructor for autonomous coding agents. Monorepo, C++20 zero-lock core, Meta Model API bridge, and a 60fps canvas cockpit."*

---

### [00:30 - 01:15] — The Cockpit & 60fps Time Travel
*(Action: Open Cockpit, grab the amber playhead on the canvas timeline scrubber, drag back and forth).*

*"Notice the timeline at the bottom. This is rendered on HTML5 Canvas at a locked 60 frames per second. As I scrub across this multi-hour run—which is Chrono itself being built by Muse Code—every single panel updates in real time:*
- *The repository tree on the left reflects the exact git tree snapshot at that nanosecond.*
- *The diff panel updates with syntax-highlighted additions and deletions.*
- *The reasoning transcript stays in lockstep with the agent's internal thoughts.*

*Under the hood, our C++ index table executes timeline queries in **238 nanoseconds**—70,000 times faster than a single frame budget."*

---

### [01:15 - 02:00] — Spotting the Stall & Clicking "Why?"
*(Action: Scrub to the red hazard badge at minute 29:00 where the stall detector triggered).*

*"Right here at minute 29, our C++ stall detector fired an alert. The agent hit a compiler failure and repeated the exact same diff 3 times in a row without making progress.*

*Now watch what happens when I click **Why?** in the Narration Panel.*

*(Action: Click 'Why?'. Streaming tokens appear in real time).*

*The Flight Instructor—powered by Meta's Muse Spark—reconstructs the causal hypothesis: the agent assumed the bug was in the cpp file, but the real issue was struct alignment in the un-opened header file. It tells us the hypothesis, the causal chain, and flags the risk score."*

---

### [02:00 - 02:30] — Surgical Course Correction
*(Action: Click 'Suggest Intervention').*

*"Instead of aborting the entire 4-hour run and starting over, the Flight Instructor generates a surgical intervention prompt:*
`INTERVENTION: Stop repeating diff on file. Inspect constructor parameter threshold_cycles_ instead.`

*We inject this prompt directly into the agent's context. Look at checkpoint #4: the agent immediately breaks out of the loop and test suite passes 100% green."*

---

### [02:30 - 03:00] — The Forensic Receipt & Verification
*(Action: Switch to terminal, run `chronod --verify`).*

```bash
./build/core/chronod --verify fixtures/runs/chrono-feature-attempt-1/session.chrono
```

*"Finally, how do we know this run is genuine? Anyone can edit a JSON file. Chrono logs are append-only SHA-256 Merkle chains. When I run `chronod --verify`, it audits all records in 2 milliseconds, verifies zero tampering, and prints an irrefutable cryptographic receipt.*

*Zero external dependencies on the hot path. 1 million events per second ingest. That is Chrono."*
