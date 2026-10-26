cmake_minimum_required(VERSION 3.20)
project(chrono VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable CTest
enable_testing()

# Compiler warnings as errors
if (MSVC)
    add_compile_options(/W4 /WX /permissive- /utf-8)
else()
    add_compile_options(-Wall -Wextra -Werror -pedantic)
endif()

# Core Flight Recorder
add_subdirectory(core)

# Optional Adapter Executables
add_executable(chrono_muse_adapter adapters/muse_code/session_watcher.cpp)
add_executable(chrono_jsonl_adapter adapters/generic/jsonl_watcher.cpp)
