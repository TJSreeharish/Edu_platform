from django.shortcuts import render
from .services.grpc_client import extract_audio_via_grpc, is_grpc_alive
from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from modules.models import Transcript
import requests
import traceback
import uuid

audio_to_trans = "http://127.0.0.1:8003/process_audio/"
speech_to_text = "http://127.0.0.1:8005/generate/"

def index(request):
    return JsonResponse({"message": "success"})

@csrf_exempt
def video_transcribe(request):
    print("reached here")
    
    if request.method != "POST":
        return JsonResponse({"error": "send in POST method"}, status=400)
    
    video = request.FILES.get("video_file")
    source_lan = request.POST.get("source_lan", "auto")  # Default to "auto" if not provided

    
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
            "source_lan": source_lan
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
        transcript_content = result.get("only_transcript")
        transcript_id = str(uuid.uuid4())
        Transcript.objects.create(
                transcript_id=transcript_id,
                transcript_text=transcript_content,
                source_lan = result.get("source_lan")
            )
        return JsonResponse({
            "status": "success",
            "transcript": result.get("srt_content", ""),
            "json_data": result.get("json_content", {}),
            "message": result.get("message", "Processing complete"),
            "only_transcript" : result.get("only_transcript",""),
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
@csrf_exempt
def stt(request):
    if request.method != "POST":
        return JsonResponse({"error": "send in POST method"}, status=400)
    text = request.POST.get("text")
    if not text:
        return JsonResponse({"error": "text is required"}, status=400)
    
    ref_text = request.POST.get("ref_text")
    print(ref_text)
    ref_audio = request.FILES.get("ref_audio")
    if ref_audio:
        files = {
            "ref_audio": ("audio.wav", ref_audio, "audio/wav")
        }
        data = {
            "ref_text": ref_text,
            "text": text
        }
        print("Sending to TTS service")
        response = requests.post(speech_to_text, files=files, data=data, timeout=300)
        return HttpResponse( response.content, content_type="audio/wav")
    return JsonResponse({"error": "TTS service failed"}, status=500)
