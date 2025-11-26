from fastapi import FastAPI, UploadFile, File,Form
import uvicorn
import os
import torch
import shutil
import os
import sys

import os
import sys
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning)

# ============================================================================
# CRITICAL: Fix cuDNN library path FIRST
# ============================================================================
cudnn_paths = [
    '/opt/conda/lib/python3.11/site-packages/nvidia/cudnn/lib',
    '/opt/conda/lib/python3.11/site-packages/ctranslate2.libs',  # Add this!
    '/opt/conda/lib/python3.11/site-packages/torch/lib'
]

current_ld_path = os.environ.get('LD_LIBRARY_PATH', '')
os.environ['LD_LIBRARY_PATH'] = ':'.join(cudnn_paths) + ':' + current_ld_path

# Preload libraries
import ctypes
try:
    # Try to load cuDNN 9 libraries
    cudnn_lib_path = '/opt/conda/lib/python3.11/site-packages/nvidia/cudnn/lib'
    libs_to_preload = [
        'libcudnn_ops.so.9',
        'libcudnn_cnn.so.9',
        'libcudnn_adv.so.9',
    ]
    
    for lib in libs_to_preload:
        lib_path = os.path.join(cudnn_lib_path, lib)
        if os.path.exists(lib_path):
            ctypes.CDLL(lib_path, mode=ctypes.RTLD_GLOBAL)
    
    print("✓ cuDNN library preloaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not preload cuDNN: {e}")

import torch, gc
app = FastAPI()
#!/usr/bin/env python3

import os
import torch
import gc
import json
import time
from datetime import datetime
from pydub import AudioSegment
import whisperx
from nemo.collections.asr.models import SortformerEncLabelModel


def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"



def get_segment_speaker(segment):
    """
    Determine the primary speaker for a segment based on word-level speaker assignments.
    Uses the most frequent speaker among words in the segment.
    """
    if "words" not in segment or not segment["words"]:
        return "Unknown"
    
    # Count speaker occurrences
    speaker_counts = {}
    for word in segment["words"]:
        speaker = word.get("speaker", "Unknown")
        speaker_counts[speaker] = speaker_counts.get(speaker, 0) + 1
    
    # Return the most frequent speaker
    if speaker_counts:
        return max(speaker_counts, key=speaker_counts.get)
    return "Unknown"


def save_as_srt(segments, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, 1):
            start = format_time(seg["start"])
            end = format_time(seg["end"])
            
            # Get speaker from word-level assignments
            speaker = get_segment_speaker(seg)
            
            text = seg["text"].strip()
            f.write(f"{i}\n{start} --> {end}\n[{speaker}] {text}\n\n")

def ensure_mono_16k(input_file):
    """Convert audio to mono 16kHz WAV for Sortformer."""
    sound = AudioSegment.from_file(input_file)
    sound = sound.set_channels(1).set_frame_rate(16000)
    output_file = os.path.splitext(input_file)[0] + "_mono16k.wav"
    sound.export(output_file, format="wav")
    return output_file


def assign_word_speakers(words, diar_segments):
    """
    Assign Sortformer speakers to WhisperX words by time overlap.
    """
    merged = []
    for word in words:
        w_start, w_end = word.get("start"), word.get("end")
        if w_start is None or w_end is None:
            continue
        speaker = "Unknown"
        for seg in diar_segments:
            if w_start >= seg["start_time"] and w_end <= seg["end_time"]:
                speaker = seg["speaker"]
                break
        merged.append({
            "word": word["word"],
            "start": w_start,
            "end": w_end,
            "score": word.get("score"),
            "speaker": speaker
        })
    return merged


