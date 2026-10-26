#pragma once

#include "chrono/event.h"
#include "chrono/hash_chain.h"
#include "chrono/checkpoint.h"
#include "chrono/index.h"
#include "chrono/stall_detector.h"
#include "chrono/telemetry.h"
#include <string>
#include <memory>

namespace chrono {

struct SessionMetadata {
    std::string session_id;
    std::string task_name;
    std::string model;
    std::string agent_framework = "muse_code";
    std::string workspace_path;
    std::string git_branch = "main";
    uint64_t start_wall_clock_ms = 0;
    uint64_t end_wall_clock_ms = 0;
};

class Session {
public:
    Session(SessionMetadata meta, const std::string& output_dir);
    ~Session();

    void record(Event event);
    void register_checkpoint(Checkpoint cp);

    void flush();
    void close();

    const SessionMetadata& metadata() const { return meta_; }
    const CheckpointRegistry& checkpoints() const { return checkpoints_; }
    const TimelineIndex& index() const { return index_; }
    const StallDetector& stall_detector() const { return stall_detector_; }
    const TelemetryEngine& telemetry() const { return telemetry_; }

    std::string log_filepath() const { return log_filepath_; }
    std::string index_filepath() const { return index_filepath_; }
    std::string meta_json() const;

private:
    SessionMetadata meta_;
    std::string output_dir_;
    std::string log_filepath_;
    std::string index_filepath_;

    std::unique_ptr<HashChainWriter> writer_;
    CheckpointRegistry checkpoints_;
    TimelineIndex index_;
    StallDetector stall_detector_;
    TelemetryEngine telemetry_;

    uint64_t current_file_offset_ = 0;
    bool is_closed_ = false;
};

} // namespace chrono
