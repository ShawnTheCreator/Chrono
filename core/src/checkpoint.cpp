#include "chrono/checkpoint.h"
#include "chrono/sha256.h"
#include <sstream>
#include <algorithm>

namespace chrono {

std::string Checkpoint::generate_id(std::string_view git_tree_hash, uint64_t event_offset) {
    std::string composite = std::string(git_tree_hash) + ":" + std::to_string(event_offset);
    auto digest = crypto::SHA256::hash(composite);
    return "chk_" + crypto::SHA256::to_hex(digest).substr(0, 16);
}

std::string Checkpoint::to_json() const {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"id\": \"" << id << "\",\n"
       << "  \"git_tree_hash\": \"" << git_tree_hash << "\",\n"
       << "  \"event_offset\": " << event_offset << ",\n"
       << "  \"timestamp_ns\": " << timestamp_ns << ",\n"
       << "  \"files_modified\": [";
    for (size_t i = 0; i < files_modified.size(); ++i) {
        ss << "\"" << files_modified[i] << "\"";
        if (i + 1 < files_modified.size()) ss << ", ";
    }
    ss << "],\n"
       << "  \"additions\": " << additions << ",\n"
       << "  \"deletions\": " << deletions << ",\n"
       << "  \"summary\": \"" << summary << "\"\n"
       << "}";
    return ss.str();
}

void CheckpointRegistry::register_checkpoint(Checkpoint cp) {
    if (cp.id.empty()) {
        cp.id = Checkpoint::generate_id(cp.git_tree_hash, cp.event_offset);
    }
    checkpoints_.push_back(std::move(cp));
}

const Checkpoint* CheckpointRegistry::find_by_id(std::string_view id) const {
    for (const auto& cp : checkpoints_) {
        if (cp.id == id) return &cp;
    }
    return nullptr;
}

const Checkpoint* CheckpointRegistry::find_nearest_before_seq(uint64_t seq) const {
    const Checkpoint* best = nullptr;
    for (const auto& cp : checkpoints_) {
        if (cp.event_offset <= seq) {
            if (!best || cp.event_offset > best->event_offset) {
                best = &cp;
            }
        }
    }
    return best;
}

const Checkpoint* CheckpointRegistry::find_nearest_before_ts(uint64_t ts) const {
    const Checkpoint* best = nullptr;
    for (const auto& cp : checkpoints_) {
        if (cp.timestamp_ns <= ts) {
            if (!best || cp.timestamp_ns > best->timestamp_ns) {
                best = &cp;
            }
        }
    }
    return best;
}

} // namespace chrono
