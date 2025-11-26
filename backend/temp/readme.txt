this is how to run stt processor
just build the dockerfile in the stt folder
then paste the server.py in the container you will create 
then start the server.py thats all 
docker run -it --gpus all --name stt_op -p 8003:8003 -p 8004:8004 imageo
python -m grpc_tools.protoc -I=proto --python_out=. --grpc_python_out=. proto\media.proto
docker build -t image .


# Base image
FROM pytorch/pytorch:2.8.0-cuda12.9-cudnn9-devel

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    git \
 && rm -rf /var/lib/apt/lists/*

# Install base dependencies first
RUN pip install --no-cache-dir \
    Cython \
    packaging \
    grpcio \
    grpcio-tools \
    uvicorn \
    fastapi \
    python-multipart

# Install ctranslate2 >= 4.5.0 BEFORE whisperx (critical for cuDNN 9 support)
RUN pip install --no-cache-dir "ctranslate2>=4.5.0"

# Install NeMo toolkit
RUN pip install --no-cache-dir "git+https://github.com/NVIDIA/NeMo.git@main#egg=nemo_toolkit[asr]"

# Install megatron-core
RUN pip install --no-cache-dir megatron-core

# Install whisperx (will use the ctranslate2>=4.5.0 we installed)
RUN pip install --no-cache-dir whisperx

# Create working directory
WORKDIR /app

# Copy project files
COPY proto/ proto/
COPY grpc_server.py .
COPY server.py .

# Generate gRPC Python files
RUN python -m grpc_tools.protoc \
    -I=proto \
    --python_out=. \
    --grpc_python_out=. \
    proto/media.proto

# Create startup script
RUN echo '#!/bin/bash\n\
python grpc_server.py &\n\
python server.py\n' > start.sh && chmod +x start.sh

# Expose ports
EXPOSE 8003
EXPOSE 8004

# Run both servers
CMD ["bash", "start.sh"]