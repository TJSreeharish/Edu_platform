import grpc
from . import media_pb2 as pb2
from . import media_pb2_grpc as pb2_grpc

def extract_audio_via_grpc(video_bytes):
    channel = grpc.insecure_channel("127.0.0.1:8003")
    stub = pb2_grpc.MediaServiceStub(channel)
    if hasattr(video_bytes, 'read'):
        video_bytes = video_bytes.read()
    request = pb2.VideoRequest(video_data=video_bytes)
    response = stub.ExtractAudio(request)
    return response.audio_data
