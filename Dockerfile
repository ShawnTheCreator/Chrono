# Stage 1: Build C++ Flight Recorder Core
FROM gcc:14-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    ninja-build \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .

RUN cmake -B build -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_CXX_STANDARD=20
RUN cmake --build build

# Stage 2: Runtime Container
FROM python:3.11-slim-bookworm

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy built C++ binaries
COPY --from=builder /src/build/core/chronod /usr/local/bin/chronod
COPY --from=builder /src/build/chrono_muse_adapter /usr/local/bin/chrono_muse_adapter

# Copy bridge and web assets
COPY bridge /app/bridge
COPY fixtures /app/fixtures
COPY docs /app/docs
COPY tools /app/tools

# Install bridge Python requirements
RUN pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn==0.28.0 \
    pydantic==2.6.4 \
    httpx==0.27.0 \
    sse-starlette==2.0.0

EXPOSE 8000 5173

CMD ["uvicorn", "bridge.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
