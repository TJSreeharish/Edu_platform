"use client"

import { useState } from "react"
import { Upload, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/shared/file-uploader"
import { LanguageSelector } from "@/components/shared/language-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

// If we want more we will add
const LANG_MAP: Record<string, string> = {
  en: "eng_Latn",
  hi: "hin_Deva",
  kn: "kan_Knda",
  ta: "tam_Taml",
  te: "tel_Telu",
  ml: "mal_Mlym",
  // Add more as needed
};

export default function VideoTranscription() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState("")
  const [audio_language, setAudioLanguage] = useState("auto")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) setVideoFile(files[0])
  }

  const NllbTranslate = async () => {
    if (!transcript.trim()) {
      alert("Nothing to translate")
      return
    }

    const target_lan = LANG_MAP[targetLanguage]
    if (!target_lan) {
      alert("Invalid target language")
      return
    }

    setIsTranslating(true)

    const data = new FormData()
    data.append("target_lan", target_lan)

    try {
      const response = await fetch("http://127.0.0.1:8000/translate/nllb/", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const res = await response.json()
      if (res.status === "success") {
        setTranscript(res.translated)
      } else {
        alert("Translation error: " + (res.error || "unknown"))
      }
    } catch (err) {
      alert("Translation failed")
      console.error(err)
    } finally {
      setIsTranslating(false)
    }
  }

  // Transcription remains unchanged
  const handleTranscribe = async () => {
    if (!videoFile) return
    setIsTranscribing(true)
    setTranscript("")

    const formData = new FormData()
    formData.append("video_file", videoFile)
    formData.append("source_lan", audio_language)

    try {
      const response = await fetch("http://127.0.0.1:8000/modules/video_transcribe/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Transcription failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setTranscript(data.only_transcript || data.transcript || "")
    } catch (error) {
      console.error(error)
      setTranscript(`Error: ${error instanceof Error ? error.message : "Failed to transcribe"}`)
    } finally {
      setIsTranscribing(false)
    }
  }

  const downloadTranscript = (format: "txt" | "docx") => {
    if (!transcript) return
    const element = document.createElement("a")
    const file = new Blob([transcript], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `transcript.${format}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(element.href)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Video Transcription</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Upload Video" description="Drag and drop or click">
          <FileUploader accept="video/*" onFileSelect={handleFileSelect} />
          {videoFile && <p>Ready to transcribe: {videoFile.name}</p>}
        </SectionCard>

        <SectionCard title="Transcript" description="Edit transcript">
          <TextEditor value={transcript} onChange={setTranscript} placeholder="Transcription appears here..." />
        </SectionCard>
      </div>

      <SectionCard title="Translate Transcript">
        <LanguageSelector label="Audio Language" value={audio_language} onSelect={setAudioLanguage} />
        <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />
        <Button onClick={NllbTranslate} disabled={!transcript || isTranslating}>
          {isTranslating ? "Translating..." : "Translate Transcript"}
        </Button>
      </SectionCard>

      <div className="flex gap-4">
        <Button onClick={handleTranscribe} disabled={!videoFile || isTranscribing}>
          {isTranscribing ? "Transcribing..." : "Transcribe Video"}
        </Button>
        <Button onClick={() => downloadTranscript("txt")} disabled={!transcript}>Download TXT</Button>
        <Button onClick={() => downloadTranscript("docx")} disabled={!transcript}>Download DOCX</Button>
      </div>
    </div>
  )
}
