# Default to localhost if API_HOST is not set
APP_NAME := cybernity-frontend
USERNAME := root
SERVER_PATH := /$(USERNAME)/$(APP_NAME)
DOCKER_TAG := latest

.PHONY: build up down

# Build Docker image
build:
	@echo "Building Docker image..."
	@docker build \
		--build-arg NEXT_PUBLIC_API_HOST=$(API_HOST) \
		-t $(APP_NAME):$(DOCKER_TAG) .

# Start container
run:
	@echo "Starting Docker container..."
	@docker run -d \
		--name $(APP_NAME) \
		-e NEXT_PUBLIC_API_HOST=$(API_HOST) \
		-p 3010:300 \
		$(APP_NAME):$(DOCKER_TAG)

# Stop and remove container
down:
	@echo "Stopping and removing Docker container..."
	@docker stop $(APP_NAME) || true
	@docker rm $(APP_NAME) || true

remove:
	@docker rm -f $(APP_NAME)

backup:
	@image_id=$$(docker images -q $(APP_NAME):latest); \
	if [ ! -z "$$image_id" ]; then \
		docker rmi $(APP_NAME):previous; \
		docker tag $(APP_NAME):latest $(APP_NAME):previous; \
		echo "Backed up $(APP_NAME):latest to $(APP_NAME):previous"; \
	else \
		echo "No previous $(APP_NAME):latest found, skipping backup"; \
	fi
