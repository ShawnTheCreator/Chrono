#include "chrono/telemetry.h"
#include <sstream>
#include <iomanip>

namespace chrono {

std::string TelemetrySnapshot::to_json() const {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"timestamp_ns\": " << timestamp_ns << ",\n"
       << "  \"total_tokens\": " << total_tokens << ",\n"
       << "  \"prompt_tokens\": " << total_prompt_tokens << ",\n"
       << "  \"completion_tokens\": " << total_completion_tokens << ",\n"
       << "  \"burn_velocity_tps\": " << std::fixed << std::setprecision(2) << token_burn_velocity_tps << ",\n"
       << "  \"tool_rate_cpm\": " << std::fixed << std::setprecision(2) << tool_call_rate_cpm << ",\n"
       << "  \"model_duty_cycle\": " << std::fixed << std::setprecision(3) << model_duty_cycle << ",\n"
       << "  \"tool_distribution\": {";
    size_t i = 0;
    for (const auto& [tool, count] : tool_distribution) {
        ss << "\"" << tool << "\": " << count;
        if (++i < tool_distribution.size()) ss << ", ";
    }
    ss << "}\n}";
    return ss.str();
}

TelemetryEngine::TelemetryEngine(uint64_t window_duration_ns)
    : window_duration_ns_(window_duration_ns) {}

void TelemetryEngine::reset() {
    total_prompt_tokens_ = 0;
    total_completion_tokens_ = 0;
    token_history_.clear();
    tool_history_.clear();
    tool_counts_.clear();
    last_event_ts_ = 0;
    total_model_time_ns_ = 0;
    total_tool_time_ns_ = 0;
    in_tool_call_ = false;
}

void TelemetryEngine::record_event(const Event& event) {
    uint64_t ts = event.timestamp_ns;
    if (last_event_ts_ > 0 && ts >= last_event_ts_) {
        uint64_t delta = ts - last_event_ts_;
        if (in_tool_call_) {
            total_tool_time_ns_ += delta;
        } else {
            total_model_time_ns_ += delta;
        }
    }
    last_event_ts_ = ts;

    if (event.kind == EventKind::TELEMETRY_SAMPLE) {
        // Parse token counts if available in payload
        auto parse_num = [&](std::string_view key) -> uint32_t {
            std::string search = "\"" + std::string(key) + "\":";
            auto pos = event.payload.find(search);
            if (pos == std::string::npos) return 0;
            pos += search.size();
            while (pos < event.payload.size() && std::isspace(event.payload[pos])) pos++;
            size_t end = pos;
            while (end < event.payload.size() && std::isdigit(event.payload[end])) end++;
            if (end > pos) {
                return static_cast<uint32_t>(std::stoul(event.payload.substr(pos, end - pos)));
            }
            return 0;
        };

        uint32_t prompt = parse_num("prompt_tokens");
        uint32_t completion = parse_num("completion_tokens");
        uint32_t total = prompt + completion;
        if (total == 0) total = parse_num("tokens");

        total_prompt_tokens_ += prompt;
        total_completion_tokens_ += completion;

        token_history_.push_back({ts, total});
    } else if (event.kind == EventKind::TOOL_CALL) {
        in_tool_call_ = true;
        std::string tool_name = "unknown";
        auto pos = event.payload.find("\"tool\":");
        if (pos != std::string::npos) {
            pos += 7;
            while (pos < event.payload.size() && (event.payload[pos] == ' ' || event.payload[pos] == '"')) pos++;
            auto end = event.payload.find('"', pos);
            if (end != std::string::npos) {
                tool_name = event.payload.substr(pos, end - pos);
            }
        }
        tool_counts_[tool_name]++;
        tool_history_.push_back({ts, tool_name});
    } else if (event.kind == EventKind::TOOL_RESULT) {
        in_tool_call_ = false;
    }

    // Prune history older than window
    uint64_t cutoff = (ts > window_duration_ns_) ? (ts - window_duration_ns_) : 0;
    while (!token_history_.empty() && token_history_.front().timestamp_ns < cutoff) {
        token_history_.pop_front();
    }
    while (!tool_history_.empty() && tool_history_.front().timestamp_ns < cutoff) {
        tool_history_.pop_front();
    }
}

TelemetrySnapshot TelemetryEngine::take_snapshot(uint64_t at_timestamp_ns) const {
    TelemetrySnapshot snap;
    snap.timestamp_ns = (at_timestamp_ns > 0) ? at_timestamp_ns : last_event_ts_;
    snap.total_prompt_tokens = total_prompt_tokens_;
    snap.total_completion_tokens = total_completion_tokens_;
    snap.total_tokens = total_prompt_tokens_ + total_completion_tokens_;
    snap.tool_distribution = tool_counts_;

    // Burn velocity
    uint64_t window_tokens = 0;
    for (const auto& sample : token_history_) {
        window_tokens += sample.tokens;
    }
    double window_secs = static_cast<double>(window_duration_ns_) / 1e9;
    if (window_secs > 0) {
        snap.token_burn_velocity_tps = static_cast<double>(window_tokens) / window_secs;
        snap.tool_call_rate_cpm = (static_cast<double>(tool_history_.size()) / window_secs) * 60.0;
    }

    // Duty cycle
    uint64_t total_time = total_model_time_ns_ + total_tool_time_ns_;
    if (total_time > 0) {
        snap.model_duty_cycle = static_cast<double>(total_model_time_ns_) / static_cast<double>(total_time);
    }

    return snap;
}

} // namespace chrono
