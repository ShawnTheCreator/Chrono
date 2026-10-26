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

    std::cout << "[ALL PASSED] test_stall passed all loop fixture scenarios.\n";
    return 0;
}
