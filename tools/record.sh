#!/usr/bin/env bash
# Chrono Operator Tool: Record an agent session stream
set -euo pipefail

OUTPUT="${1:-session.chrono}"
INPUT_STREAM="${2:-}"

CHRONOD_BIN="./build/core/chronod"
if [ ! -f "$CHRONOD_BIN" ]; then
    CHRONOD_BIN="./bin/chronod"
fi

echo "======================================================="
echo "  CHRONO FLIGHT RECORDER: Starting live session capture"
echo "  Target log: $OUTPUT"
echo "======================================================="

if [ -n "$INPUT_STREAM" ]; then
    python3 adapters/muse_code/session_watcher.py --session-file "$INPUT_STREAM" --follow | "$CHRONOD_BIN" --record "$OUTPUT"
else
    python3 adapters/muse_code/session_watcher.py | "$CHRONOD_BIN" --record "$OUTPUT"
fi
