from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import EmotionRequest, EmotionResponse
from views import predict_emotion

app = FastAPI(
    title="Context Engine API",
    description="Emotion-aware context analysis service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict-emotion", response_model=EmotionResponse)
def emotion_endpoint(payload: EmotionRequest):
    return predict_emotion(payload)
