from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

app = FastAPI()

class TranslateRequest(BaseModel):
    text: str
    source_lan: str
    target_lan: str

model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/translate")
async def translate(req: TranslateRequest):
    inputs = tokenizer(req.text, return_tensors="pt", padding=True, truncation=True).to(device)

    # New recommended method
    forced_bos_token_id = tokenizer.get_lang_id(req.target_lan)

    generated_tokens = model.generate(**inputs, forced_bos_token_id=forced_bos_token_id)
    translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    return {"status": "success", "translated_text": translated_text}
