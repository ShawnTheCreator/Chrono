#pragma once

#include "chrono/event.h"
#include <atomic>
#include <vector>
#include <cstdint>
#include <memory>
#include <thread>
#include <chrono>

namespace chrono {

template <typename T, size_t Capacity = 65536>
class SPSCQueue {
    static_assert((Capacity & (Capacity - 1)) == 0, "Capacity must be a power of two");

public:
    SPSCQueue() : head_(0), tail_(0) {
        ring_.resize(Capacity);
    }

    bool try_push(const T& item) {
        const size_t head = head_.load(std::memory_order_relaxed);
        const size_t tail = tail_.load(std::memory_order_acquire);

        if ((head - tail) >= Capacity) {
            return false; // Queue full
        }

        ring_[head & (Capacity - 1)] = item;
        head_.store(head + 1, std::memory_order_release);
        return true;
    }

    bool try_push(T&& item) {
        const size_t head = head_.load(std::memory_order_relaxed);
        const size_t tail = tail_.load(std::memory_order_acquire);

        if ((head - tail) >= Capacity) {
            return false;
        }

        ring_[head & (Capacity - 1)] = std::move(item);
        head_.store(head + 1, std::memory_order_release);
        return true;
    }

    bool push_wait(const T& item, size_t max_spins = 1000) {
        size_t spins = 0;
        while (!try_push(item)) {
            if (++spins > max_spins) {
                std::this_thread::yield();
            }
        }
        return true;
    }

    bool try_pop(T& item) {
        const size_t tail = tail_.load(std::memory_order_relaxed);
        const size_t head = head_.load(std::memory_order_acquire);

        if (tail == head) {
            return false; // Empty
        }

        item = std::move(ring_[tail & (Capacity - 1)]);
        tail_.store(tail + 1, std::memory_order_release);
        return true;
    }

    size_t size() const {
        const size_t head = head_.load(std::memory_order_relaxed);
        const size_t tail = tail_.load(std::memory_order_relaxed);
        return (head >= tail) ? (head - tail) : 0;
    }

    bool empty() const {
        return head_.load(std::memory_order_relaxed) == tail_.load(std::memory_order_relaxed);
    }

    static constexpr size_t capacity() { return Capacity; }

private:
    // Separate cache lines for producer and consumer cursors to eliminate false sharing
    alignas(64) std::atomic<size_t> head_;
    alignas(64) std::atomic<size_t> tail_;
    std::vector<T> ring_;
};

struct IngestMetrics {
    uint64_t events_ingested = 0;
    uint64_t events_drained = 0;
    uint64_t drops = 0;
    double throughput_eps = 0.0;
};

class IngestPipeline {
public:
    IngestPipeline();
    ~IngestPipeline();

    // Lockless enqueue
    bool enqueue(Event&& event);
    bool enqueue_blocking(Event&& event);

    // Consume next event
    bool dequeue(Event& event);

    // Batch drain into vector (high throughput disk flushing)
    size_t drain_batch(std::vector<Event>& out, size_t max_items = 1024);

    IngestMetrics get_metrics() const;

private:
    SPSCQueue<Event, 65536> queue_;
    std::atomic<uint64_t> total_ingested_{0};
    std::atomic<uint64_t> total_drained_{0};
    std::atomic<uint64_t> drops_{0};
};

} // namespace chrono
