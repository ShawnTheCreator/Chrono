#include "chrono/event.h"
#include <sstream>
#include <iomanip>

namespace chrono {

namespace {

std::string escape_json_string(std::string_view s) {
    std::ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else if (static_cast<unsigned char>(c) <= 0x1f) {
            o << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
        } else {
            o << c;
        }
    }
    return o.str();
}

} // namespace

std::string Event::to_json() const {
    std::ostringstream ss;
    ss << "{"
       << "\"seq_id\":" << seq_id << ","
       << "\"timestamp_ns\":" << timestamp_ns << ","
       << "\"kind\":\"" << event_kind_to_string(kind) << "\","
       << "\"flags\":" << flags << ","
       << "\"payload\":";

    // If payload is already valid JSON (starts with { or [), write as is; else quote it
    bool is_json = false;
    for (char c : payload) {
        if (std::isspace(c)) continue;
        if (c == '{' || c == '[') is_json = true;
        break;
    }

    if (is_json) {
        ss << payload;
    } else {
        ss << "\"" << escape_json_string(payload) << "\"";
    }
    ss << "}";
    return ss.str();
}

Event Event::from_json(std::string_view json_str) {
    Event ev;
    auto find_val = [&](std::string_view key) -> std::string {
        std::string search = "\"" + std::string(key) + "\":";
        auto pos = json_str.find(search);
        if (pos == std::string_view::npos) return "";
        pos += search.size();
        while (pos < json_str.size() && (json_str[pos] == ' ' || json_str[pos] == '\t')) pos++;
        if (pos >= json_str.size()) return "";

        if (json_str[pos] == '"') {
            auto end_quote = json_str.find('"', pos + 1);
            if (end_quote != std::string_view::npos) {
                return std::string(json_str.substr(pos + 1, end_quote - pos - 1));
            }
        } else {
            size_t end = pos;
            while (end < json_str.size() && json_str[end] != ',' && json_str[end] != '}') {
                end++;
            }
            return std::string(json_str.substr(pos, end - pos));
        }
        return "";
    };

    std::string seq_s = find_val("seq_id");
    if (!seq_s.empty()) ev.seq_id = std::stoull(seq_s);

    std::string ts_s = find_val("timestamp_ns");
    if (!ts_s.empty()) ev.timestamp_ns = std::stoull(ts_s);

    std::string kind_s = find_val("kind");
    if (!kind_s.empty()) ev.kind = event_kind_from_string(kind_s);

    std::string flags_s = find_val("flags");
    if (!flags_s.empty()) ev.flags = static_cast<uint16_t>(std::stoul(flags_s));

    // For payload, extract everything after "payload":
    std::string p_search = "\"payload\":";
    auto p_pos = json_str.find(p_search);
    if (p_pos != std::string_view::npos) {
        p_pos += p_search.size();
        while (p_pos < json_str.size() && std::isspace(json_str[p_pos])) p_pos++;
        if (p_pos < json_str.size()) {
            if (json_str[p_pos] == '"') {
                auto end_quote = json_str.rfind('"');
                if (end_quote > p_pos) {
                    ev.payload = std::string(json_str.substr(p_pos + 1, end_quote - p_pos - 1));
                }
            } else {
                auto end_brace = json_str.rfind('}');
                if (end_brace > p_pos) {
                    ev.payload = std::string(json_str.substr(p_pos, end_brace - p_pos));
                }
            }
        }
    }

    return ev;
}

} // namespace chrono
