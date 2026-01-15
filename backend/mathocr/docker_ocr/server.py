from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
from qwen_vl_utils import process_vision_info
from PIL import Image
import torch
import io
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and processor once at startup
print("Loading model...")
model = Qwen2VLForConditionalGeneration.from_pretrained(
    "prithivMLmods/LatexMind-2B-Codec",
    torch_dtype=torch.float16
)
processor = AutoProcessor.from_pretrained(
    "prithivMLmods/Qwen2-VL-OCR-2B-Instruct"
)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
print(f"Model loaded on {device}")

@app.post("/convert")
async def convert_image_to_latex(file: UploadFile = File(...)):
    # Read and process the uploaded image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # Prepare messages
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": "Convert this handwritten math to LaTeX."}
            ],
        }
    ]
    
    # Process inputs
    text = processor.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    
    image_inputs, video_inputs = process_vision_info(messages)
    
    inputs = processor(
        text=[text],
        images=image_inputs,
        videos=video_inputs,
        padding=True,
        return_tensors="pt",
    )
    
    inputs = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
    
    # Generate LaTeX
    generated_ids = model.generate(**inputs, max_new_tokens=1024)
    
    generated_ids_trimmed = [
        out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs['input_ids'], generated_ids)
    ]
    
    output_text = processor.batch_decode(
        generated_ids_trimmed,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True
    )
    
    return {"latex": output_text[0]}

@app.get("/")
async def root():
    return {"message": "LaTeX OCR Server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8006)