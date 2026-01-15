this is how to run stt processor
just build the dockerfile in the stt folder
then paste the server.py in the container you will create 
then start the server.py thats all 

docker run -it --gpus all --name stt_op -p 8003:8003 -p 8004:8004 imageo
python -m grpc_tools.protoc -I=. --python_out=.. --grpc_python_out=.. media.proto
docker build -t image .

