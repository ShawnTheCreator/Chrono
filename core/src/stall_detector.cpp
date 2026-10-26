#include "chrono/stall_detector.h"
#include "chrono/sha256.h"
#include <sstream>
#include <iomanip>

namespace chrono {

std::string StallAlert::to_json() const {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"pattern\": \"" << stall_pattern_to_string(pattern) << "\",\n"
       << "  \"cycle_count\": " << cycle_count << ",\n"
       << "  \"culprit\": \"" << culprit << "\",\n"
       << "  \"confidence\": " << std::fixed << std::setprecision(2) << confidence << ",\n"
       << "  \"description\": \"" << description << "\",\n"
       << "  \"suggested_intervention\": \"" << suggested_intervention << "\",\n"
       << "  \"triggered_at_seq\": " << triggered_at_seq << ",\n"
       << "  \"triggered_at_ts\": " << triggered_at_ts << "\n"
       << "}";
    return ss.str();
}

StallDetector::StallDetector(size_t window_size, uint32_t threshold_cycles)
    : window_size_(window_size), threshold_cycles_(threshold_cycles) {}

void StallDetector::reset() {
    event_window_.clear();
    alerts_.clear();
    diff_hashes_.clear();
    last_failed_tool_.clear();
    last_error_signature_.clear();
    consecutive_tool_failures_ = 0;
    consecutive_reads_ = 0;
}

std::optional<StallAlert> StallDetector::process_event(const Event& event) {
    event_window_.push_back(event);
    if (event_window_.size() > window_size_) {
        event_window_.pop_front();
    }

    if (auto alert = check_diff_loops(event)) {
        alerts_.push_back(*alert);
        return alert;
    }

    if (auto alert = check_tool_failures(event)) {
        alerts_.push_back(*alert);
        return alert;
    }

    if (auto alert = check_thrashing(event)) {
        alerts_.push_back(*alert);
        return alert;
    }

    return std::nullopt;
}

std::optional<StallAlert> StallDetector::check_diff_loops(const Event& event) {
    if (event.kind != EventKind::FILE_DIFF) return std::nullopt;

    // Hash the diff payload
    auto digest = crypto::SHA256::hash(event.payload);
    std::string hex = crypto::SHA256::to_hex(digest);

    uint32_t count = ++diff_hashes_[hex];
    if (count >= threshold_cycles_) {
        StallAlert alert;
        alert.pattern = StallPattern::IDENTICAL_DIFF_LOOP;
        alert.cycle_count = count;
        alert.culprit = "diff_hash:" + hex.substr(0, 8);
        alert.confidence = 0.98;
        alert.description = "Agent generated identical diff " + std::to_string(count) + " times without resolving the underlying error.";
        alert.suggested_intervention = "Stop attempting the same file edit. Step back, inspect the test error trace, and revise the core signature instead.";
        alert.triggered_at_seq = event.seq_id;
        alert.triggered_at_ts = event.timestamp_ns;
        return alert;
    }

    return std::nullopt;
}

std::optional<StallAlert> StallDetector::check_tool_failures(const Event& event) {
    if (event.kind != EventKind::TOOL_RESULT) return std::nullopt;

    bool is_failure = (event.payload.find("error") != std::string::npos ||
                       event.payload.find("FAILED") != std::string::npos ||
                       event.payload.find("exit code 1") != std::string::npos ||
                       event.payload.find("exit_code: 1") != std::string::npos ||
                       event.payload.find("fatal:") != std::string::npos);

    if (is_failure) {
        // Extract a signature (first 64 chars or error line)
        std::string sig = event.payload.substr(0, 64);
        if (sig == last_error_signature_) {
            consecutive_tool_failures_++;
        } else {
            last_error_signature_ = sig;
            consecutive_tool_failures_ = 1;
        }

        if (consecutive_tool_failures_ >= threshold_cycles_) {
            StallAlert alert;
            alert.pattern = StallPattern::TOOL_EXECUTION_FAILURE_LOOP;
            alert.cycle_count = consecutive_tool_failures_;
            alert.culprit = "tool_failure";
            alert.confidence = 0.95;
            alert.description = "Agent encountered the same tool failure " + std::to_string(consecutive_tool_failures_) + " times consecutively.";
            alert.suggested_intervention = "Break tool retry loop. Run an isolation diagnosis command before re-running the failed command.";
            alert.triggered_at_seq = event.seq_id;
            alert.triggered_at_ts = event.timestamp_ns;
            return alert;
        }
    } else {
        consecutive_tool_failures_ = 0;
        last_error_signature_.clear();
    }

    return std::nullopt;
}

std::optional<StallAlert> StallDetector::check_thrashing(const Event& event) {
    if (event.kind == EventKind::TOOL_CALL) {
        if (event.payload.find("read_file") != std::string::npos ||
            event.payload.find("list_dir") != std::string::npos ||
            event.payload.find("grep") != std::string::npos) {
            consecutive_reads_++;
            if (consecutive_reads_ >= threshold_cycles_ * 3) {
                StallAlert alert;
                alert.pattern = StallPattern::READ_THRASHING_LOOP;
                alert.cycle_count = consecutive_reads_;
                alert.culprit = "read_thrashing";
                alert.confidence = 0.85;
                alert.description = "Agent has executed " + std::to_string(consecutive_reads_) + " consecutive read/inspect calls without making progress or taking action.";
                alert.suggested_intervention = "Synthesize information gathered so far and proceed to code modification or testing.";
                alert.triggered_at_seq = event.seq_id;
                alert.triggered_at_ts = event.timestamp_ns;
                return alert;
            }
        } else {
            consecutive_reads_ = 0;
        }
    } else if (event.kind == EventKind::FILE_DIFF || event.kind == EventKind::CHECKPOINT) {
        consecutive_reads_ = 0;
    }
    return std::nullopt;
}

} // namespace chrono
