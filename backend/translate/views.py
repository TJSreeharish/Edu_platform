from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from modules.models import Transcript

# Create your views here.
def index(request):
    pass
@csrf_exempt
def nllb(request):
    if request.method =="POST":
        latest = Transcript.objects.latest('created_at')
        print("target_lanuage",request.POST.get("target_lan"))
        print(latest.transcript_text)
        print(latest.source_lan)
        text = latest.transcript_text
        source_lan = latest.source_lan
        target_lan = request.POST.get("target_lan")
        return JsonResponse({
            "translate": text            
        })
    return JsonResponse({
            "error":"failed to tranlate"          
        },status=500)
    