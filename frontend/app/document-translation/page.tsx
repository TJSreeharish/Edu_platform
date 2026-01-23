"use client"

import { useState } from "react"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/shared/file-uploader"
import { LanguageSelector } from "@/components/shared/language-selector"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

export default function DocumentTranslation() {
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("hi")
  const [originalText, setOriginalText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files && files[0]) {
      setDocumentFile(files[0])
      setOriginalText("")
      setTranslatedText("")
    }
  }

  const handleTranslate = async () => {
    if (!documentFile) return
    setIsTranslating(true)

    const formData = new FormData()
    formData.append("file", documentFile)
    formData.append("source_language", sourceLanguage)
    formData.append("target_language", targetLanguage)

    try {
      // IMPORTANT: frontend hits FastAPI container directly
      const res = await fetch("http://172.16.2.131:8000/translate/document/", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Translation failed")
      }

      const data = await res.json()
      setOriginalText(data.original_text || "")
      setTranslatedText(data.translated_text || "")
    } catch (e) {
      console.error("Translate error:", e)
      alert("Translation failed: " + (e as Error).message)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDownload = () => {
    if (!translatedText) return
    const blob = new Blob([translatedText], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translation_${targetLanguage}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Document Translation</h1>
      <p className="text-muted-foreground">
        Translate files using NLLB-200 while preserving formatting
      </p>

      <SectionCard
        title="Upload Document"
        description="PDF, DOCX, TXT supported"
        icon={<FileText size={20} />}
      >
        <FileUploader accept=".pdf,.docx,.txt" onFileSelect={handleFileSelect} />
      </SectionCard>

      {documentFile && (
        <SectionCard title="Language Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LanguageSelector label="Source Language" value={sourceLanguage} onSelect={setSourceLanguage} />
            <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Original Text">
          <TextEditor
            value={originalText}
            onChange={setOriginalText}
            readOnly
          />
        </SectionCard>

        <SectionCard title="Translated Text">
          <TextEditor
            value={translatedText}
            onChange={setTranslatedText}
            readOnly
          />
        </SectionCard>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleTranslate} disabled={!documentFile || isTranslating}>
          {isTranslating ? "Translating..." : "Translate Document"}
        </Button>

        <Button variant="outline" disabled={!translatedText} onClick={handleDownload}>
          <Download size={18} /> Download Translation
        </Button>
      </div>
    </div>
  )
}
