# Default target
all: build

# Build the frontend application using Docker and extract the artifacts.
build:
	@echo "Building application artifacts using Docker..."
	# Build the Docker image which contains the build artifacts.
	docker build -t my-react-app-builder:latest -f deployment/Dockerfile .

	@echo "Extracting build artifacts from the Docker image..."
	# Remove old dist directory if it exists
	rm -rf ./dist
	# Create a temporary container to extract files from.
	docker create --name temp-extractor my-react-app-builder:latest
	# Copy the artifacts from the container to the host's current directory.
	docker cp temp-extractor:/app ./dist
	# Clean up the temporary container.
	docker rm temp-extractor
	@echo "Build complete. Artifacts are in ./dist"

# Clean the build artifacts
clean:
	@echo "Cleaning up build artifacts..."
	rm -rf ./dist

.PHONY: all build clean
