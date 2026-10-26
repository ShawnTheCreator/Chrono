# Chrono Bridge — The Flight Instructor

Chrono Bridge is the intelligent analysis layer of Chrono. While the C++ core (`chronod`) acts as the passive flight recorder, the Bridge acts as the **Flight Instructor**: it interprets what happened, answers *"Why did the agent make this change?"*, spots stalls, and formulates surgical course corrections.

Powered by **Meta Model API** & **Muse Spark** (`muse-spark-open-1026` via Baseten).

## Architecture

```text
+-------------------+             REST / SSE              +-----------------------------+
|    Web Cockpit    |  <===============================>  |       Chrono Bridge         |
|   (TypeScript)    |      /narrate, /suggest, /stream    |         (FastAPI)           |
+-------------------+                                     +--------------+--------------+
                                                                         |
                                              +--------------------------+--------------------------+
                                              |                                                     |
                                              v                                                     v
                                  +-----------------------+                             +-----------------------+
                                  |    Meta Model API     |                             |   Baseten Inference   |
                                  |      Muse Spark       |                             |  muse-spark-open-1026 |
                                  |   (Causal Narration)  |                             |  (Post-Run Reports)   |
                                  +-----------------------+                             +-----------------------+
```

## Features

1. **Causal Narration (`/checkpoints/{id}/narrate`)**:
   Instead of just showing git diffs, Muse Spark reconstructs the agent's causal chain: what error it encountered, what hypothesis it formed, and why it modified specific lines.
2. **Streaming Tokens (`/checkpoints/{id}/narrate/stream`)**:
   Real-time SSE token delivery directly into the UI's NarrationPanel.
3. **Course Correction (`/suggest`)**:
   When the agent loops in a compiler error or identical diffs, generates a surgical human-in-the-loop intervention prompt.
4. **Post-Run Retrospectives (`/batch/report`)**:
   Deep batch analysis scorecards powered by `muse-spark-open-1026`.

## Getting Started

```bash
cd bridge
pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
