#include "chrono/verify.h"
#include <iostream>
#include <sstream>
#include <iomanip>

namespace chrono {

ForensicVerificationResult verify_log(const std::string& filepath, const crypto::Digest& expected_genesis) {
    ForensicVerificationResult res;
    res.root_genesis_hash = crypto::SHA256::to_hex(expected_genesis);

    HashChainReader reader(filepath);
    if (!reader.is_open()) {
        res.valid = false;
        res.failure_reason = "Cannot open log file at " + filepath;
        return res;
    }

    crypto::Digest expected_prev = expected_genesis;
    uint64_t prev_seq = 0;
    uint64_t first_ts = 0;
    uint64_t last_ts = 0;
    size_t index = 0;

    while (auto opt_record = reader.next_record()) {
        const auto& rec = *opt_record;

        // 1. Magic check
        if (rec.header.magic != CHRONO_MAGIC) {
            res.valid = false;
            res.corrupted_record_index = index;
            res.corrupted_record_seq = rec.header.seq_id;
            res.failure_reason = "Corrupted record magic (expected 'CHRO')";
            return res;
        }

        // 2. Sequence check
        if (index == 0) {
            res.first_seq = rec.header.seq_id;
            first_ts = rec.header.timestamp_ns;
        } else {
            if (rec.header.seq_id != prev_seq + 1) {
                res.valid = false;
                res.corrupted_record_index = index;
                res.corrupted_record_seq = rec.header.seq_id;
                res.failure_reason = "Sequence gap detected: expected " + std::to_string(prev_seq + 1) +
                                     " but got " + std::to_string(rec.header.seq_id);
                return res;
            }
        }
        prev_seq = rec.header.seq_id;
        last_ts = rec.header.timestamp_ns;

        // 3. Link check
        if (rec.prev_hash != expected_prev) {
            res.valid = false;
            res.corrupted_record_index = index;
            res.corrupted_record_seq = rec.header.seq_id;
            res.failure_reason = "Chained hash mismatch at record #" + std::to_string(index) +
                                 " (seq " + std::to_string(rec.header.seq_id) + "): prev_hash does not match predecessor";
            return res;
        }

        // 4. Record hash integrity check
        auto actual_hash = rec.compute_hash();
        if (actual_hash != rec.current_hash) {
            res.valid = false;
            res.corrupted_record_index = index;
            res.corrupted_record_seq = rec.header.seq_id;
            res.failure_reason = "Content tamper detected at record #" + std::to_string(index) +
                                 " (seq " + std::to_string(rec.header.seq_id) + "): payload or header modified";
            return res;
        }

        expected_prev = rec.current_hash;
        index++;
    }

    if (index == 0) {
        res.valid = false;
        res.failure_reason = "Empty log file: 0 records found";
        return res;
    }

    res.valid = true;
    res.total_records = index;
    res.last_seq = prev_seq;
    res.duration_ns = (last_ts >= first_ts) ? (last_ts - first_ts) : 0;
    res.terminal_hash = crypto::SHA256::to_hex(expected_prev);
    return res;
}

std::string ForensicVerificationResult::to_json() const {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"valid\": " << (valid ? "true" : "false") << ",\n"
       << "  \"total_records\": " << total_records << ",\n"
       << "  \"first_seq\": " << first_seq << ",\n"
       << "  \"last_seq\": " << last_seq << ",\n"
       << "  \"duration_ms\": " << std::fixed << std::setprecision(2) << (duration_ns / 1e6) << ",\n"
       << "  \"root_genesis_hash\": \"" << root_genesis_hash << "\",\n"
       << "  \"terminal_hash\": \"" << terminal_hash << "\"";
    if (!valid) {
        ss << ",\n  \"failure_reason\": \"" << failure_reason << "\",\n"
           << "  \"corrupted_record_index\": " << corrupted_record_index << ",\n"
           << "  \"corrupted_record_seq\": " << corrupted_record_seq;
    }
    ss << "\n}";
    return ss.str();
}

void ForensicVerificationResult::print_receipt() const {
    std::cout << "\n=======================================================\n";
    std::cout << "           CHRONO FORENSIC VERIFICATION RECEIPT        \n";
    std::cout << "=======================================================\n";
    if (valid) {
        std::cout << "STATUS:          [PASS] CRYPTOGRAPHICALLY VALID\n";
        std::cout << "RECORDS:         " << total_records << " verified SHA-256 blocks\n";
        std::cout << "SEQUENCE RANGE:  #" << first_seq << " -> #" << last_seq << "\n";
        std::cout << "DURATION:        " << (duration_ns / 1e6) << " ms\n";
        std::cout << "GENESIS ROOT:    " << root_genesis_hash << "\n";
        std::cout << "TERMINAL HASH:   " << terminal_hash << "\n";
        std::cout << "VERDICT:         Zero tampering detected. Log is immutable.\n";
    } else {
        std::cout << "STATUS:          [FAIL] TAMPERING DETECTED\n";
        std::cout << "FAILURE REASON:  " << failure_reason << "\n";
        std::cout << "CORRUPTED INDEX: Record #" << corrupted_record_index << " (Seq " << corrupted_record_seq << ")\n";
        std::cout << "VERDICT:         Record chain is invalid or has been altered.\n";
    }
    std::cout << "=======================================================\n\n";
}

} // namespace chrono
