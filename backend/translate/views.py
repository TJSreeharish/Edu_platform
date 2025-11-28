import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

FASTAPI_TRANSLATE_URL = "http://127.0.0.1:8003/translate"  # No trailing slash

VALID_NLLB_CODES = ["eng_Latn", "hin_Deva", "kan_Knda", "tam_Taml", "tel_Telu", "mal_Mlym"]
def index(request):
    return JsonResponse({"message": "translate service alive"})
@csrf_exempt
def nllb(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=400)

    text = request.POST.get("text")
    source_lan = request.POST.get("source_lan", "eng_Latn")
    target_lan = request.POST.get("target_lan")

    if not text or not target_lan:
        return JsonResponse({"error": "text and target_lan required"}, status=400)

    if target_lan not in VALID_NLLB_CODES:
        return JsonResponse({"error": f"Invalid target_lan: {target_lan}"}, status=400)

    try:
        data = {"text": text, "source_lan": source_lan, "target_lan": target_lan}
        response = requests.post(FASTAPI_TRANSLATE_URL, json=data, timeout=400)

        if response.status_code != 200:
            return JsonResponse({"error": "FastAPI translation failed", "details": response.text}, status=500)

        translated_text = response.json().get("translated_text")
        return JsonResponse({"status": "success", "translated": translated_text})

    except Exception as e:
        return JsonResponse({"error": "Server error", "details": str(e)}, status=500)
