from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.requests import Request
from starlette.exceptions import HTTPException as StarletteHTTPException

from utils.file_loader import extract_text
from utils.translator import translate

app = FastAPI(title="Document Translation Service")

# ---------------------------
# CORS (must be first)
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# HARD OVERRIDE ALL ERRORS
# (prevents bytes decoding)
# ---------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
    )

# ---------------------------
# HEALTH
# ---------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}

# ---------------------------
# TRANSLATE (NO VALIDATION)
# ---------------------------
@app.post("/translate")
async def translate_document(
    file: UploadFile = File(...),
    source_language: str = Form(...),
    target_language: str = Form(...)
):
    # ⚠️ DO NOT raise FastAPI validation exceptions here

    try:
        # Extract text safely
        text = extract_text(file)

        if not text or not text.strip():
            return JSONResponse(
                status_code=400,
                content={"detail": "No readable text found in document"},
            )

        translated = translate(
            text,
            source_language,
            target_language
        )

        return JSONResponse(
            status_code=200,
            content={
                "original_text": text,
                "translated_text": translated,
            },
        )

    except Exception as e:
        # NEVER rethrow → avoid FastAPI serialization
        return JSONResponse(
            status_code=500,
            content={"detail": "Translation failed"},
        )