def run(audio_file, output_srt, output_json, transcript_path ,device="cuda", compute_type="int8",lang_code=None):
    start_time = time.time()
    timings = {}

    def step(name, func, *args, **kwargs):
        t0 = time.time()
        result = func(*args, **kwargs)
        timings[name] = time.time() - t0
        return result

    print(f"🚀 Starting at {datetime.now().strftime('%H:%M:%S')}")

    # 1. Load WhisperX model
    model = step("WhisperX Model Load", whisperx.load_model, "small", device, compute_type=compute_type)

    # 2. Load audio
    audio = step("Audio Load", whisperx.load_audio, audio_file)

    # 3. Transcribe
    result = step("Transcription", model.transcribe, audio, 16,language = lang_code)
    segments, lang_code = result["segments"], result["language"]
    del model; gc.collect()
    print(100*"=")
    print(segments)
    print(100*"=")
    # 4. Align
    try:
        align_model, metadata = step("Align Model Load", whisperx.load_align_model, lang_code, device)
        result = step("Alignment", whisperx.align, segments, align_model, metadata, audio, device)
        segments = result["segments"]
        del align_model; gc.collect()
    except Exception as e:
        print(f"Alignment skipped or failed: {e}")
        print("Continuing with original segments...")
        align_model, metadata = step("Align Model Load", whisperx.load_align_model, "ml", device)
        result = step("Alignment", whisperx.align, segments, align_model, metadata, audio, device)
        segments = result["segments"]
        del align_model; gc.collect()
        # segments remains unchanged from transcription
    print(100*"&")
    trans = " ".join([s["text"] for s in segments])
    print(trans)
    with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(trans)
    print(100*"&*")

    # 5. Run Sortformer diarization
    processed_audio = ensure_mono_16k(audio_file)
    sort_model = step("Sortformer Load", SortformerEncLabelModel.from_pretrained, "nvidia/diar_streaming_sortformer_4spk-v2")
    sort_model.eval().to(device)
    sort_segments, _ = step("Sortformer Diarization", sort_model.diarize, processed_audio, batch_size=1, include_tensor_outputs=True)
    del sort_model; gc.collect()
    print(100*"=")
    print(sort_segments)
    print(100*"=")
    print(sort_segments[0][1])    
    print(100*"=")

    
    # Normalize Sortformer output
    diar_segments = []
    for seg_list in sort_segments:
        if isinstance(seg_list, list):
            # Handle nested list structure
            for seg in seg_list:
                if isinstance(seg, str):
                    parts = seg.split()
                    if len(parts) == 3:
                        diar_segments.append({
                            "start_time": float(parts[0]),
                            "end_time": float(parts[1]),
                            "speaker": parts[2]
                        })
                elif isinstance(seg, dict):
                    diar_segments.append({
                        "start_time": float(seg["start_time"]),
                        "end_time": float(seg["end_time"]),
                        "speaker": seg["speaker"]
                    })
        elif isinstance(seg_list, dict):
            # Handle direct dict format
            diar_segments.append({
                "start_time": float(seg_list["start_time"]),
                "end_time": float(seg_list["end_time"]),
                "speaker": seg_list["speaker"]
            })
        elif isinstance(seg_list, str):
            # Handle direct string format
            parts = seg_list.split()
            if len(parts) == 3:
                diar_segments.append({
                    "start_time": float(parts[0]),
                    "end_time": float(parts[1]),
                    "speaker": parts[2]
                })
    print(100*"=")
    print(diar_segments)
    print(100*"=")
    # 6. Assign speakers to words
    for seg in segments:
        if "words" in seg:
            seg["words"] = assign_word_speakers(seg["words"], diar_segments)

    # 7. Save
    save_as_srt(segments, output_srt)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump({"segments": segments}, f, ensure_ascii=False, indent=2)

    # Summary
    total_time = time.time() - start_time
    print("\n📊 SUMMARY")
    print(f"Audio Duration: {len(audio)/16000:.2f}s")
    print(f"Language: {lang_code}")
    print(f"Segments: {len(segments)}")
    print(f"Total Processing Time: {total_time:.2f}s\n")

    print("⏱️ TIME BREAKDOWN:")
    for step_name, sec in timings.items():
        print(f" - {step_name:<25}: {sec:.2f}s")
    return lang_code

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import torch
import shutil
import tempfile
import os
import uuid
import json
# from main import run

app = FastAPI()

@app.post("/process_audio/")
async def process_audio(file: UploadFile = File(...),source_lan: str = Form(None)):
    try:
        # Create a temporary working directory
        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, file.filename)
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Output paths (temporary)
            output_srt = os.path.join(tmpdir, "output.srt")
            output_json = os.path.join(tmpdir, "output.json")
            transcript =  os.path.join(tmpdir, "transcript.txt")
           
            print("langauge used :" ,source_lan)
            if source_lan == 'auto':
                source_lan = None
            # Run WhisperX + Sortformer
            detect_lan = run(
                audio_file=input_path,
                output_srt=output_srt,
                output_json=output_json,
                transcript_path = transcript,
                device="cuda" if torch.cuda.is_available() else "cpu",
                compute_type="int8",
                lang_code = source_lan
              
            )
            print("langauge used :" ,source_lan)
            # Read results0
            with open(output_srt, "r", encoding="utf-8") as f:
                srt_data = f.read()

            with open(output_json, "r", encoding="utf-8") as f:
                json_data = json.load(f)
            with open(transcript, "r", encoding="utf-8") as f:
                 trans = f.read()

        # Return both files’ content
        return {
            "status": "success",
            "message": "Processing complete",
            "srt_content": srt_data,
            "json_content": json_data,
            "only_transcript": trans,
            "source_lan" : detect_lan
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}



@app.post("/clear_memory/")
async def clear_memory():
    try:
        import gc
        print("🧹 Clearing CUDA memory...")
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
            torch.cuda.synchronize()
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.reset_accumulated_memory_stats()
        print("✅ CUDA memory cleared.")
        return {"status": "success", "message": "CUDA memory cleared successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8003)


