# Build the Docker image
docker build -t translator_service .

# Run the container with GPU support
docker run --gpus all -p 8903:8903 --name translator_service translator_service

# To View logs
docker logs -f translator_service
