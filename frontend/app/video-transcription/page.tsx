"use client"

import { useState } from "react"
import { Upload, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/shared/file-uploader"
import { LanguageSelector } from "@/components/shared/language-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

export default function VideoTranscription() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState("")
  const [audio_language, setAudioLanguage] = useState("auto")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) setVideoFile(files[0])
  }
 const NllbTranslate = async () =>{
    const data = new FormData();
    data.append("target_lan",targetLanguage);

    try{
      const response = await fetch("http://127.0.0.1:8000/translate/nllb/",{
        method:"POST",
        body:data,
      });
      if (!response.ok){
        throw new Error("translation error");
      }
      const my_data = await response.json();
      setTranscript(my_data.translate);
    }
      catch(error){
      console.error(error);
      setTranscript("Error :failed to tranlsate");
      
    }
 };

  const handleTranscribe = async () => {
    if (!videoFile) return
    setIsTranscribing(true)
    // Simulate transcription
    const formData = new FormData();
    formData.append("video_file",videoFile);
    formData.append("source_lan",audio_language);
    try{
      const response = await fetch("http://127.0.0.1:8000/modules/video_transcribe/",{
        method:"POST",
      body :formData,
    });
    if (!response.ok){
      throw new Error("transription failed");
    }
    const data = await response.json();
    setTranscript(data.transcript);
    }
    catch(error){
      console.error(error);
      setTranscript("Error :failed to transcribe");
      
    }
    setIsTranscribing(false);
   
  };

  const downloadTranscript = (format: "txt" | "docx") => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(transcript))
    element.setAttribute("download", `transcript.${format === "txt" ? "txt" : "docx"}`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Video Transcription</h1>
        <p className="text-muted-foreground">Convert video content to text with AI-powered transcription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <SectionCard
          title="Upload Video"
          description="Drag and drop your video file or click to browse"
          icon={<Upload size={20} />}
        >
          <FileUploader accept="video/*" onFileSelect={handleFileSelect} />
          {videoFile && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-foreground">
                Ready to transcribe: <span className="font-semibold">{videoFile.name}</span>
              </p>
            </div>
          )}
        </SectionCard>

        {/* Transcript Section */}
        <SectionCard title="Transcript" description="Edit and refine the transcribed text" icon={<Copy size={20} />}>
          <TextEditor value={transcript} onChange={setTranscript} placeholder="Transcription will appear here..." />
        </SectionCard>
      </div>

      {/* Translation Section */}
      <SectionCard title="Translate Transcript" description="Convert to another language">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />
          <LanguageSelector label ="Audio Language" value={audio_language} onSelect={setAudioLanguage}/>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90" onClick={NllbTranslate} >Translate Transcript</Button>
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleTranscribe}
          disabled={!videoFile || isTranscribing}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          {isTranscribing ? "Transcribing..." : "Transcribe Video"}
        </Button>
        <Button onClick={() => downloadTranscript("txt")} disabled={!transcript} variant="outline" className="flex-1">
          <Download size={18} />
          Download TXT
        </Button>
        <Button onClick={() => downloadTranscript("docx")} disabled={!transcript} variant="outline" className="flex-1">
          <Download size={18} />
          Download DOCX
        </Button>
      </div>
    </div>
  )
}
