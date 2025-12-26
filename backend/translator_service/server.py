from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = FastAPI()

class TranslateRequest(BaseModel):
    text: str
    source_lan: str
    target_lan: str

# Language mapping
LANG_MAP = {
    "hi": "hin_Deva", "mr": "mar_Deva", "ne": "npi_Deva", "sa": "san_Deva",
    "mai": "mai_Deva", "kok": "kok_Deva", "ta": "tam_Taml", "kn": "kan_Knda",
    "te": "tel_Telu", "ml": "mal_Mlym", "bn": "ben_Beng", "as": "asm_Beng",
    "pa": "pan_Guru", "gu": "guj_Gujr", "or": "ori_Orya", "ur": "urd_Arab",
    "en": "eng_Latn"
}

model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

print(f"✓ Model loaded on device: {device}")

def first_100_words(text):
    """Extract first 100 words from text"""
    words = text.split()
    return ' '.join(words[:100])

def translate_text(text, src_code, tgt_code):
    # Fast mode → first 100 words
    text = first_100_words(text)

    # Set source language
    tokenizer.src_lang = src_code

    enc = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512
    ).to(device)

    # Get the correct BOS token ID for target language
    forced_bos_token_id = tokenizer.lang_code_to_id[tgt_code]

    with torch.no_grad():
        out = model.generate(
            **enc,
            forced_bos_token_id=forced_bos_token_id,
            max_length=256,
            num_beams=4
        )

    return tokenizer.decode(out[0], skip_special_tokens=True)

@app.get("/health")
async def health():
    return {"status": "ok", "device": device}

@app.post("/translate")
async def translate(req: TranslateRequest):
    try:
        # Map language codes
        src_code = LANG_MAP.get(req.source_lan, req.source_lan)
        tgt_code = LANG_MAP.get(req.target_lan, req.target_lan)
        
        # Validate language codes exist in tokenizer
        if src_code not in tokenizer.lang_code_to_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid source language: {req.source_lan} ({src_code})"
            )
        if tgt_code not in tokenizer.lang_code_to_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid target language: {req.target_lan} ({tgt_code})"
            )
        
        # Translate
        translated_text = translate_text(req.text, src_code, tgt_code)
        
        return {
            "status": "success",
            "translated_text": translated_text,
            "source_lang": src_code,
            "target_lang": tgt_code
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Language code not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")