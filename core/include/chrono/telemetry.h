#pragma once

#include "chrono/event.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <deque>
#include <cstdint>

namespace chrono {

struct TelemetrySnapshot {
    uint64_t timestamp_ns = 0;
    uint64_t total_prompt_tokens = 0;
    uint64_t total_completion_tokens = 0;
    uint64_t total_tokens = 0;
    double token_burn_velocity_tps = 0.0; // tokens/second
    double tool_call_rate_cpm = 0.0;       // calls/minute
    std::unordered_map<std::string, uint32_t> tool_distribution;
    double model_duty_cycle = 0.0;         // 0.0 to 1.0 (model vs tool wait)

    std::string to_json() const;
};

class TelemetryEngine {
public:
    explicit TelemetryEngine(uint64_t window_duration_ns = 60ULL * 1000 * 1000 * 1000); // 60s window

    void record_event(const Event& event);
    TelemetrySnapshot take_snapshot(uint64_t at_timestamp_ns = 0) const;

    void reset();

private:
    struct TokenSample {
        uint64_t timestamp_ns;
        uint32_t tokens;
    };

    struct ToolSample {
        uint64_t timestamp_ns;
        std::string tool_name;
    };

    uint64_t window_duration_ns_;
    uint64_t total_prompt_tokens_ = 0;
    uint64_t total_completion_tokens_ = 0;

    std::deque<TokenSample> token_history_;
    std::deque<ToolSample> tool_history_;
    std::unordered_map<std::string, uint32_t> tool_counts_;

    uint64_t last_event_ts_ = 0;
    uint64_t total_model_time_ns_ = 0;
    uint64_t total_tool_time_ns_ = 0;
    uint64_t last_turn_start_ts_ = 0;
    bool in_tool_call_ = false;
};

} // namespace chrono
