import os
import tempfile
import torch
import fitz
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from docx import Document
from langdetect import detect

app = FastAPI()

# ---------------------------------------------------
# CORS
# ---------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# LOAD NLLB ONLINE (from HuggingFace)
# ---------------------------------------------------
MODEL_NAME = "facebook/nllb-200-distilled-600M"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
model.eval()

# ---------------------------------------------------
# SUPPORTED LANG MAP
# ---------------------------------------------------
LANG_MAP = {
    "hi": "hin_Deva", "mr": "mar_Deva", "ne": "npi_Deva", "sa": "san_Deva",
    "mai": "mai_Deva", "kok": "kok_Deva", "ta": "tam_Taml", "kn": "kan_Knda",
    "te": "tel_Telu", "ml": "mal_Mlym", "bn": "ben_Beng", "as": "asm_Beng",
    "pa": "pan_Guru", "gu": "guj_Gujr", "or": "ori_Orya", "ur": "urd_Arab",
    "en": "eng_Latn"
}

# ---------------------------------------------------
# HELPERS
# ---------------------------------------------------
def extract_pdf(path):
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc)

def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def detect_lang_safe(text):
    try:
        return detect(text)
    except:
        return "en"

def first_100_words(text):
    words = text.split()
    return " ".join(words[:100])

# ---------------------------------------------------
# FIXED TRANSLATOR — ALWAYS CORRECT TARGET LANGUAGE
# ---------------------------------------------------
def translate_text(text, src_code, tgt_code):
    # Fast mode → first 100 words
    text = first_100_words(text)

    tokenizer.src_lang = src_code

    enc = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512
    ).to(device)

    # Correct BOS token → <lang:xxx>
    tgt_token = f"<lang:{tgt_code}>"
    bos_token_id = tokenizer.convert_tokens_to_ids(tgt_token)

    if bos_token_id is None:
        raise ValueError(f"BOS token not found for {tgt_code}")

    with torch.no_grad():
        out = model.generate(
            **enc,
            forced_bos_token_id=bos_token_id,
            max_length=256,
            num_beams=4
        )

    return tokenizer.decode(out[0], skip_special_tokens=True)

# ---------------------------------------------------
# API ENDPOINT
# ---------------------------------------------------
@app.post("/translate")
async def translate_document(
    file: UploadFile,
    source_language: str = Form(None),
    target_language: str = Form(...)
):

    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")

    # Save temporarily
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    ext = os.path.splitext(file.filename)[1].lower()

    try:
        if ext == ".pdf":
            text = extract_pdf(tmp_path)
        elif ext == ".docx":
            text = extract_docx(tmp_path)
        else:
            text = content.decode("utf-8", errors="ignore")
    finally:
        os.remove(tmp_path)

    if not text.strip():
        raise HTTPException(400, "Could not extract text from document")

    # Source language
    if source_language:
        src_code = LANG_MAP.get(source_language, "eng_Latn")
    else:
        detected = detect_lang_safe(text)
        src_code = LANG_MAP.get(detected, "eng_Latn")

    # Target language
    tgt_code = LANG_MAP.get(target_language)
    if not tgt_code:
        raise HTTPException(400, f"Target language {target_language} not supported")

    translated = translate_text(text, src_code, tgt_code)

    return {
        "original_text": first_100_words(text),
        "translated_text": translated,
        "source_lang_code": src_code,
        "target_lang_code": tgt_code
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8903)
