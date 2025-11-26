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
    def ExtractAudio(self, request, context):

        # ⚡ Save incoming video to a temporary MP4 file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as vf:
            vf.write(request.video_data)
            video_path = vf.name

        audio_path = video_path.replace(".mp4", ".wav")

        # ⚡ Run ffmpeg using subprocess
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vn",                  # disable video
            "-acodec", "pcm_s16le", # output 16-bit WAV
            "-ar", "16000",         # resample to 16 kHz (change if needed)
            "-ac", "1",             # mono
            audio_path,
            "-y"                    # overwrite
        ]

        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        except subprocess.CalledProcessError as e:
            context.set_details("FFmpeg failed: " + str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return pb2.AudioResponse()

        # ⚡ Read extracted audio
        with open(audio_path, "rb") as af:
            audio_bytes = af.read()

        # ⚡ Clean up files
        os.remove(video_path)
        os.remove(audio_path)

        return pb2.AudioResponse(audio_data=audio_bytes)

def serve():
    server = grpc.server(
    futures.ThreadPoolExecutor(max_workers=10),
    options=[
        ("grpc.max_send_message_length", 1024 * 1024 * 1024),    # 200 MB
        ("grpc.max_receive_message_length", 1024 * 1024 * 1024), # 200 MB
    ]
    )
    pb2_grpc.add_MediaServiceServicer_to_server(MediaService(), server)
    server.add_insecure_port("[::]:8004")
    print("gRPC FFmpeg server running on port 8004...")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
