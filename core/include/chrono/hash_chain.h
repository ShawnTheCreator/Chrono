#pragma once

#include "chrono/event.h"
#include "chrono/sha256.h"
#include <string>
#include <vector>
#include <fstream>
#include <optional>
#include <memory>

namespace chrono {

struct ChainRecord {
    EventWireHeader header;
    crypto::Digest prev_hash;
    std::string payload;
    crypto::Digest current_hash;

    bool verify_hash() const;
    crypto::Digest compute_hash() const;
};

class HashChainWriter {
public:
    explicit HashChainWriter(const std::string& filepath, crypto::Digest genesis_hash = crypto::Digest{});
    ~HashChainWriter();

    // Appends an event to the chain, returns the computed record
    ChainRecord append(EventKind kind, uint16_t flags, std::string_view payload, uint64_t timestamp_ns = 0);
    ChainRecord append(const Event& event);

    void flush();
    void close();

    uint64_t count() const { return current_seq_; }
    const crypto::Digest& tail_hash() const { return tail_hash_; }
    std::string tail_hash_hex() const { return crypto::SHA256::to_hex(tail_hash_); }

private:
    std::string filepath_;
    std::ofstream out_;
    uint64_t current_seq_ = 0;
    crypto::Digest tail_hash_;
    bool is_open_ = false;
};

class HashChainReader {
public:
    explicit HashChainReader(const std::string& filepath);
    ~HashChainReader();

    bool is_open() const { return in_.is_open(); }
    void reset();
    std::optional<ChainRecord> next_record();
    std::vector<ChainRecord> read_all();

private:
    std::string filepath_;
    std::ifstream in_;
};

} // namespace chrono
