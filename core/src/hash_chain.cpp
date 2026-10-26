#include "chrono/hash_chain.h"
#include <cstring>
#include <stdexcept>
#include <iostream>

namespace chrono {

crypto::Digest ChainRecord::compute_hash() const {
    crypto::SHA256 hasher;
    hasher.update(reinterpret_cast<const uint8_t*>(&header), sizeof(EventWireHeader));
    hasher.update(prev_hash.data(), prev_hash.size());
    if (!payload.empty()) {
        hasher.update(payload);
    }
    return hasher.finalize();
}

bool ChainRecord::verify_hash() const {
    return compute_hash() == current_hash;
}

HashChainWriter::HashChainWriter(const std::string& filepath, crypto::Digest genesis_hash)
    : filepath_(filepath), tail_hash_(genesis_hash) {
    out_.open(filepath, std::ios::binary | std::ios::out | std::ios::trunc);
    if (!out_.is_open()) {
        throw std::runtime_error("Failed to open hash chain log for writing: " + filepath);
    }
    is_open_ = true;
}

HashChainWriter::~HashChainWriter() {
    close();
}

void HashChainWriter::close() {
    if (is_open_) {
        out_.flush();
        out_.close();
        is_open_ = false;
    }
}

void HashChainWriter::flush() {
    if (is_open_) {
        out_.flush();
    }
}

ChainRecord HashChainWriter::append(EventKind kind, uint16_t flags, std::string_view payload, uint64_t timestamp_ns) {
    if (!is_open_) {
        throw std::runtime_error("HashChainWriter is not open");
    }

    current_seq_++;
    if (timestamp_ns == 0) {
        timestamp_ns = Event::now_monotonic_ns();
    }

    ChainRecord record;
    record.header.magic = CHRONO_MAGIC;
    record.header.total_length = static_cast<uint32_t>(
        sizeof(EventWireHeader) + 32 + payload.size() + 32
    );
    record.header.seq_id = current_seq_;
    record.header.timestamp_ns = timestamp_ns;
    record.header.kind = static_cast<uint16_t>(kind);
    record.header.flags = flags;
    record.header.payload_length = static_cast<uint32_t>(payload.size());

    record.prev_hash = tail_hash_;
    record.payload = std::string(payload);
    record.current_hash = record.compute_hash();

    // Write on-wire: Header + PrevHash + Payload + CurrentHash
    out_.write(reinterpret_cast<const char*>(&record.header), sizeof(EventWireHeader));
    out_.write(reinterpret_cast<const char*>(record.prev_hash.data()), 32);
    if (!record.payload.empty()) {
        out_.write(record.payload.data(), record.payload.size());
    }
    out_.write(reinterpret_cast<const char*>(record.current_hash.data()), 32);

    tail_hash_ = record.current_hash;
    return record;
}

ChainRecord HashChainWriter::append(const Event& event) {
    return append(event.kind, event.flags, event.payload, event.timestamp_ns);
}

HashChainReader::HashChainReader(const std::string& filepath)
    : filepath_(filepath) {
    in_.open(filepath, std::ios::binary | std::ios::in);
}

HashChainReader::~HashChainReader() {
    if (in_.is_open()) {
        in_.close();
    }
}

void HashChainReader::reset() {
    if (in_.is_open()) {
        in_.clear();
        in_.seekg(0, std::ios::beg);
    }
}

std::optional<ChainRecord> HashChainReader::next_record() {
    if (!in_.is_open() || in_.peek() == EOF) {
        return std::nullopt;
    }

    EventWireHeader header;
    in_.read(reinterpret_cast<char*>(&header), sizeof(EventWireHeader));
    if (in_.gcount() != sizeof(EventWireHeader)) {
        return std::nullopt;
    }

    if (header.magic != CHRONO_MAGIC) {
        return std::nullopt;
    }

    ChainRecord record;
    record.header = header;

    in_.read(reinterpret_cast<char*>(record.prev_hash.data()), 32);
    if (in_.gcount() != 32) return std::nullopt;

    if (header.payload_length > 0) {
        record.payload.resize(header.payload_length);
        in_.read(&record.payload[0], header.payload_length);
        if (static_cast<uint32_t>(in_.gcount()) != header.payload_length) return std::nullopt;
    }

    in_.read(reinterpret_cast<char*>(record.current_hash.data()), 32);
    if (in_.gcount() != 32) return std::nullopt;

    return record;
}

std::vector<ChainRecord> HashChainReader::read_all() {
    reset();
    std::vector<ChainRecord> records;
    while (auto rec = next_record()) {
        records.push_back(std::move(*rec));
    }
    return records;
}

} // namespace chrono
