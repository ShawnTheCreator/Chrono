# Muse Code Capture Adapter

This directory implements the live capture adapter for **Muse Code** sessions.

## Architecture

```text
+-------------------+        JSONL / Stream        +------------------------+        CEP v1        +-------------------+
|  Muse Code Agent  |  ------------------------->  | muse_code/             |  ----------------->  |   chronod         |
|  Session Runtime  |  (IPC socket or file tail)   | session_watcher        |    (stdin pipe)      | (Flight Recorder) |
+-------------------+                              +------------------------+                      +-------------------+
```

## How It Works

1. **Tap Points**:
   - **Transcript Tail**: Muse Code writes its live execution log to `~/.muse/sessions/<session_id>/transcript.jsonl`.
   - **Workspace FS Watcher**: Git status and diffs are computed on every tool step completion to produce deterministic checkpoints.
2. **Normalization Engine**:
   - Strips proprietary internal prompt templates.
   - Maps raw model messages into standard CEP-v1 `agent_thought`, `tool_call`, `tool_result`, and `file_diff` events.
   - Computes monotonic nanosecond timestamps anchored to session start.

## Event Mapping Table

| Muse Code Field / Pattern | Chrono CEP v1 Kind | Payload Extraction |
|---|---|---|
| `type == "agent_thought"` | `agent_thought` | `content` string |
| `type == "tool_use"` | `tool_call` | `name`, `parameters` |
| `type == "tool_result"` | `tool_result` | `output`, `exit_code`, `status` |
| Git commit / tree change | `checkpoint` | `git_tree_hash`, file diff list, additions/deletions |
| Loop / error cycle detected | `stall_alert` | Repetition signature, confidence, intervention hint |
| Token usage block | `telemetry_sample` | `prompt_tokens`, `completion_tokens`, burn velocity |

## Running the Adapter

```bash
# Python implementation (recommended for rapid agent wrapping)
python adapters/muse_code/session_watcher.py --session-file /path/to/transcript.jsonl | ./bin/chronod --record session.chrono

# C++ zero-dependency implementation (recommended for embedded daemon deployment)
./bin/chrono_muse_adapter --watch /path/to/session.sock | ./bin/chronod --record session.chrono
```
