import os
import json
import pathlib
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

try:
    from app.narrate import generate_narration
    from app.suggest import generate_suggestion
    from app.batch import generate_batch_report
    from app.stream import stream_tokens
except ImportError:
    from bridge.app.narrate import generate_narration
    from bridge.app.suggest import generate_suggestion
    from bridge.app.batch import generate_batch_report
    from bridge.app.stream import stream_tokens

app = FastAPI(
    title="Chrono Bridge — The Flight Instructor",
    description="Meta Model API causal narration & course-correction service for AI coding agents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_ROOT = pathlib.Path(__file__).parent.parent.parent.resolve()
FIXTURES_RECORDED = WORKSPACE_ROOT / "fixtures" / "recorded"
FIXTURES_RUNS = WORKSPACE_ROOT / "fixtures" / "runs"

class CheckpointNarrateRequest(BaseModel):
    checkpoint_id: Optional[str] = None
    git_tree_hash: Optional[str] = None
    event_offset: Optional[int] = 0
    raw_patch: Optional[str] = ""
    summary: Optional[str] = ""
    agent_thought: Optional[str] = ""
    recent_tool_calls: Optional[List[Dict[str, Any]]] = []

class SuggestRequest(BaseModel):
    pattern: str = "IDENTICAL_DIFF_LOOP"
    culprit: str = "core/src/hash_chain.cpp"
    cycle_count: int = 3
    description: str = "Agent repeated identical diff"

class BatchReportRequest(BaseModel):
    session_id: str
    total_tokens: Optional[int] = 48250
    stalls: Optional[List[Dict[str, Any]]] = []
    checkpoints: Optional[List[Dict[str, Any]]] = []

@app.get("/health")
def health():
    return {"status": "ok", "service": "chrono-bridge", "version": "1.0.0"}

@app.get("/sessions")
def list_sessions():
    sessions = []

    # 1. Check live recorded runs
    if FIXTURES_RECORDED.exists():
        meta_file = FIXTURES_RECORDED / "run_meta.json"
        if meta_file.exists():
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    sessions.append(json.load(f))
            except Exception:
                pass

    # 2. Check synthetic runs
    if FIXTURES_RUNS.exists():
        for item in FIXTURES_RUNS.iterdir():
            if item.is_dir():
                meta_file = item / "run_meta.json"
                if meta_file.exists():
                    try:
                        with open(meta_file, "r", encoding="utf-8") as f:
                            sessions.append(json.load(f))
                    except Exception:
                        pass
                else:
                    sessions.append({
                        "session_id": item.name,
                        "task_name": f"Run: {item.name}",
                        "model": "muse-spark-1026"
                    })
    return {"sessions": sessions}

@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    if session_id == "live-agent-run":
        meta_file = FIXTURES_RECORDED / "run_meta.json"
        checkpoints_file = FIXTURES_RECORDED / "checkpoints.json"
        meta = {}
        checkpoints = []
        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)
        if checkpoints_file.exists():
            with open(checkpoints_file, "r", encoding="utf-8") as f:
                checkpoints = json.load(f)
        return {"metadata": meta, "checkpoints": checkpoints}

    session_dir = FIXTURES_RUNS / session_id
    if not session_dir.exists():
        raise HTTPException(status_code=404, detail="Session not found")

    meta_file = session_dir / "run_meta.json"
    meta = {}
    if meta_file.exists():
        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)

    checkpoints_file = session_dir / "checkpoints.json"
    checkpoints = []
    if checkpoints_file.exists():
        with open(checkpoints_file, "r", encoding="utf-8") as f:
            checkpoints = json.load(f)

    return {"metadata": meta, "checkpoints": checkpoints}

@app.get("/sessions/{session_id}/events")
def get_events(session_id: str, limit: int = Query(1000, le=5000), offset: int = 0):
    if session_id == "live-agent-run":
        json_file = FIXTURES_RECORDED / "live-agent-run.json"
        if json_file.exists():
            with open(json_file, "r", encoding="utf-8") as f:
                all_events = json.load(f)
            paged = all_events[offset : offset + limit]
            return {"session_id": session_id, "offset": offset, "count": len(paged), "events": paged}

    session_dir = FIXTURES_RUNS / session_id
    events_file = session_dir / "events.jsonl"
    if not events_file.exists():
        raise HTTPException(status_code=404, detail="Events file not found")

    events = []
    with open(events_file, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if idx < offset:
                continue
            if len(events) >= limit:
                break
            line = line.strip()
            if line:
                try:
                    events.append(json.loads(line))
                except Exception:
                    continue

    return {"session_id": session_id, "offset": offset, "count": len(events), "events": events}

@app.post("/checkpoints/{checkpoint_id}/narrate")
def narrate_checkpoint(checkpoint_id: str, req: CheckpointNarrateRequest):
    data = req.dict()
    data["id"] = checkpoint_id
    return generate_narration(data)

@app.get("/checkpoints/{checkpoint_id}/narrate/stream")
def narrate_checkpoint_stream(checkpoint_id: str, summary: str = "", patch: str = ""):
    data = {
        "id": checkpoint_id,
        "summary": summary or "Checkpoint modification",
        "raw_patch": patch or "diff --git a/file b/file",
        "files_modified": ["core/include/chrono/hash_chain.h"]
    }
    narration = generate_narration(data)
    return StreamingResponse(stream_tokens(narration), media_type="text/event-stream")

@app.post("/suggest")
def suggest_intervention(req: SuggestRequest):
    return generate_suggestion(req.dict())

@app.post("/batch/report")
def batch_report(req: BatchReportRequest):
    return generate_batch_report(req.dict())
