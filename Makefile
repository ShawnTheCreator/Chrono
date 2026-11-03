.PHONY: all build test bench verify demo record up clean

CXX ?= g++
BUILD_DIR ?= build
BIN_DIR ?= bin

all: build

build:
	@echo "==> Building Chrono C++20 Core..."
	@cmake -B $(BUILD_DIR) -G Ninja -DCMAKE_CXX_COMPILER=$(CXX)
	@cmake --build $(BUILD_DIR)

test: build
	@echo "==> [Gate 1/4] Running C++ Core CTest Suite..."
	@ctest --test-dir $(BUILD_DIR) --output-on-failure
	@echo "==> [Gate 2/4] Running Bridge Golden-File Tests..."
	@python bridge/tests/test_narrate.py
	@echo "==> [Gate 3/4] Running Web Cockpit Seek Determinism Test..."
	@node web/tests/seek_determinism.test.js
	@echo "==> [Gate 4/4] Running Forensic Cryptographic Verification..."
	@$(BUILD_DIR)/core/chronod --verify fixtures/runs/chrono-feature-attempt-1/session.chrono
	@echo "==> ALL CHRONO GATES PASSED (100% GREEN)!"

bench: build
	@echo "==> Running chronod Microbenchmarks..."
	@$(BUILD_DIR)/core/chronod --benchmark

verify: build
	@echo "==> Auditing Real Live Recorded Session..."
	@$(BUILD_DIR)/core/chronod --verify fixtures/recorded/live-agent-run.chrono
	@echo "==> Auditing Synthetic Benchmark Fixtures..."
	@$(BUILD_DIR)/core/chronod --verify fixtures/runs/chrono-feature-attempt-1/session.chrono
	@$(BUILD_DIR)/core/chronod --verify fixtures/runs/openrepo-maintenance-run/session.chrono

record: build
	@echo "==> Wrapping Live Session via Chrono..."
	@bash tools/record.sh

home:
	@echo "==> Starting Chrono Home Page Frontend on http://127.0.0.1:3000..."
	@pnpm --dir home start -p 3000 -H 127.0.0.1

cockpit:
	@echo "==> Starting Chrono Cockpit Frontend (Login -> Dashboard) on http://127.0.0.1:3001..."
	@pnpm --dir web start -p 3001 -H 127.0.0.1

demo: verify
	@echo "======================================================="
	@echo "           CHRONO DEMO ENVIRONMENT READY              "
	@echo "======================================================="
	@echo "1. Bridge Service: python -m uvicorn bridge.app.main:app (Port 8000)"
	@echo "2. Home Frontend:  pnpm run start:home (Port 3000)"
	@echo "3. Cockpit App:    pnpm run start:cockpit (Port 3001)"
	@echo "4. Demo Script:    docs/demo-script.md"
	@echo "======================================================="

up:
	@docker compose up --build

clean:
	@rm -rf $(BUILD_DIR) $(BIN_DIR)
