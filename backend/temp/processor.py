import os
import subprocess
import docker
import tempfile
import logging
from typing import Optional, Dict, Any, Tuple
from django.conf import settings
from django.core.files.storage import default_storage
import numpy as np
import scipy.io.wavfile as sf
import os
import json
import requests
import logging
from typing import Optional, Dict, Any
PROCESS_URL = "http://127.0.0.1:8003/process_audio/"
CLEAR_URL = "http://127.0.0.1:8003/clear_memory/"

logger = logging.getLogger(__name__)

class STTProcessor:
    """Speech-to-Text processor using Docker Whisper container"""
    
    def __init__(self):
        self.container_name = "whisper_fastapi2"
        self.docker_client = None
        self.PROCESS_URL = PROCESS_URL
        self.CLEAR_URL = CLEAR_URL
        self.results_cache = {}
    def get_supported_formats(self) -> list:
        """Return list of supported audio formats"""
        return ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.wma']
    
    def validate_audio_file(self, filename: str) -> bool:
        """Validate if the audio file format is supported"""
        _, ext = os.path.splitext(filename.lower())
        return ext in self.get_supported_formats()
    def transcribe_audio(self, audio_file,lang_code, filename: Optional[str] = None) -> Dict[str, Any]:
        """Send audio to transcription server and return results (SRT + JSON)"""
        try:
            if filename is None:
                filename = audio_file.name

            files = {"file": (filename, audio_file, "audio/wav")}
            data = {"language":lang_code}
            response = requests.post(self.PROCESS_URL, files=files,data=data)
            data = response.json()

            if data.get("status") == "success":
                logger.info(f"✅ Transcription succeeded for: {filename}")
                base_name = os.path.splitext(filename)[0]
                srt_data = data.get("srt_content", "")
                json_data = data.get("json_content", {})

                # ✅ store results in memory
                self.results_cache[base_name] = {
                    "srt": srt_data,
                    "json": json_data,
                }

                return {
                    "success": True,
                    "base_name": base_name,
                    "srt_content": srt_data,
                    "json_content": json_data,
                }
            else:
                logger.error(f"❌ Transcription failed for: {filename} | {data.get('message')}")
                return {"success": False, "error": data.get("message", "Unknown error")}

        except Exception as e:
            logger.error(f"❌ Transcription exception: {str(e)}")
            return {"success": False, "error": str(e)}

        finally:
            try:
                clear_res = requests.post(self.CLEAR_URL)
                if clear_res.status_code == 200:
                    logger.info("✅ Server memory cleared.")
                else:
                    logger.warning("⚠️ Failed to clear server memory.")
            except Exception as clear_err:
                logger.error(f"❌ Error clearing server memory: {clear_err}")

    def get_transcription_results(self, base_name: str) -> Dict[str, Any]:
        """Return cached transcription results (no file reading)"""
        if base_name in self.results_cache:
            logger.info(f"✅ Returning cached results for {base_name}")
            return self.results_cache[base_name]
        else:
            raise FileNotFoundError(f"No cached results for base_name: {base_name}")