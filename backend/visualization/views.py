from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# In-memory store for demo purposes
EQUATIONS_STORE = []

@csrf_exempt
def add_equation(request):
    """
    POST { "latex": "y = x^2" } -> adds equation
    """
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        latex = data.get("latex")
        if not latex:
            return JsonResponse({"error": "LaTeX required"}, status=400)
        EQUATIONS_STORE.append(latex)
        return JsonResponse({"status": "success", "equations": EQUATIONS_STORE})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def list_equations(request):
    """
    GET -> returns all stored equations
    """
    return JsonResponse({"equations": EQUATIONS_STORE})
