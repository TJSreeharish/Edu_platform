docker build -t context-engine:latest .

docker run -d --name emotion_engine -p 9091:9091 context-engine:latest

#This is the updated one
docker run -d --name emotion_engine --network edu_net -p 9091:9091 context-engine:latest
