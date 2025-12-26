import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# ---------------------------
# LANGUAGE MAP
# ---------------------------
LANG_MAP = {
    "hi": "hin_Deva", "mr": "mar_Deva", "ne": "npi_Deva", "sa": "san_Deva",
    "mai": "mai_Deva", "kok": "kok_Deva", "ta": "tam_Taml", "kn": "kan_Knda",
    "te": "tel_Telu", "ml": "mal_Mlym", "bn": "ben_Beng", "as": "asm_Beng",
    "pa": "pan_Guru", "gu": "guj_Gujr", "or": "ori_Orya", "ur": "urd_Arab",
    "en": "eng_Latn"
}

MODEL_NAME = "facebook/nllb-200-distilled-600M"

# ---------------------------
# LOAD MODEL
# ---------------------------
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

print(f"✓ NLLB model loaded on {device}")

# ---------------------------
# TEXT CHUNKING
# ---------------------------
def chunk_text(text: str, max_tokens: int = 450):
    """
    Splits text into chunks safe for NLLB input.
    """
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        if len(tokenizer(" ".join(current_chunk))["input_ids"]) >= max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = []

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

# ---------------------------
# TRANSLATION
# ---------------------------
def translate(text: str, source_lan: str, target_lan: str) -> str:
    src_code = LANG_MAP.get(source_lan, source_lan)
    tgt_code = LANG_MAP.get(target_lan, target_lan)

    # Validate language codes
    if tokenizer.convert_tokens_to_ids(src_code) is None:
        raise ValueError(f"Invalid source language: {source_lan}")

    if tokenizer.convert_tokens_to_ids(tgt_code) is None:
        raise ValueError(f"Invalid target language: {target_lan}")

    tokenizer.src_lang = src_code
    forced_bos_token_id = tokenizer.convert_tokens_to_ids(tgt_code)

    chunks = chunk_text(text)
    translated_chunks = []

    for chunk in chunks:
        inputs = tokenizer(
            chunk,
            return_tensors="pt",
            truncation=True,
            max_length=512
        ).to(device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                forced_bos_token_id=forced_bos_token_id,
                max_length=512,
                num_beams=4
            )

        translated_chunks.append(
            tokenizer.decode(outputs[0], skip_special_tokens=True)
        )

    return "\n".join(translated_chunks)
