#include "chrono/stall_detector.h"
#include <iostream>
#include <cassert>

using namespace chrono;

int main() {
    std::cout << "[TEST] test_stall starting: loop injection fixture...\n";

    // Scenario 1: Identical diff loop
    {
        StallDetector detector(20, 3);
        std::string diff_payload = "--- a/src/main.cpp\n+++ b/src/main.cpp\n@@ -10,3 +10,3 @@\n- int x = 1;\n+ int x = 2;";

        std::optional<StallAlert> alert;
        for (int cycle = 1; cycle <= 4; ++cycle) {
            Event ev;
            ev.seq_id = cycle;
            ev.timestamp_ns = cycle * 1000000ULL;
            ev.kind = EventKind::FILE_DIFF;
            ev.payload = diff_payload;
            auto res = detector.process_event(ev);
            if (res) alert = res;
        }

        assert(alert.has_value() && "Must detect identical diff loop");
        assert(alert->pattern == StallPattern::IDENTICAL_DIFF_LOOP);
        assert(alert->cycle_count >= 3);
        assert(alert->confidence > 0.9);
        std::cout << "[PASS] Identical diff loop detected at cycle " << alert->cycle_count
                  << " (confidence: " << alert->confidence << ")\n";
    }

    // Scenario 2: Repeated tool failure loop
    {
        StallDetector detector(20, 3);
        std::string failure_output = "error: undefined reference to 'vtable for ChronoRecorder' collect2: error: ld returned 1 exit status";

        std::optional<StallAlert> alert;
        for (int cycle = 1; cycle <= 5; ++cycle) {
            // Tool call
            Event ev_call;
            ev_call.seq_id = cycle * 2 - 1;
            ev_call.timestamp_ns = ev_call.seq_id * 1000000ULL;
            ev_call.kind = EventKind::TOOL_CALL;
            ev_call.payload = "{\"tool\":\"bash\",\"cmd\":\"make\"}";
            detector.process_event(ev_call);

            // Tool result with same failure
            Event ev_res;
            ev_res.seq_id = cycle * 2;
            ev_res.timestamp_ns = ev_res.seq_id * 1000000ULL;
            ev_res.kind = EventKind::TOOL_RESULT;
            ev_res.payload = failure_output;
            auto res = detector.process_event(ev_res);
            if (res) alert = res;
        }

        assert(alert.has_value() && "Must detect tool failure loop");
        assert(alert->pattern == StallPattern::TOOL_EXECUTION_FAILURE_LOOP);
        assert(alert->cycle_count >= 3);
        std::cout << "[PASS] Tool failure loop detected at cycle " << alert->cycle_count
                  << ": " << alert->suggested_intervention << "\n";
    }

    // Scenario 3: Sliding window evicts stale diff hashes
    {
        StallDetector detector(5, 3);
        std::string payload_a = "diff-A-payload";
        uint64_t seq = 1;
        auto feed_diff = [&](const std::string& p) {
            Event ev;
            ev.seq_id = seq;
            ev.timestamp_ns = seq * 1000000ULL;
            ++seq;
            ev.kind = EventKind::FILE_DIFF;
            ev.payload = p;
            return detector.process_event(ev);
        };

        feed_diff(payload_a);
        feed_diff(payload_a);
        for (int i = 0; i < 5; ++i) {
            feed_diff("filler-" + std::to_string(i));
        }
        auto stale = feed_diff(payload_a);
        assert(!stale.has_value() && "Stale hashes outside window must not trigger");

        auto r1 = feed_diff(payload_a);
        auto r2 = feed_diff(payload_a);
        std::optional<StallAlert> alert;
        if (r1) alert = r1;
        if (r2) alert = r2;
        assert(alert.has_value() && "Fresh repeats within window must trigger");
        assert(alert->pattern == StallPattern::IDENTICAL_DIFF_LOOP);
        std::cout << "[PASS] Sliding window evicts stale hashes; fresh loop at cycle "
                  << alert->cycle_count << "\n";
    }

    // Scenario 4: Read thrashing loop and reset
    {
        StallDetector detector(20, 3);
        std::optional<StallAlert> alert;
        uint64_t seq = 1;
        for (int i = 0; i < 9; ++i) {
            Event ev;
            ev.seq_id = seq;
            ev.timestamp_ns = seq * 1000000ULL;
            ++seq;
            ev.kind = EventKind::TOOL_CALL;
            ev.payload = "{\"tool\":\"read_file\",\"path\":\"a.cpp\"}";
            auto res = detector.process_event(ev);
            if (res) alert = res;

            Event res_ev;
            res_ev.seq_id = seq;
            res_ev.timestamp_ns = seq * 1000000ULL;
            ++seq;
            res_ev.kind = EventKind::TOOL_RESULT;
            res_ev.payload = "{\"output\":\"ok\"}";
            auto res2 = detector.process_event(res_ev);
            if (res2) alert = res2;
        }
        assert(alert.has_value() && "Must detect read thrashing loop");
        assert(alert->pattern == StallPattern::READ_THRASHING_LOOP);
        assert(alert->cycle_count >= 9);
        std::cout << "[PASS] Read thrashing detected at cycle " << alert->cycle_count << "\n";

        StallDetector detector2(20, 3);
        std::optional<StallAlert> no_alert;
        seq = 1;
        for (int i = 0; i < 5; ++i) {
            Event ev;
            ev.seq_id = seq;
            ev.timestamp_ns = seq * 1000000ULL;
            ++seq;
            ev.kind = EventKind::TOOL_CALL;
            ev.payload = "{\"tool\":\"read_file\"}";
            auto r = detector2.process_event(ev);
            if (r) no_alert = r;
            Event wv;
            wv.seq_id = seq;
            wv.timestamp_ns = seq * 1000000ULL;
            ++seq;
            wv.kind = EventKind::TOOL_CALL;
            wv.payload = "{\"tool\":\"write_file\"}";
            auto r2 = detector2.process_event(wv);
            if (r2) no_alert = r2;
        }
        assert(!no_alert.has_value() && "Write calls must reset thrashing counter");
        std::cout << "[PASS] Read thrashing correctly resets on action\n";
    }

    // Scenario 5: Strict circular handoff detection
    {
        auto mk_handoff = [](uint64_t seq, const std::string& from, const std::string& to) {
            Event ev;
            ev.seq_id = seq;
            ev.timestamp_ns = seq * 1000000ULL;
            ev.kind = EventKind::TOOL_CALL;
            ev.payload = "{\"tool\":\"handoff\",\"from\":\"" + from + "\",\"to\":\"" + to + "\"}";
            return ev;
        };

        {
            StallDetector detector(20, 3);
            detector.process_event(mk_handoff(1, "agentA", "agentB"));
            auto res = detector.process_event(mk_handoff(2, "agentB", "agentA"));
            assert(res.has_value() && "Must detect 2-agent handoff cycle");
            assert(res->pattern == StallPattern::CIRCULAR_HANDOFF_LOOP);
            assert(res->cycle_count == 2);
            std::cout << "[PASS] Circular handoff detected: " << res->culprit << "\n";
        }
        {
            StallDetector detector(20, 3);
            detector.process_event(mk_handoff(1, "agentA", "agentB"));
            auto res = detector.process_event(mk_handoff(2, "agentB", "agentC"));
            assert(!res.has_value() && "Linear handoff chain must not alert");
            std::cout << "[PASS] Linear handoff chain correctly ignored\n";
        }
        {
            StallDetector detector(20, 3);
            Event ev;
            ev.seq_id = 1;
            ev.timestamp_ns = 1000000ULL;
            ev.kind = EventKind::TOOL_CALL;
            ev.payload = "{\"tool\":\"delegate\",\"from\":\"agentX\",\"to\":\"agentX\"}";
            auto res = detector.process_event(ev);
            assert(res.has_value() && "Must detect self-handoff");
            assert(res->pattern == StallPattern::CIRCULAR_HANDOFF_LOOP);
            assert(res->cycle_count == 1);
            std::cout << "[PASS] Self-handoff detected: " << res->culprit << "\n";
        }
        {
            StallDetector detector(3, 3);
            detector.process_event(mk_handoff(1, "agentA", "agentB"));
            for (uint64_t s = 2; s <= 3; ++s) {
                Event filler;
                filler.seq_id = s;
                filler.timestamp_ns = s * 1000000ULL;
                filler.kind = EventKind::AGENT_THOUGHT;
                filler.payload = "thinking";
                detector.process_event(filler);
            }
            auto res = detector.process_event(mk_handoff(4, "agentB", "agentA"));
            assert(!res.has_value() && "Evicted handoff edge must not form a cycle");
            std::cout << "[PASS] Evicted handoff correctly ignored\n";
        }
    }

    std::cout << "[ALL PASSED] test_stall passed all loop fixture scenarios.\n";
    return 0;
}
