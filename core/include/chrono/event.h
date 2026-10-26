#pragma once

#include <cstdint>
#include <string>
#include <string_view>
#include <vector>
#include <chrono>

namespace chrono {

enum class EventKind : uint16_t {
    UNKNOWN = 0,
    SESSION_START = 1,
    SESSION_END = 2,
    PROMPT = 10,
    AGENT_THOUGHT = 11,
    TOOL_CALL = 20,
    TOOL_RESULT = 21,
    FILE_DIFF = 30,
    CHECKPOINT = 40,
    TERMINAL_CMD = 50,
    STALL_ALERT = 60,
    TELEMETRY_SAMPLE = 70,
    INTERVENTION = 80
};

inline const char* event_kind_to_string(EventKind kind) {
    switch (kind) {
        case EventKind::SESSION_START: return "session_start";
        case EventKind::SESSION_END: return "session_end";
        case EventKind::PROMPT: return "prompt";
        case EventKind::AGENT_THOUGHT: return "agent_thought";
        case EventKind::TOOL_CALL: return "tool_call";
        case EventKind::TOOL_RESULT: return "tool_result";
        case EventKind::FILE_DIFF: return "file_diff";
        case EventKind::CHECKPOINT: return "checkpoint";
        case EventKind::TERMINAL_CMD: return "terminal_cmd";
        case EventKind::STALL_ALERT: return "stall_alert";
        case EventKind::TELEMETRY_SAMPLE: return "telemetry_sample";
        case EventKind::INTERVENTION: return "intervention";
        default: return "unknown";
    }
}

inline EventKind event_kind_from_string(std::string_view str) {
    if (str == "session_start") return EventKind::SESSION_START;
    if (str == "session_end") return EventKind::SESSION_END;
    if (str == "prompt") return EventKind::PROMPT;
    if (str == "agent_thought") return EventKind::AGENT_THOUGHT;
    if (str == "tool_call") return EventKind::TOOL_CALL;
    if (str == "tool_result") return EventKind::TOOL_RESULT;
    if (str == "file_diff") return EventKind::FILE_DIFF;
    if (str == "checkpoint") return EventKind::CHECKPOINT;
    if (str == "terminal_cmd") return EventKind::TERMINAL_CMD;
    if (str == "stall_alert") return EventKind::STALL_ALERT;
    if (str == "telemetry_sample") return EventKind::TELEMETRY_SAMPLE;
    if (str == "intervention") return EventKind::INTERVENTION;
    return EventKind::UNKNOWN;
}

#pragma pack(push, 1)
struct EventWireHeader {
    uint32_t magic;           // 'CHRO' = 0x4F524843 (little-endian)
    uint32_t total_length;    // Size of this record including header + hashes + payload
    uint64_t seq_id;          // Monotonic sequence number (1, 2, ...)
    uint64_t timestamp_ns;    // Nanoseconds monotonic
    uint16_t kind;            // EventKind
    uint16_t flags;           // Flags (bit 0: checkpoint, bit 1: stall)
    uint32_t payload_length;  // Size of payload buffer
};
#pragma pack(pop)

constexpr uint32_t CHRONO_MAGIC = 0x4F524843; // 'CHRO'

struct Event {
    uint64_t seq_id = 0;
    uint64_t timestamp_ns = 0;
    EventKind kind = EventKind::UNKNOWN;
    uint16_t flags = 0;
    std::string payload;

    static uint64_t now_monotonic_ns() {
        return static_cast<uint64_t>(
            std::chrono::duration_cast<std::chrono::nanoseconds>(
                std::chrono::steady_clock::now().time_since_epoch()
            ).count()
        );
    }

    std::string to_json() const;
    static Event from_json(std::string_view json_str);
};

} // namespace chrono
