import grpc
from concurrent import futures
import media_pb2 as pb2
import media_pb2_grpc as pb2_grpc
import tempfile
import subprocess
import os

class MediaService(pb2_grpc.MediaServiceServicer):

    def HealthCheck(self, request, context):
        return pb2.HealthStatus(status="OK")

    def ExtractAudio(self, request_iterator, context):
        """
        request_iterator: Generator yielding VideoChunk messages
        Each chunk contains 4MB of video data
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as vf:
            total_bytes = 0
            for chunk in request_iterator:
                vf.write(chunk.data)
                total_bytes += len(chunk.data)
                print(f"Received chunk: {len(chunk.data)} bytes (Total: {total_bytes})")
            video_path = vf.name

        print(f"✅ Complete video received: {total_bytes} bytes")


        audio_path = video_path.replace(".mp4", ".wav")

        cmd = [
            "ffmpeg", "-i", video_path,
            "-vn",                    # No video
            "-acodec", "pcm_s16le",  # Audio codec
            "-ar", "16000",          # Sample rate
            "-ac", "1",              # Mono
            audio_path,
            "-y"                     # Overwrite
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✅ Audio extracted to: {audio_path}")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg error: {e.stderr.decode()}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"FFmpeg failed: {e.stderr.decode()}")
            return pb2.AudioResponse()

        with open(audio_path, "rb") as af:
            audio_bytes = af.read()

        print(f"✅ Audio size: {len(audio_bytes)} bytes")


        try:
            os.remove(video_path)
            os.remove(audio_path)
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

        return pb2.AudioResponse(audio_data=audio_bytes)


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_send_message_length", -1),    # Unlimited send
            ("grpc.max_receive_message_length", -1), # Unlimited receive
        ]
    )
    pb2_grpc.add_MediaServiceServicer_to_server(MediaService(), server)
    server.add_insecure_port("[::]:8004")
    print("🚀 gRPC FFmpeg server running on port 8004...")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()