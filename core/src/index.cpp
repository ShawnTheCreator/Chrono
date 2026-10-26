#include "chrono/index.h"
#include <fstream>
#include <algorithm>
#include <iostream>

namespace chrono {

void TimelineIndex::add_entry(const IndexEntry& entry) {
    entries_.push_back(entry);
}

void TimelineIndex::build_from_log(const std::string& log_filepath) {
    entries_.clear();
    std::ifstream in(log_filepath, std::ios::binary);
    if (!in.is_open()) return;

    uint64_t current_offset = 0;
    while (in.peek() != EOF) {
        current_offset = static_cast<uint64_t>(in.tellg());
        EventWireHeader header;
        in.read(reinterpret_cast<char*>(&header), sizeof(EventWireHeader));
        if (in.gcount() != sizeof(EventWireHeader)) break;
        if (header.magic != CHRONO_MAGIC) break;

        IndexEntry entry;
        entry.timestamp_ns = header.timestamp_ns;
        entry.seq_id = header.seq_id;
        entry.file_offset = current_offset;
        entry.kind = header.kind;
        entry.flags = header.flags;
        entries_.push_back(entry);

        // Skip prev_hash (32) + payload (payload_length) + current_hash (32)
        in.seekg(32 + header.payload_length + 32, std::ios::cur);
    }
}

std::optional<IndexEntry> TimelineIndex::seek_by_timestamp(uint64_t timestamp_ns) const {
    if (entries_.empty()) return std::nullopt;

    auto it = std::lower_bound(
        entries_.begin(), entries_.end(), timestamp_ns,
        [](const IndexEntry& entry, uint64_t ts) {
            return entry.timestamp_ns < ts;
        }
    );

    if (it == entries_.end()) {
        return entries_.back();
    }
    if (it != entries_.begin() && it->timestamp_ns > timestamp_ns) {
        // Return closest earlier or equal point
        return *(it - 1);
    }
    return *it;
}

std::optional<IndexEntry> TimelineIndex::seek_by_sequence(uint64_t seq_id) const {
    if (entries_.empty()) return std::nullopt;

    auto it = std::lower_bound(
        entries_.begin(), entries_.end(), seq_id,
        [](const IndexEntry& entry, uint64_t seq) {
            return entry.seq_id < seq;
        }
    );

    if (it == entries_.end()) {
        return entries_.back();
    }
    return *it;
}

std::vector<IndexEntry> TimelineIndex::query_range_ts(uint64_t start_ts, uint64_t end_ts) const {
    std::vector<IndexEntry> res;
    auto first = std::lower_bound(
        entries_.begin(), entries_.end(), start_ts,
        [](const IndexEntry& e, uint64_t ts) { return e.timestamp_ns < ts; }
    );
    auto last = std::upper_bound(
        first, entries_.end(), end_ts,
        [](uint64_t ts, const IndexEntry& e) { return ts < e.timestamp_ns; }
    );
    res.insert(res.end(), first, last);
    return res;
}

std::vector<IndexEntry> TimelineIndex::query_range_seq(uint64_t start_seq, uint64_t end_seq) const {
    std::vector<IndexEntry> res;
    auto first = std::lower_bound(
        entries_.begin(), entries_.end(), start_seq,
        [](const IndexEntry& e, uint64_t seq) { return e.seq_id < seq; }
    );
    auto last = std::upper_bound(
        first, entries_.end(), end_seq,
        [](uint64_t seq, const IndexEntry& e) { return seq < e.seq_id; }
    );
    res.insert(res.end(), first, last);
    return res;
}

bool TimelineIndex::save_to_file(const std::string& index_filepath) const {
    std::ofstream out(index_filepath, std::ios::binary | std::ios::trunc);
    if (!out.is_open()) return false;

    uint32_t count = static_cast<uint32_t>(entries_.size());
    out.write(reinterpret_cast<const char*>(&count), sizeof(uint32_t));
    if (count > 0) {
        out.write(reinterpret_cast<const char*>(entries_.data()), count * sizeof(IndexEntry));
    }
    return true;
}

bool TimelineIndex::load_from_file(const std::string& index_filepath) {
    std::ifstream in(index_filepath, std::ios::binary);
    if (!in.is_open()) return false;

    uint32_t count = 0;
    in.read(reinterpret_cast<char*>(&count), sizeof(uint32_t));
    if (in.gcount() != sizeof(uint32_t)) return false;

    entries_.resize(count);
    if (count > 0) {
        in.read(reinterpret_cast<char*>(entries_.data()), count * sizeof(IndexEntry));
        if (in.gcount() != static_cast<std::streamsize>(count * sizeof(IndexEntry))) {
            entries_.clear();
            return false;
        }
    }
    return true;
}

} // namespace chrono
