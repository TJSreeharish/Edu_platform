# C:\Users\prath\Downloads\Docker_All_Modules\nllb_docker\server.py
import os
import tempfile
import torch
import fitz
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from docx import Document
from langdetect import detect

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: inside the container we will mount your Windows folder at /models/nllb
# so the model path below should match the model folder name inside the mounted directory.
# MODEL_DIR_NAME = "f8d333a098d19b4fd9a8b18f94170487ad3f821d"
# MODEL_PATH = f"/models/nllb/{MODEL_DIR_NAME}"

# # Load tokenizer & model
# tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
# model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)
MODEL_NAME = "facebook/nllb-200-distilled-600M"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)


device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)


def extract_text_from_pdf(path):
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc)


def extract_text_from_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def detect_language(text):
    try:
        return detect(text)
    except:
        return "en"


lang_map = {
    "hi": "hin_Deva", "mr": "mar_Deva", "ne": "npi_Deva", "sa": "san_Deva",
    "mai": "mai_Deva", "kok": "kok_Deva", "ta": "tam_Taml", "kn": "kan_Knda",
    "te": "tel_Telu", "ml": "mal_Mlym", "bn": "ben_Beng", "as": "asm_Beng",
    "pa": "pan_Guru", "gu": "guj_Gujr", "or": "ori_Orya", "ur": "urd_Arab",
    "en": "eng_Latn"
}


def translate(text, src_lang, tgt_lang):
    # set source language on tokenizer
    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=1024).to(device)
    with torch.no_grad():
        output = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
            max_length=1024,
            num_beams=4,
            early_stopping=True,
        )
    return tokenizer.decode(output[0], skip_special_tokens=True)


@app.post("/translate")
async def translate_document(
    file: UploadFile,
    source_language: str = Form(None),
    target_language: str = Form(...)
):
    # save uploaded file to a temporary location (so fitz/docx can open it)
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    ext = os.path.splitext(file.filename)[1].lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(tmp_path)
    elif ext == ".docx":
        text = extract_text_from_docx(tmp_path)
    else:
        # fallback: treat as plain text
        text = contents.decode("utf-8", errors="ignore")

    if not source_language:
        detected = detect_language(text)
        source_language = lang_map.get(detected, "eng_Latn")
    else:
        # if user passed two-letter code (e.g. "en" or "hi") map it to NLLB codes
        source_language = lang_map.get(source_language, source_language)

    tgt = lang_map.get(target_language, target_language)

    translated = translate(text, src_lang=source_language, tgt_lang=tgt)

    return {
        "original_text": text,
        "translated_text": translated,
        "src_lang": source_language,
        "tgt_lang": tgt
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8903)