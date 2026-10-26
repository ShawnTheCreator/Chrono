#pragma once

#include <string>
#include <vector>
#include <cstdint>
#include <string_view>

namespace chrono {

struct Checkpoint {
    std::string id;
    std::string git_tree_hash;
    uint64_t event_offset = 0;
    uint64_t timestamp_ns = 0;
    std::vector<std::string> files_modified;
    int32_t additions = 0;
    int32_t deletions = 0;
    std::string summary;
    std::string raw_patch;

    static std::string generate_id(std::string_view git_tree_hash, uint64_t event_offset);
    std::string to_json() const;
    static Checkpoint from_json(std::string_view json_str);
};

class CheckpointRegistry {
public:
    void register_checkpoint(Checkpoint cp);
    const std::vector<Checkpoint>& all() const { return checkpoints_; }
    const Checkpoint* find_by_id(std::string_view id) const;
    const Checkpoint* find_nearest_before_seq(uint64_t seq) const;
    const Checkpoint* find_nearest_before_ts(uint64_t ts) const;
    size_t size() const { return checkpoints_.size(); }

private:
    std::vector<Checkpoint> checkpoints_;
};

} // namespace chrono
