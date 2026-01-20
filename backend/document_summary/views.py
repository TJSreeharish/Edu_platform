import json
import os
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# from .processor import extract_text, summarize_document

# Temporary upload directory
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@csrf_exempt
def summarize_view(request):
    """
    POST API
    Receives:
      - file (PDF / DOCX / TXT)
      - length_type
      - sentence_range
      - summary_style

    Returns:
      - extracted_text
      - summary
    """

    if request.method != "POST":
        return JsonResponse(
            {"status": "error", "message": "Only POST allowed"},
            status=405
        )

    try:
        # ----------- Read parameters -----------
        uploaded_file = request.FILES.get("file")
        length_type = request.POST.get("length_type", "medium")
        sentence_range = int(request.POST.get("sentence_range", 5))
        summary_style = request.POST.get("summary_style", "abstractive")

        if not uploaded_file:
            return JsonResponse(
                {"status": "error", "message": "No file uploaded"},
                status=400
            )

        # ----------- Save file temporarily -----------
        temp_filename = f"{uuid.uuid4()}_{uploaded_file.name}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)

        with open(temp_path, "wb") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        # ----------- Extract text -----------
        # extracted_text = extract_text(temp_path)

        # if not extracted_text.strip():
        #     return JsonResponse(
        #         {"status": "error", "message": "No readable text found in document"},
        #         status=400
        #     )

        # ----------- Generate summary -----------
        # summary = summarize_document(
        #     file_path=temp_path,
        #     length_type=length_type,
        #     sentence_range=sentence_range,
        #     summary_style=summary_style,
        # )

        # ----------- Response -----------
        return JsonResponse({
            "status": "success",
            "extracted_text": extracted_text,
            "summary": summary,
        })

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": str(e)},
            status=500
        )

    finally:
        # ----------- Cleanup -----------
        if "temp_path" in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
