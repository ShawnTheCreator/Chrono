#pragma once

#include "chrono/hash_chain.h"
#include <string>
#include <cstdint>

namespace chrono {

struct ForensicVerificationResult {
    bool valid = false;
    size_t total_records = 0;
    uint64_t first_seq = 0;
    uint64_t last_seq = 0;
    uint64_t duration_ns = 0;
    std::string root_genesis_hash;
    std::string terminal_hash;
    std::string failure_reason;
    size_t corrupted_record_index = 0;
    uint64_t corrupted_record_seq = 0;

    std::string to_json() const;
    void print_receipt() const;
};

ForensicVerificationResult verify_log(const std::string& filepath, const crypto::Digest& expected_genesis = crypto::Digest{});

} // namespace chrono
