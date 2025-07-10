# Stage 1: Build the Vite application
FROM node:20-slim AS builder

WORKDIR /app

# Use Chinese mirrors for faster downloads
RUN sed -i 's#http://deb.debian.org#http://mirrors.aliyun.com#g' /etc/apt/sources.list.d/debian.sources && \
    npm config set registry https://registry.npmmirror.com

# Install system dependencies.
# python3, make, g++ are for native Node modules. If not needed, they can be removed.
RUN apt-get update && apt-get install -y --fix-missing \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies using cnpm for speed in China
RUN npm install -g cnpm --registry=https://registry.npmmirror.com && cnpm install

# Copy the rest of the application source code
COPY . .

# Build the application.
RUN npm run build

# Stage 2: Create a minimal image with only the build artifacts
FROM alpine:latest

# Set a working directory
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/dist .

# This image's purpose is to hold the build artifacts.
# You can copy the files out of a container created from this image.
# Example: docker cp <container_id>:/app .
CMD ["/bin/sh", "-c", "echo 'Build artifacts are in /app. This container can be used to copy files from.'; tail -f /dev/null"] 