#include <iostream>
#include <string>
#include <chrono>

int main(int argc, char* argv[]) {
    (void)argc;
    (void)argv;
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    std::string line;
    uint64_t seq_id = 1;

    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        auto now_ns = static_cast<uint64_t>(
            std::chrono::duration_cast<std::chrono::nanoseconds>(
                std::chrono::steady_clock::now().time_since_epoch()
            ).count()
        );

        // Simple normalization wrapper
        std::cout << "{\"seq_id\":" << seq_id++
                  << ",\"timestamp_ns\":" << now_ns
                  << ",\"kind\":\"agent_thought\""
                  << ",\"flags\":0"
                  << ",\"payload\":" << line << "}\n";
        std::cout.flush();
    }
    return 0;
}
