import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from schemas import EmotionRequest, EmotionResponse

# ---------- MODEL CONFIG ----------
MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"  # Change to your preferred model

# ---------- DEVICE ----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------- DOWNLOAD & LOAD TOKENIZER ----------
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    use_fast=False
)

# ---------- DOWNLOAD & LOAD MODEL ----------
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32
)

model.to(device)
model.eval()

# ✅ CORRECT LABEL MAP FROM MODEL CONFIG
id2label = model.config.id2label


def predict_emotion(payload: EmotionRequest) -> EmotionResponse:
    text = payload.text.strip()

    if not text:
        return EmotionResponse(emotion="neutral")

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = model(
            input_ids=inputs["input_ids"].to(device),
            attention_mask=inputs["attention_mask"].to(device)
        )

        pred_id = int(torch.argmax(outputs.logits, dim=1).item())
        emotion = id2label.get(pred_id, "unknown")

    return EmotionResponse(emotion=emotion)