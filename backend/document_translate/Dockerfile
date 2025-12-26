FROM pytorch/pytorch:2.8.0-cuda12.9-cudnn9-devel

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8903

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8903"]
