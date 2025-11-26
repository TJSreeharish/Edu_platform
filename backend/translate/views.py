from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def index(request):
    pass
@csrf_exempt
def nllb(request):
    if request.method == 'POST':
        target_lan = request.POST.get("target_lan")
        print("target",target_lan)
        return JsonResponse({"status":"you are safe"})
    return JsonResponse({"status":"you are killed"})
    
    