#pragma once

#include "chrono/event.h"
#include <string>
#include <vector>
#include <deque>
#include <unordered_map>
#include <optional>

namespace chrono {

enum class StallPattern {
    NONE = 0,
    IDENTICAL_DIFF_LOOP = 1,
    TOOL_EXECUTION_FAILURE_LOOP = 2,
    PING_PONG_EDIT_LOOP = 3,
    READ_THRASHING_LOOP = 4,
    TOKEN_BURST_ZERO_PROGRESS = 5
};

inline const char* stall_pattern_to_string(StallPattern pattern) {
    switch (pattern) {
        case StallPattern::IDENTICAL_DIFF_LOOP: return "IDENTICAL_DIFF_LOOP";
        case StallPattern::TOOL_EXECUTION_FAILURE_LOOP: return "TOOL_EXECUTION_FAILURE_LOOP";
        case StallPattern::PING_PONG_EDIT_LOOP: return "PING_PONG_EDIT_LOOP";
        case StallPattern::READ_THRASHING_LOOP: return "READ_THRASHING_LOOP";
        case StallPattern::TOKEN_BURST_ZERO_PROGRESS: return "TOKEN_BURST_ZERO_PROGRESS";
        default: return "NONE";
    }
}

struct StallAlert {
    StallPattern pattern = StallPattern::NONE;
    uint32_t cycle_count = 0;
    std::string culprit;
    double confidence = 0.0;
    std::string description;
    std::string suggested_intervention;
    uint64_t triggered_at_seq = 0;
    uint64_t triggered_at_ts = 0;

    std::string to_json() const;
};

class StallDetector {
public:
    explicit StallDetector(size_t window_size = 20, uint32_t threshold_cycles = 3);

    // Feed event into the detector. If a loop is identified, returns a StallAlert
    std::optional<StallAlert> process_event(const Event& event);

    void reset();
    const std::vector<StallAlert>& detected_alerts() const { return alerts_; }

private:
    std::optional<StallAlert> check_diff_loops(const Event& event);
    std::optional<StallAlert> check_tool_failures(const Event& event);
    std::optional<StallAlert> check_thrashing(const Event& event);

    size_t window_size_;
    uint32_t threshold_cycles_;

    std::deque<Event> event_window_;
    std::vector<StallAlert> alerts_;

    // Tracking state
    std::unordered_map<std::string, uint32_t> diff_hashes_;
    std::string last_failed_tool_;
    std::string last_error_signature_;
    uint32_t consecutive_tool_failures_ = 0;
    uint32_t consecutive_reads_ = 0;
};

} // namespace chrono
