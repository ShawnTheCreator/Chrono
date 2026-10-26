#include "chrono/hash_chain.h"
#include "chrono/verify.h"
#include <iostream>
#include <cassert>
#include <fstream>

using namespace chrono;

int main() {
    std::cout << "[TEST] test_hash_chain starting...\n";
    std::string test_log = "test_chain.chrono";

    // 1. Create a pristine chain
    {
        HashChainWriter writer(test_log);
        writer.append(EventKind::SESSION_START, 0, "{\"task\":\"build chrono\"}", 1000);
        writer.append(EventKind::AGENT_THOUGHT, 0, "Thinking about architecture...", 2000);
        writer.append(EventKind::TOOL_CALL, 0, "{\"tool\":\"bash\",\"cmd\":\"cmake -B build\"}", 3000);
        writer.append(EventKind::TOOL_RESULT, 0, "{\"output\":\"Configuring done\"}", 4000);
        writer.append(EventKind::CHECKPOINT, 1, "{\"commit\":\"a1b2c3d\",\"files\":[\"CMakeLists.txt\"]}", 5000);
        writer.append(EventKind::SESSION_END, 0, "{\"status\":\"success\"}", 6000);
    }

    // 2. Verify pristine chain -> MUST PASS
    auto report = verify_log(test_log);
    assert(report.valid && "Pristine chain must pass verification");
    assert(report.total_records == 6 && "Expected 6 records in pristine chain");
    std::cout << "[PASS] Pristine chain verified. Terminal hash: " << report.terminal_hash << "\n";

    // 3. Tamper test: flip a single byte in record #3
    {
        std::ifstream in(test_log, std::ios::binary);
        assert(in.is_open());
        std::vector<char> bytes((std::istreambuf_iterator<char>(in)),
                                 std::istreambuf_iterator<char>());
        in.close();

        assert(bytes.size() > 150);
        // Corrupt a byte in the payload of record #3 (around offset 180)
        bytes[180] ^= 0x5A;

        std::ofstream out(test_log, std::ios::binary | std::ios::trunc);
        assert(out.is_open());
        out.write(bytes.data(), bytes.size());
        out.flush();
        out.close();
    }

    // 4. Verify tampered chain -> MUST FAIL
    auto tampered_report = verify_log(test_log);
    assert(!tampered_report.valid && "Tampered chain must fail verification");
    std::cout << "[PASS] Tamper correctly detected: " << tampered_report.failure_reason << "\n";
    std::cout << "       Corrupted record: #" << tampered_report.corrupted_record_index
              << " (seq " << tampered_report.corrupted_record_seq << ")\n";

    std::remove(test_log.c_str());
    std::cout << "[ALL PASSED] test_hash_chain completed.\n";
    return 0;
}
