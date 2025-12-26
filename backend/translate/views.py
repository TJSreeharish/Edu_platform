import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from modules.models import Transcript

FASTAPI_TRANSLATE_URL = "http://127.0.0.1:8903/translate"

@csrf_exempt 
def nllb(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    target_lan = request.POST.get("target_lan")
    if not target_lan:
        return JsonResponse({"error": "target_lan is required"}, status=400)
    
    try:
        latest_transcript = Transcript.objects.latest()
        
        text = latest_transcript.transcript_text
        source_lan = latest_transcript.source_lan
        
        payload = {
            "text": text,
            "source_lan": source_lan,
            "target_lan": target_lan
        }
        response = requests.post(FASTAPI_TRANSLATE_URL, json=payload, timeout=300)
        
        if response.status_code == 200:
            translation_data = response.json()
            return JsonResponse({
                "status": "success",
                "translated": translation_data.get("translated_text"),

            })
        else:
            return JsonResponse({
                "error": "Translation failed",
                "details": response.json()
            }, status=response.status_code)
    
    except Transcript.DoesNotExist:
        return JsonResponse({"error": "No transcripts found"}, status=404)
    
    except requests.RequestException as e:
        return JsonResponse({
            "error": "Failed to connect to translation service",
            "details": str(e)
        }, status=503)
    
    except Exception as e:
        return JsonResponse({
            "error": "Internal server error",
            "details": str(e)
        }, status=500)