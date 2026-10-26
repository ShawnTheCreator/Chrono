#pragma once

#include "chrono/event.h"
#include <vector>
#include <cstdint>
#include <optional>
#include <string>

namespace chrono {

#pragma pack(push, 1)
struct IndexEntry {
    uint64_t timestamp_ns;
    uint64_t seq_id;
    uint64_t file_offset;
    uint16_t kind;
    uint16_t flags;
};
#pragma pack(pop)

class TimelineIndex {
public:
    TimelineIndex() = default;

    void add_entry(const IndexEntry& entry);
    void build_from_log(const std::string& log_filepath);

    // O(log n) seeking
    std::optional<IndexEntry> seek_by_timestamp(uint64_t timestamp_ns) const;
    std::optional<IndexEntry> seek_by_sequence(uint64_t seq_id) const;

    // Range queries
    std::vector<IndexEntry> query_range_ts(uint64_t start_ts, uint64_t end_ts) const;
    std::vector<IndexEntry> query_range_seq(uint64_t start_seq, uint64_t end_seq) const;

    // Persistence
    bool save_to_file(const std::string& index_filepath) const;
    bool load_from_file(const std::string& index_filepath);

    size_t size() const { return entries_.size(); }
    bool empty() const { return entries_.empty(); }
    const std::vector<IndexEntry>& entries() const { return entries_; }

    uint64_t min_timestamp() const { return entries_.empty() ? 0 : entries_.front().timestamp_ns; }
    uint64_t max_timestamp() const { return entries_.empty() ? 0 : entries_.back().timestamp_ns; }

private:
    std::vector<IndexEntry> entries_;
};

} // namespace chrono
