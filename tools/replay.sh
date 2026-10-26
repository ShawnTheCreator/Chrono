#!/usr/bin/env bash
# Chrono Operator Tool: Verify and dump a recorded flight log
set -euo pipefail

INPUT="${1:-}"

if [ -z "$INPUT" ]; then
    echo "Usage: ./tools/replay.sh <session.chrono>"
    exit 1
fi

CHRONOD_BIN="./build/core/chronod"
if [ ! -f "$CHRONOD_BIN" ]; then
    CHRONOD_BIN="./bin/chronod"
fi

echo "======================================================="
echo "  CHRONO REPLAY: Cryptographic Verification Audit"
echo "  Source log: $INPUT"
echo "======================================================="

# 1. Run forensic verification
"$CHRONOD_BIN" --verify "$INPUT"

# 2. Dump human-readable JSON stream
echo "Dumping event stream to JSON..."
"$CHRONOD_BIN" --dump "$INPUT"
