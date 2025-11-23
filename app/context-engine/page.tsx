"use client"

import { useState } from "react"
import { Zap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/shared/language-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"
import { AccentSelector } from "@/components/shared/accent-selector"
import { Checkbox } from "@/components/ui/checkbox"

export default function ContextEngine() {
  const [inputText, setInputText] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [outputText, setOutputText] = useState("")
  const [selectedAccent, setSelectedAccent] = useState("neutral")
  const [contextOptions, setContextOptions] = useState({
    sentiment: true,
    emotion: true,
    tone: true,
    accent: false,
  })
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (!inputText) return
    setIsTranslating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setOutputText(
      "Context-aware translated text that preserves the original sentiment, emotional tone, and teaching style while adapting to the target language and accent requirements.",
    )
    setIsTranslating(false)
  }

  const toggleContext = (key: keyof typeof contextOptions) => {
    setContextOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Context-Aware Translation</h1>
        <p className="text-muted-foreground">Preserve sentiment, emotion, and tone in your translations</p>
      </div>

      {/* Input Section */}
      <SectionCard
        title="Input Text"
        description="Enter or paste the text you want to translate"
        icon={<Zap size={20} />}
      >
        <TextEditor value={inputText} onChange={setInputText} placeholder="Enter text to translate..." />
      </SectionCard>

      {/* Context Preservation Options */}
      <SectionCard title="Context Preservation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Object.entries({
              sentiment: "Preserve Sentiment",
              emotion: "Preserve Emotion",
              tone: "Preserve Teaching Tone",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  checked={contextOptions[key as keyof typeof contextOptions]}
                  onCheckedChange={() => toggleContext(key as keyof typeof contextOptions)}
                  className="border-border"
                />
                <label className="text-sm font-medium text-foreground cursor-pointer">{label}</label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />
            <div className="flex items-center gap-3">
              <Checkbox
                checked={contextOptions.accent}
                onCheckedChange={() => toggleContext("accent")}
                className="border-border"
              />
              <label className="text-sm font-medium text-foreground cursor-pointer">Maintain Indian Accent</label>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Accent Selection */}
      {contextOptions.accent && (
        <SectionCard title="Accent Settings">
          <AccentSelector value={selectedAccent} onSelect={setSelectedAccent} label="Select Accent" />
        </SectionCard>
      )}

      {/* Output Section */}
      <SectionCard title="Translated Output" description="Context-preserved translation">
        <TextEditor
          value={outputText}
          onChange={setOutputText}
          placeholder="Translation will appear here..."
          readOnly
        />
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleTranslate}
          disabled={!inputText || isTranslating}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          {isTranslating ? "Translating..." : "Generate Context-Preserved Translation"}
        </Button>
        <Button disabled={!outputText} variant="outline" className="flex-1 bg-transparent">
          <Download size={18} />
          Download
        </Button>
      </div>
    </div>
  )
}
