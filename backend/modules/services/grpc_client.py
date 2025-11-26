import grpc
from . import media_pb2 as pb2
from . import media_pb2_grpc as pb2_grpc

def extract_audio_via_grpc(video_bytes):
    """Extract audio from video via gRPC"""
    channel = grpc.insecure_channel("127.0.0.1:8004",
        options=[
        ("grpc.max_send_message_length", 1024 * 1024 * 1024),   # 1 GB
        ("grpc.max_receive_message_length", 1024 * 1024 * 1024), # 1 GB
    ])
    stub = pb2_grpc.MediaServiceStub(channel)
    
    try:
        if hasattr(video_bytes, 'read'):
            video_bytes = video_bytes.read()
        
        request = pb2.VideoRequest(video_data=video_bytes)
        response = stub.ExtractAudio(request)
        return response.audio_data
    finally:
        channel.close()

def is_grpc_alive():
    """Check if gRPC server is alive"""
    channel = None
    try:
        channel = grpc.insecure_channel("127.0.0.1:8004")
        stub = pb2_grpc.MediaServiceStub(channel)
        resp = stub.HealthCheck(pb2.Empty(), timeout=5)  # Increased timeout
        return resp.status == "OK"
    except Exception as e:
        print(f"gRPC health check failed: {e}")  # Log the error
        return False
    finally:
        if channel:
            channel.close()