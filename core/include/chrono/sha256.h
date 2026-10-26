#pragma once

#include <cstdint>
#include <cstddef>
#include <array>
#include <string>
#include <string_view>

namespace chrono::crypto {

using Digest = std::array<uint8_t, 32>;

class SHA256 {
public:
    SHA256();
    void reset();
    void update(const uint8_t* data, size_t length);
    void update(std::string_view sv);
    Digest finalize();

    static Digest hash(const uint8_t* data, size_t length);
    static Digest hash(std::string_view sv);
    static std::string to_hex(const Digest& digest);
    static Digest from_hex(std::string_view hex);

private:
    void transform(const uint8_t chunk[64]);

    uint32_t state_[8];
    uint64_t bit_count_;
    uint8_t buffer_[64];
    size_t buffer_len_;
};

} // namespace chrono::crypto
