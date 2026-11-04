#include "chrono/stall_detector.h"
#include "chrono/sha256.h"
#include <cctype>
#include <iomanip>
#include <queue>
#include <sstream>
#include <unordered_set>

namespace chrono {

namespace {

std::string extract_json_string_field(const std::string& payload, const std::string& key) {
    std::string search = "\"" + key + "\"";
    size_t pos = payload.find(search);
    if (pos == std::string::npos) return "";
    pos += search.size();
    pos = payload.find(':', pos);
    if (pos == std::string::npos) return "";
    ++pos;
    while (pos < payload.size() &&
           std::isspace(static_cast<unsigned char>(payload[pos])) != 0) {
        ++pos;
    }
    if (pos >= payload.size()) return "";
    if (payload[pos] == '"') {
        ++pos;
        size_t end = payload.find('"', pos);
        if (end == std::string::npos) return "";
        return payload.substr(pos, end - pos);
    }
    size_t start = pos;
    size_t end = start;
    while (end < payload.size() && payload[end] != ',' && payload[end] != '}' &&
           std::isspace(static_cast<unsigned char>(payload[end])) == 0) {
        ++end;
    }
    return payload.substr(start, end - start);
}

bool is_handoff_tool(const std::string& tool) {
    if (tool == "handoff" || tool == "delegate" || tool == "transfer" || tool == "handover" ||
        tool == "route_to_agent" || tool == "send_to_agent" || tool == "delegate_to_agent" ||
        tool == "handoff_to_agent") {
        return true;
    }
    if (tool.find("handoff") != std::string::npos) return true;
    if (tool.find("delegate") != std::string::npos) return true;
    return false;
}

struct HandoffEdge {
    std::string from;
    std::string to;
};

bool parse_handoff(const std::string& payload, HandoffEdge& out) {
    std::string tool = extract_json_string_field(payload, "tool");
    if (!is_handoff_tool(tool)) {
        if (payload.find("handoff") == std::string::npos &&
            payload.find("delegate") == std::string::npos) {
            return false;
        }
        if (!tool.empty()) return false;
    }
    std::string from = extract_json_string_field(payload, "from");
    if (from.empty()) from = extract_json_string_field(payload, "from_agent");
    if (from.empty()) from = extract_json_string_field(payload, "source");
    if (from.empty()) from = extract_json_string_field(payload, "source_agent");
    std::string to = extract_json_string_field(payload, "to");
    if (to.empty()) to = extract_json_string_field(payload, "to_agent");
    if (to.empty()) to = extract_json_string_field(payload, "target");
    if (to.empty()) to = extract_json_string_field(payload, "target_agent");
    if (to.empty()) to = extract_json_string_field(payload, "delegate_to");
    if (from.empty() || to.empty()) return false;
    out.from = std::move(from);
    out.to = std::move(to);
    return true;
}

} // namespace

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
    diff_hash_window_.clear();
    last_failed_tool_.clear();
    last_error_signature_.clear();
    consecutive_tool_failures_ = 0;
    consecutive_reads_ = 0;
}

std::optional<StallAlert> StallDetector::process_event(const Event& event) {
    event_window_.push_back(event);
    if (event.kind == EventKind::FILE_DIFF) {
        auto digest = crypto::SHA256::hash(event.payload);
        diff_hash_window_.push_back(crypto::SHA256::to_hex(digest));
    } else {
        diff_hash_window_.emplace_back();
    }
    if (event_window_.size() > window_size_) {
        event_window_.pop_front();
        std::string evicted = std::move(diff_hash_window_.front());
        diff_hash_window_.pop_front();
        if (!evicted.empty()) {
            auto it = diff_hashes_.find(evicted);
            if (it != diff_hashes_.end()) {
                if (it->second <= 1) {
                    diff_hashes_.erase(it);
                } else {
                    --it->second;
                }
            }
        }
    }

    if (auto alert = check_circular_handoffs(event)) {
        alerts_.push_back(*alert);
        return alert;
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
    if (diff_hash_window_.empty()) return std::nullopt;

    const std::string& hex = diff_hash_window_.back();
    if (hex.empty()) return std::nullopt;

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

std::optional<StallAlert> StallDetector::check_circular_handoffs(const Event& event) {
    if (event.kind != EventKind::TOOL_CALL) return std::nullopt;

    HandoffEdge current;
    if (!parse_handoff(event.payload, current)) return std::nullopt;

    if (current.from == current.to) {
        StallAlert alert;
        alert.pattern = StallPattern::CIRCULAR_HANDOFF_LOOP;
        alert.cycle_count = 1;
        alert.culprit = current.from + "->" + current.to;
        alert.confidence = 0.97;
        alert.description = "Circular tool handoff detected: agent '" + current.from +
                            "' delegated to itself within the sliding window.";
        alert.suggested_intervention =
            "Break the delegation cycle. Assign the task to a single owner and require "
            "progress before further handoffs.";
        alert.triggered_at_seq = event.seq_id;
        alert.triggered_at_ts = event.timestamp_ns;
        return alert;
    }

    std::unordered_map<std::string, std::vector<std::string>> adj;
    for (const auto& ev : event_window_) {
        if (ev.kind != EventKind::TOOL_CALL) continue;
        HandoffEdge edge;
        if (!parse_handoff(ev.payload, edge)) continue;
        adj[edge.from].push_back(edge.to);
    }

    std::queue<std::string> bfs;
    std::unordered_map<std::string, std::string> parent;
    std::unordered_set<std::string> visited;
    bfs.push(current.to);
    visited.insert(current.to);
    parent[current.to] = "";

    bool found = false;
    while (!bfs.empty() && !found) {
        std::string node = std::move(bfs.front());
        bfs.pop();
        auto it = adj.find(node);
        if (it == adj.end()) continue;
        for (const auto& next : it->second) {
            if (visited.count(next) != 0) continue;
            visited.insert(next);
            parent[next] = node;
            if (next == current.from) {
                found = true;
                break;
            }
            bfs.push(next);
        }
    }

    if (!found) return std::nullopt;

    std::vector<std::string> path;
    path.push_back(current.from);
    std::string node = current.from;
    while (node != current.to) {
        auto it = parent.find(node);
        if (it == parent.end()) return std::nullopt;
        node = it->second;
        path.push_back(node);
    }
    std::string culprit = current.from;
    for (auto it = path.rbegin(); it != path.rend(); ++it) {
        culprit += "->" + *it;
    }

    StallAlert alert;
    alert.pattern = StallPattern::CIRCULAR_HANDOFF_LOOP;
    alert.cycle_count = static_cast<uint32_t>(path.size());
    alert.culprit = culprit;
    alert.confidence = 0.97;
    alert.description = "Circular tool handoff detected: " + culprit +
                        " forms a closed delegation loop within the sliding window.";
    alert.suggested_intervention =
        "Break the delegation cycle. Assign the task to a single owner and require "
        "progress before further handoffs.";
    alert.triggered_at_seq = event.seq_id;
    alert.triggered_at_ts = event.timestamp_ns;
    return alert;
}

} // namespace chrono
