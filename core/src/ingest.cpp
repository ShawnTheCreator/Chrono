#include "chrono/ingest.h"

namespace chrono {

IngestPipeline::IngestPipeline() {}

IngestPipeline::~IngestPipeline() {}

bool IngestPipeline::enqueue(Event&& event) {
    if (queue_.try_push(std::move(event))) {
        total_ingested_.fetch_add(1, std::memory_order_relaxed);
        return true;
    }
    drops_.fetch_add(1, std::memory_order_relaxed);
    return false;
}

bool IngestPipeline::enqueue_blocking(Event&& event) {
    if (queue_.push_wait(std::move(event))) {
        total_ingested_.fetch_add(1, std::memory_order_relaxed);
        return true;
    }
    return false;
}

bool IngestPipeline::dequeue(Event& event) {
    if (queue_.try_pop(event)) {
        total_drained_.fetch_add(1, std::memory_order_relaxed);
        return true;
    }
    return false;
}

size_t IngestPipeline::drain_batch(std::vector<Event>& out, size_t max_items) {
    size_t count = 0;
    Event ev;
    while (count < max_items && queue_.try_pop(ev)) {
        out.push_back(std::move(ev));
        count++;
    }
    if (count > 0) {
        total_drained_.fetch_add(count, std::memory_order_relaxed);
    }
    return count;
}

IngestMetrics IngestPipeline::get_metrics() const {
    IngestMetrics m;
    m.events_ingested = total_ingested_.load(std::memory_order_relaxed);
    m.events_drained = total_drained_.load(std::memory_order_relaxed);
    m.drops = drops_.load(std::memory_order_relaxed);
    return m;
}

} // namespace chrono
