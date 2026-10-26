#include "chrono/ingest.h"
#include <iostream>
#include <cassert>
#include <thread>
#include <vector>
#include <chrono>

using namespace chrono;

int main() {
    std::cout << "[TEST] test_ingest starting: 1,000,000 event burst...\n";

    constexpr size_t TOTAL_EVENTS = 1000000;
    SPSCQueue<Event, 65536> queue;
    std::atomic<bool> producer_done{false};
    std::atomic<size_t> consumed_count{0};

    auto start_time = std::chrono::high_resolution_clock::now();

    // Consumer thread
    std::thread consumer([&]() {
        Event ev;
        size_t count = 0;
        while (!producer_done.load(std::memory_order_relaxed) || !queue.empty()) {
            if (queue.try_pop(ev)) {
                count++;
            } else {
                std::this_thread::yield();
            }
        }
        consumed_count.store(count);
    });

    // Producer thread
    std::thread producer([&]() {
        for (size_t i = 0; i < TOTAL_EVENTS; ++i) {
            Event ev;
            ev.seq_id = i + 1;
            ev.timestamp_ns = i * 1000;
            ev.kind = EventKind::TOOL_CALL;
            ev.payload = "{\"id\":" + std::to_string(i) + "}";
            queue.push_wait(ev);
        }
        producer_done.store(true, std::memory_order_release);
    });

    producer.join();
    consumer.join();

    auto end_time = std::chrono::high_resolution_clock::now();
    double elapsed_sec = std::chrono::duration<double>(end_time - start_time).count();
    double eps = static_cast<double>(TOTAL_EVENTS) / elapsed_sec;

    std::cout << "[RESULT] Processed " << consumed_count.load() << " / " << TOTAL_EVENTS
              << " events in " << elapsed_sec << " s (" << static_cast<uint64_t>(eps) << " events/sec)\n";

    assert(consumed_count.load() == TOTAL_EVENTS && "Zero drops guarantee violated!");
    std::cout << "[PASS] 1M events ingested with zero drops and zero locks.\n";
    return 0;
}
