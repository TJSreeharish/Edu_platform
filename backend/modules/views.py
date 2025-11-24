from django.shortcuts import render
from .services.grpc_client import extract_audio_via_grpc
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
video_to_audio = "http://127.0.0.1:8003/extract_audio/"
# Create your views here.

def index(request):
    return JsonResponse({"message":"sucess"})

@csrf_exempt
def extract_audio(request):
    if request.method != "POST":
        return JsonResponse({"error":"send in post method bro"},status = 400)
    video = request.FILES.get("video_file")
    lang = request.POST.get("lang")
    if not video:
        return JsonResponse({"error":"video not recieved"},status  = 400)
    audio  = extract_audio_via_grpc(video)
    if audio:
        return JsonResponse({"transcript":"the audio is recieved"})
        
    
    return JsonResponse({"transcript":"this is the sample from backend",
                         "language recieved" : lang})