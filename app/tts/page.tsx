"use client"

import { useState } from "react"
import { Mic2, Play, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/shared/language-selector"
import { AccentSelector } from "@/components/shared/accent-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { AudioWaveform } from "@/components/shared/audio-waveform"
import { SectionCard } from "@/components/shared/section-card"

export default function TextToSpeech() {
  const [inputText, setInputText] = useState("")
  const [language, setLanguage] = useState("en")
  const [accent, setAccent] = useState("neutral")
  const [pitch, setPitch] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [voiceType, setVoiceType] = useState("neutral")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!inputText) return
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Text-to-Speech</h1>
        <p className="text-muted-foreground">Generate natural-sounding audio with Indian language accents</p>
      </div>

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
            <select className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground">
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
      <SectionCard title="Generated Audio">
        <AudioWaveform
          onDownload={() => {
            const element = document.createElement("a")
            element.setAttribute("href", "data:audio/mp3;base64,SUQz")
            element.setAttribute("download", "audio.mp3")
            element.style.display = "none"
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
          }}
        />
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleGenerate}
          disabled={!inputText || isGenerating}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          <Play size={18} />
          {isGenerating ? "Generating..." : "Generate Speech"}
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Download size={18} />
          Download Audio
        </Button>
      </div>
    </div>
  )
}
