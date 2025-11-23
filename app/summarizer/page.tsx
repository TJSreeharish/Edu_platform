"use client"

import { useState } from "react"
import { Languages, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/shared/file-uploader"
import { LanguageSelector } from "@/components/shared/language-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { Stepper } from "@/components/shared/stepper"
import { SectionCard } from "@/components/shared/section-card"

export default function Summarizer() {
  const [inputText, setInputText] = useState("")
  const [summaryType, setSummaryType] = useState("medium")
  const [summary, setSummary] = useState("")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [crossLangStep, setCrossLangStep] = useState(0)
  const [isSummarizing, setIsSummarizing] = useState(false)

  const handleSummarize = async () => {
    if (!inputText) return
    setIsSummarizing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const summaryText = {
      short: "This is a brief summary of the input text.",
      medium: "This is a comprehensive summary of the input content, maintaining key points and important details.",
      detailed:
        "This is a detailed summary that preserves all significant information, nuances, and context from the original text while presenting it in a condensed format.",
    }

    setSummary(summaryText[summaryType as keyof typeof summaryText])
    setIsSummarizing(false)
  }

  const handleCrossLanguageSummarize = async () => {
    setCrossLangStep(0)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCrossLangStep(1)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCrossLangStep(2)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCrossLangStep(3)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Document Summarization</h1>
        <p className="text-muted-foreground">Create intelligent summaries with cross-language support</p>
      </div>

      <Tabs defaultValue="standard" className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-input border-border">
          <TabsTrigger value="standard">Standard Summary</TabsTrigger>
          <TabsTrigger value="crosslang">Cross-Language</TabsTrigger>
        </TabsList>

        {/* Standard Summary Tab */}
        <TabsContent value="standard" className="space-y-6">
          <SectionCard
            title="Upload or Paste Content"
            description="Support for PDF, Word, and text files"
            icon={<Languages size={20} />}
          >
            <FileUploader
              accept=".pdf,.docx,.txt"
              onFileSelect={(files) => {
                setInputText(
                  "Sample document content to summarize. The system supports various file formats and will extract the text automatically for summarization.",
                )
              }}
            />
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SectionCard title="Original Content">
              <TextEditor value={inputText} onChange={setInputText} placeholder="Paste your content here..." />
            </SectionCard>

            <SectionCard title="Summary Settings">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Summary Type</label>
                  <select
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                  >
                    <option value="short">Short (1-2 sentences)</option>
                    <option value="medium">Medium (3-5 sentences)</option>
                    <option value="detailed">Detailed (Full paragraph)</option>
                  </select>
                </div>

                <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />

                <Button
                  onClick={handleSummarize}
                  disabled={!inputText || isSummarizing}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {isSummarizing ? "Summarizing..." : "Generate Summary"}
                </Button>
              </div>
            </SectionCard>
          </div>

          {summary && (
            <SectionCard title="Generated Summary">
              <TextEditor value={summary} onChange={setSummary} placeholder="Summary will appear here..." />
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Download size={18} />
                Download Summary
              </Button>
            </SectionCard>
          )}
        </TabsContent>

        {/* Cross-Language Summary Tab */}
        <TabsContent value="crosslang" className="space-y-6">
          <SectionCard title="Cross-Language Summarization Pipeline">
            <Stepper
              steps={["Translate to English", "Summarize Content", `Translate to ${targetLanguage.toUpperCase()}`]}
              currentStep={crossLangStep}
            />
          </SectionCard>

          <SectionCard title="Input Document" description="Upload document in any language">
            <FileUploader
              accept=".pdf,.docx,.txt"
              onFileSelect={(files) => {
                setInputText("Sample document in original language for cross-language summarization.")
              }}
            />
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Target Language</label>
              <LanguageSelector value={targetLanguage} onSelect={setTargetLanguage} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Summary Type</label>
              <select className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground">
                <option>Short</option>
                <option>Medium</option>
                <option>Detailed</option>
              </select>
            </div>
          </div>

          <Button onClick={handleCrossLanguageSummarize} className="w-full bg-accent hover:bg-accent/90">
            Start Pipeline
          </Button>

          {crossLangStep > 0 && (
            <SectionCard title="Pipeline Output">
              <TextEditor value={summary} onChange={setSummary} placeholder="Summary will appear after processing..." />
            </SectionCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
