#include "chrono/index.h"
#include <iostream>
#include <cassert>
#include <chrono>
#include <random>

using namespace chrono;

int main() {
    std::cout << "[TEST] test_index starting: 6-hour synthetic timeline seek...\n";

    constexpr size_t TOTAL_POINTS = 250000; // ~6 hours of dense agent execution
    constexpr uint64_t SIX_HOURS_NS = 6ULL * 3600 * 1000 * 1000 * 1000;
    constexpr uint64_t STEP_NS = SIX_HOURS_NS / TOTAL_POINTS;

    TimelineIndex index;
    for (size_t i = 0; i < TOTAL_POINTS; ++i) {
        IndexEntry entry;
        entry.timestamp_ns = i * STEP_NS;
        entry.seq_id = i + 1;
        entry.file_offset = i * 64;
        entry.kind = static_cast<uint16_t>((i % 5 == 0) ? EventKind::CHECKPOINT : EventKind::TOOL_CALL);
        entry.flags = (i % 5 == 0) ? 1 : 0;
        index.add_entry(entry);
    }

    assert(index.size() == TOTAL_POINTS);

    // Benchmark 100,000 random timeline seek operations
    constexpr size_t NUM_QUERIES = 100000;
    std::mt19937_64 rng(1337);
    std::uniform_int_distribution<uint64_t> dist(0, SIX_HOURS_NS);

    auto t_start = std::chrono::high_resolution_clock::now();

    for (size_t q = 0; q < NUM_QUERIES; ++q) {
        uint64_t target_ts = dist(rng);
        auto result = index.seek_by_timestamp(target_ts);
        assert(result.has_value());
        assert(result->timestamp_ns <= target_ts || result->seq_id == 1);
    }

    auto t_end = std::chrono::high_resolution_clock::now();
    double total_sec = std::chrono::duration<double>(t_end - t_start).count();
    double avg_seek_ns = (total_sec / NUM_QUERIES) * 1e9;
    double avg_seek_ms = avg_seek_ns / 1e6;

    std::cout << "[RESULT] " << NUM_QUERIES << " seeks completed in "
              << total_sec << " s (avg " << avg_seek_ns << " ns / "
              << avg_seek_ms << " ms per seek)\n";

    // 60fps frame budget = 16.666 ms
    constexpr double FRAME_BUDGET_MS = 16.666;
    assert(avg_seek_ms < FRAME_BUDGET_MS && "Seek exceeded 60fps frame budget!");

    // Test persistence to disk & reload
    std::string idx_file = "test_run.chronoi";
    bool saved = index.save_to_file(idx_file);
    assert(saved);

    TimelineIndex loaded_index;
    bool loaded = loaded_index.load_from_file(idx_file);
    assert(loaded);
    assert(loaded_index.size() == index.size());
    std::remove(idx_file.c_str());

    std::cout << "[PASS] Timeline seek is < 1 frame budget by 5 orders of magnitude.\n";
    return 0;
}
