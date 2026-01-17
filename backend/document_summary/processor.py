import os
import re
import torch
import pdfplumber
import nltk
from docx import Document
from nltk.tokenize import sent_tokenize
from transformers import PegasusTokenizer, PegasusForConditionalGeneration

# ====================== NLTK SETUP ======================
NLTK_PACKAGES = ["punkt"]

for pkg in NLTK_PACKAGES:
    try:
        nltk.data.find(f"tokenizers/{pkg}")
    except LookupError:
        nltk.download(pkg, quiet=True)

# ====================== MODEL SETUP ======================
MODEL_PATH = "C:/Users/prath/Downloads/secret1/ml_models/pegasus"

tokenizer = PegasusTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

model = PegasusForConditionalGeneration.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()

# ====================== TEXT EXTRACTION ======================
def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[-1].lower()

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    elif ext == ".pdf":
        pages = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                txt = page.extract_text()
                if txt:
                    pages.append(txt)
        return "\n".join(pages)

    elif ext == ".docx":
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    else:
        raise ValueError("Unsupported file format")

# ====================== SUMMARY CONFIG ======================
SUMMARY_LENGTHS = {
    "short": {"min": 40, "max": 100},
    "medium": {"min": 100, "max": 200},
    "long": {"min": 200, "max": 350},
}

# ====================== CORE SUMMARIZER ======================
def summarize_text(
    text: str,
    length_type: str = "medium",
    sentence_range: int = 5,
    summary_style: str = "abstractive",
) -> str:

    if not text.strip():
        raise ValueError("Empty input text")

    length_cfg = SUMMARY_LENGTHS.get(length_type, SUMMARY_LENGTHS["medium"])

    inputs = tokenizer(
        text,
        truncation=True,
        padding="longest",
        max_length=1024,
        return_tensors="pt",
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        summary_ids = model.generate(
            inputs["input_ids"],
            num_beams=5,
            min_length=length_cfg["min"],
            max_length=length_cfg["max"],
            length_penalty=1.8,
            early_stopping=True,
        )

    summary = tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )

    # ===================== CRITICAL CLEANING =====================

    # Remove Pegasus newline tokens
    summary = summary.replace("<n>", " ")

    # Remove any leftover XML-like tokens
    summary = re.sub(r"<[^>]+>", " ", summary)

    # Normalize whitespace
    summary = re.sub(r"\s+", " ", summary).strip()

    # ===================== SENTENCE CONTROL =====================
    sentences = sent_tokenize(summary)
    sentences = sentences[:sentence_range]

    # ===================== STYLE FORMATTING =====================
    if summary_style == "points":
        summary = "\n".join(f"• {s}" for s in sentences)

    elif summary_style == "technical":
        summary = "Technical Summary:\n" + " ".join(sentences)

    elif summary_style == "scientific":
        summary = "Abstract:\n" + " ".join(sentences)

    elif summary_style == "simple":
        summary = " ".join(sentences)
        summary = re.sub(
            r"\b(utilize|approximately|significant)\b",
            lambda m: {
                "utilize": "use",
                "approximately": "about",
                "significant": "important"
            }[m.group(0)],
            summary
        )

    else:  # abstractive
        summary = " ".join(sentences)

    return summary


# ====================== DOCUMENT PIPELINE ======================
def summarize_document(
    file_path: str = None,
    text: str = None,
    length_type: str = "medium",
    sentence_range: int = 5,
    summary_style: str = "abstractive",
) -> str:

    if file_path:
        text = extract_text(file_path)
    elif not text:
        raise ValueError("File or text input required")

    return summarize_text(
        text=text,
        length_type=length_type,
        sentence_range=sentence_range,
        summary_style=summary_style,
    )
