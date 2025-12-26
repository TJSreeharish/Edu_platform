"use client"

import { useState, useRef } from "react"
import { Mic2, Play, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/shared/language-selector"
import { AccentSelector } from "@/components/shared/accent-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { AudioWaveform } from "@/components/shared/audio-waveform"
import { SectionCard } from "@/components/shared/section-card"

export default function TextToSpeech() {
  const [inputText, setInputText] = useState("")
  const [refText, setRefText] = useState("राजधानी दिल्ली में साहित्य के सितारों के महाकुंभ यानी साहित्य आजतक 2025 का आज आखिरी दिन है. इस कार्यक्रम का आयोजन दिल्ली के मेजर ध्यानचंद स्टेडियम में हो रहा है.")
  const [language, setLanguage] = useState("en")
  const [accent, setAccent] = useState("neutral")
  const [pitch, setPitch] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [voiceType, setVoiceType] = useState("neutral")
  const [isGenerating, setIsGenerating] = useState(false)
  const [refAudio, setRefAudio] = useState(null)
  const [refAudioName, setRefAudioName] = useState("")
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setRefAudio(file)
      setRefAudioName(file.name)
    }
  }

  const handleGenerate = async () => {
    if (!inputText || !refAudio) {
      alert("Please provide both input text and reference audio")
      return
    }

    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      formData.append("text", inputText)
      formData.append("ref_text", refText)
      formData.append("ref_audio", refAudio, "audio.wav")

      const response = await fetch("http://127.0.0.1:8000/modules/stt/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        setGeneratedAudioUrl(audioUrl)
      } else {
        alert("Failed to generate audio")
      }
    } catch (error) {
      console.error("Error generating audio:", error)
      alert("Error generating audio")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedAudioUrl) {
      const element = document.createElement("a")
      element.setAttribute("href", generatedAudioUrl)
      element.setAttribute("download", "generated_audio.wav")
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Text-to-Speech</h1>
        <p className="text-muted-foreground">Generate natural-sounding audio with Indian language accents</p>
      </div>

      {/* Reference Text Section */}
      <SectionCard
        title="Reference Text"
        description="Text for the reference audio (default provided)"
        icon={<Mic2 size={20} />}
      >
        <TextEditor 
          value={refText} 
          onChange={setRefText} 
          placeholder="Enter reference text..." 
        />
      </SectionCard>

      {/* Reference Audio Section */}
      <SectionCard
        title="Reference Audio"
        description="Upload audio for voice cloning"
      >
        <div className="space-y-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload size={18} />
            Upload Audio
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {refAudioName && (
            <div className="p-3 bg-muted rounded-lg border border-border">
              <p className="text-sm text-foreground">
                <span className="font-medium">Selected: </span>
                {refAudioName}
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Input Section */}
      <SectionCard
        title="Input Text"
        description="Enter the text you want to convert to speech"
        icon={<Mic2 size={20} />}
      >
        <TextEditor value={inputText} onChange={setInputText} placeholder="Enter text to convert to speech..." />
      </SectionCard>

      {/* Settings Section */}
      <SectionCard title="Voice Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LanguageSelector label="Language" value={language} onSelect={setLanguage} />
          <AccentSelector label="Accent" value={accent} onSelect={setAccent} />

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Voice Type</label>
            <select 
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
            >
              <option value="neutral">Neutral</option>
              <option value="soft">Soft</option>
              <option value="hard">Hard</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Adjustment Sliders */}
      <SectionCard title="Audio Adjustments">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Pitch</label>
              <span className="text-xs text-muted-foreground">{pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Speed</label>
              <span className="text-xs text-muted-foreground">{speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </SectionCard>

      {/* Audio Player Section */}
      {generatedAudioUrl && (
        <SectionCard title="Generated Audio">
          <AudioWaveform onDownload={handleDownload} />
          <audio src={generatedAudioUrl} controls className="w-full mt-4" />
        </SectionCard>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleGenerate}
          disabled={!inputText || !refAudio || isGenerating}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          <Play size={18} />
          {isGenerating ? "Generating..." : "Generate Speech"}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 bg-transparent"
          onClick={handleDownload}
          disabled={!generatedAudioUrl}
        >
          <Download size={18} />
          Download Audio
        </Button>
      </div>
    </div>
  )
}