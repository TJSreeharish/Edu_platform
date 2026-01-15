FROM pytorch/pytorch:2.8.0-cuda12.9-cudnn9-devel

WORKDIR /app

# Install dependencies (torch already present)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application (INCLUDING emotion_model)
COPY . .

EXPOSE 9091

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "9091"]
