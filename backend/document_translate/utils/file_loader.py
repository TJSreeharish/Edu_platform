import io
import pdfplumber
from docx import Document


def extract_text_from_pdf(file_obj) -> str:
    """
    Safely extract text from PDF file-like object.
    Always returns a string.
    """
    text_parts = []

    try:
        file_obj.seek(0)
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        # Never propagate binary / parser errors
        return ""

    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_obj) -> str:
    """
    Safely extract text from DOCX file-like object.
    """
    try:
        file_obj.seek(0)
        doc = Document(file_obj)
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    except Exception:
        return ""


def extract_text_from_txt(file_obj) -> str:
    """
    Safely extract text from TXT file-like object.
    Handles encoding issues.
    """
    try:
        file_obj.seek(0)
        raw = file_obj.read()

        if isinstance(raw, bytes):
            return raw.decode("utf-8", errors="ignore").strip()

        return str(raw).strip()
    except Exception:
        return ""


def extract_text(upload_file) -> str:
    """
    Dispatcher for UploadFile.
    Ensures:
    - cursor reset
    - string-only return
    - no binary leaks
    """
    if not upload_file or not upload_file.filename:
        return ""

    filename = upload_file.filename.lower()

    # IMPORTANT: Always use upload_file.file
    file_obj = upload_file.file

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_obj)

    if filename.endswith(".docx"):
        return extract_text_from_docx(file_obj)

    if filename.endswith(".txt"):
        return extract_text_from_txt(file_obj)

    # Unsupported file types should NOT throw bytes into FastAPI
    return ""
