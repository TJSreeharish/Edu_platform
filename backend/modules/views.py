from django.shortcuts import render
from .services.grpc_client import extract_audio_via_grpc, is_grpc_alive
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import traceback

audio_to_trans = "http://127.0.0.1:8003/process_audio/"

def index(request):
    return JsonResponse({"message": "success"})

@csrf_exempt
def extract_audio(request):
    print("reached here")
    
    if request.method != "POST":
        return JsonResponse({"error": "send in POST method"}, status=400)
    
    video = request.FILES.get("video_file")
    lang = request.POST.get("lang", "auto")  # Default to "auto" if not provided
    
    if not video:
        return JsonResponse({"error": "video not received"}, status=400)
    
    try:

        if not is_grpc_alive():
            print("gRPC server is NOT alive")
            return JsonResponse({"error": "gRPC server is not available"}, status=503)
        
        print("gRPC server is alive")
        
     
        print("Extract audio")
        audio = extract_audio_via_grpc(video)
        
        if not audio:
            return JsonResponse({"error": "Failed to extract audio"}, status=500)
        
        print(f"Audio extracted: {len(audio)} bytes")
        
        files = {
            "file": ("audio.wav", audio, "audio/wav")
        }
        data = {
            "language": lang
        }
        

        print("Sending to STT service")
        response = requests.post(audio_to_trans, files=files, data=data, timeout=300)
        
        
        if response.status_code != 200:
            print(f"STT service error: {response.status_code}")
            return JsonResponse({
                "error": f"STT service returned error: {response.status_code}",
                "details": response.text
            }, status=500)
        
        result = response.json()
        print(f"STT result: {result.get('status')}")

        return JsonResponse({
            "status": "success",
            "transcript": result.get("srt_content", ""),
            "json_data": result.get("json_content", {}),
            "message": result.get("message", "Processing complete")
        })
        
    except requests.exceptions.ConnectionError as e:
        print(f"Connection error: {e}")
        traceback.print_exc()
        return JsonResponse({
            "error": "Cannot connect to STT service",
            "details": str(e)
        }, status=503)
        
    except requests.exceptions.Timeout as e:
        print(f"Timeout error: {e}")
        traceback.print_exc()
        return JsonResponse({
            "error": "STT processing timeout",
            "details": str(e)
        }, status=504)
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        traceback.print_exc()
        return JsonResponse({
            "error": "Internal server error",
            "details": str(e)
        }, status=500)