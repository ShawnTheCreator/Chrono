cmake_minimum_required(VERSION 3.20)
project(chrono_core LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (MSVC)
    add_compile_options(/W4 /WX /permissive- /utf-8)
else()
    add_compile_options(-Wall -Wextra -Werror -pedantic)
endif()

# Core static library
add_library(chrono_core STATIC
    src/sha256.cpp
    src/event.cpp
    src/hash_chain.cpp
    src/verify.cpp
    src/ingest.cpp
    src/checkpoint.cpp
    src/index.cpp
    src/stall_detector.cpp
    src/telemetry.cpp
    src/session.cpp
)

target_include_directories(chrono_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# chronod daemon executable
add_executable(chronod src/main.cpp)
target_link_libraries(chronod PRIVATE chrono_core)

# Tests
enable_testing()

add_executable(test_hash_chain tests/test_hash_chain.cpp)
target_link_libraries(test_hash_chain PRIVATE chrono_core)
add_test(NAME HashChainIntegrity COMMAND test_hash_chain)

add_executable(test_ingest tests/test_ingest.cpp)
target_link_libraries(test_ingest PRIVATE chrono_core)
add_test(NAME IngestBackpressure COMMAND test_ingest)

add_executable(test_index tests/test_index.cpp)
target_link_libraries(test_index PRIVATE chrono_core)
add_test(NAME IndexSeekBudget COMMAND test_index)

add_executable(test_stall tests/test_stall.cpp)
target_link_libraries(test_stall PRIVATE chrono_core)
add_test(NAME StallDetectorLoop COMMAND test_stall)
