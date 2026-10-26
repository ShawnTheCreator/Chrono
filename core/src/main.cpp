#include "chrono/event.h"
#include "chrono/hash_chain.h"
#include "chrono/index.h"
#include "chrono/verify.h"
#include "chrono/stall_detector.h"
#include "chrono/telemetry.h"
#include "chrono/session.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <chrono>

using namespace chrono;

void print_usage(const char* prog) {
    std::cout << "Chrono Recorder Daemon (chronod) v1.0.0\n";
    std::cout << "The flight recorder for AI coding agents.\n\n";
    std::cout << "Usage:\n";
    std::cout << "  " << prog << " --record <output.chrono>   Tail stdin JSONL stream and write log\n";
    std::cout << "  " << prog << " --verify <input.chrono>    Forensically verify log integrity\n";
    std::cout << "  " << prog << " --dump <input.chrono>      Dump records to JSONL\n";
    std::cout << "  " << prog << " --index <input.chrono>     Rebuild or inspect timeline index\n";
    std::cout << "  " << prog << " --benchmark                Run system performance benchmarks\n";
}

int cmd_verify(const std::string& path) {
    auto res = verify_log(path);
    res.print_receipt();
    return res.valid ? 0 : 1;
}

int cmd_dump(const std::string& path) {
    HashChainReader reader(path);
    if (!reader.is_open()) {
        std::cerr << "Error: cannot open file " << path << std::endl;
        return 1;
    }

    std::cout << "[\n";
    bool first = true;
    while (auto opt = reader.next_record()) {
        if (!first) std::cout << ",\n";
        first = false;

        Event ev;
        ev.seq_id = opt->header.seq_id;
        ev.timestamp_ns = opt->header.timestamp_ns;
        ev.kind = static_cast<EventKind>(opt->header.kind);
        ev.flags = opt->header.flags;
        ev.payload = opt->payload;

        std::cout << "  {\n"
                  << "    \"seq_id\": " << ev.seq_id << ",\n"
                  << "    \"timestamp_ns\": " << ev.timestamp_ns << ",\n"
                  << "    \"kind\": \"" << event_kind_to_string(ev.kind) << "\",\n"
                  << "    \"prev_hash\": \"" << crypto::SHA256::to_hex(opt->prev_hash) << "\",\n"
                  << "    \"current_hash\": \"" << crypto::SHA256::to_hex(opt->current_hash) << "\",\n"
                  << "    \"payload\": " << (ev.payload.empty() ? "{}" : ev.payload) << "\n"
                  << "  }";
    }
    std::cout << "\n]\n";
    return 0;
}

int cmd_record(const std::string& out_path) {
    std::cout << "chronod: listening on stdin for CEP-v1 JSONL events -> " << out_path << std::endl;
    HashChainWriter writer(out_path);
    TimelineIndex index;
    StallDetector stall_detector;
    TelemetryEngine telemetry;

    std::string line;
    uint64_t file_offset = 0;

    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        Event ev = Event::from_json(line);
        if (ev.kind == EventKind::UNKNOWN) {
            ev.kind = EventKind::AGENT_THOUGHT;
        }

        telemetry.record_event(ev);
        if (auto alert = stall_detector.process_event(ev)) {
            std::cerr << "[STALL DETECTED] " << alert->description << std::endl;
        }

        auto rec = writer.append(ev);
        IndexEntry ie;
        ie.timestamp_ns = ev.timestamp_ns;
        ie.seq_id = rec.header.seq_id;
        ie.file_offset = file_offset;
        ie.kind = static_cast<uint16_t>(ev.kind);
        ie.flags = rec.header.flags;
        index.add_entry(ie);

        file_offset += rec.header.total_length;
        writer.flush();
    }

    std::string idx_path = out_path + "i";
    index.save_to_file(idx_path);
    std::cout << "chronod: session completed. Saved " << writer.count() << " records to " << out_path << std::endl;
    return 0;
}

int cmd_benchmark() {
    std::cout << "--- CHRONO PERFORMANCE BENCHMARKS ---\n";

    // 1. Ingest & Chain append speed
    const size_t BENCH_COUNT = 100000;
    std::string tmp_log = "bench_temp.chrono";
    auto t0 = std::chrono::high_resolution_clock::now();

    {
        HashChainWriter writer(tmp_log);
        std::string sample_payload = "{\"tool\":\"bash\",\"cmd\":\"make test\",\"result\":\"ok\"}";
        for (size_t i = 0; i < BENCH_COUNT; ++i) {
            writer.append(EventKind::TOOL_CALL, 0, sample_payload, i * 1000000ULL);
        }
    }

    auto t1 = std::chrono::high_resolution_clock::now();
    double append_sec = std::chrono::duration<double>(t1 - t0).count();
    double eps = static_cast<double>(BENCH_COUNT) / append_sec;
    std::cout << "[1] HashChain Write:  " << BENCH_COUNT << " records in "
              << append_sec << " s (" << static_cast<uint64_t>(eps) << " events/sec)\n";

    // 2. Timeline index seek speed
    TimelineIndex index;
    for (size_t i = 0; i < BENCH_COUNT; ++i) {
        IndexEntry ie;
        ie.timestamp_ns = i * 1000000ULL;
        ie.seq_id = i + 1;
        ie.file_offset = i * 128;
        ie.kind = 10;
        ie.flags = 0;
        index.add_entry(ie);
    }

    const size_t SEEKS = 500000;
    auto t2 = std::chrono::high_resolution_clock::now();
    for (size_t i = 0; i < SEEKS; ++i) {
        uint64_t target_ts = (i * 37) % (BENCH_COUNT * 1000000ULL);
        auto found = index.seek_by_timestamp(target_ts);
        (void)found;
    }
    auto t3 = std::chrono::high_resolution_clock::now();
    double seek_sec = std::chrono::duration<double>(t3 - t2).count();
    double seek_ns = (seek_sec / SEEKS) * 1e9;
    std::cout << "[2] Timeline O(log n) Seek: " << SEEKS << " queries in "
              << seek_sec << " s (" << seek_ns << " ns/seek, budget: < 16,666,667 ns)\n";

    // 3. Verification speed
    auto t4 = std::chrono::high_resolution_clock::now();
    auto res = verify_log(tmp_log);
    auto t5 = std::chrono::high_resolution_clock::now();
    double verify_sec = std::chrono::duration<double>(t5 - t4).count();
    std::remove(tmp_log.c_str());
    std::cout << "[3] Forensic Verification: " << BENCH_COUNT << " SHA-256 blocks verified in "
              << verify_sec << " s (Status: " << (res.valid ? "PASS" : "FAIL") << ")\n";

    std::cout << "All benchmarks completed successfully.\n";
    return 0;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        print_usage(argv[0]);
        return 1;
    }

    std::string cmd = argv[1];
    if (cmd == "--record" && argc >= 3) {
        return cmd_record(argv[2]);
    } else if (cmd == "--verify" && argc >= 3) {
        return cmd_verify(argv[2]);
    } else if (cmd == "--dump" && argc >= 3) {
        return cmd_dump(argv[2]);
    } else if (cmd == "--benchmark") {
        return cmd_benchmark();
    } else {
        print_usage(argv[0]);
        return 1;
    }
}
