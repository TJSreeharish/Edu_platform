
docker build -t latex-ocr-server .


docker run --gpus all -p 8006:8006 --name mathocr latex-ocr-server