import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from schemas import EmotionRequest, EmotionResponse

# ---------- PATH ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "emotion_model")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Emotion model not found at {MODEL_PATH}")

# ---------- DEVICE ----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------- LOAD TOKENIZER ----------
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    use_fast=False,
    local_files_only=True
)

# ---------- LOAD MODEL ----------
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float32,
    local_files_only=True
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
