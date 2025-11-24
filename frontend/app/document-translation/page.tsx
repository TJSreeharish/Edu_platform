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
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [originalText, setOriginalText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) {
      setDocumentFile(files[0])
      // Simulate loading document content
      setOriginalText(
        "Sample document content that would be extracted from the PDF or Word file. This is a demonstration of how the translation engine would process longer documents while maintaining formatting.",
      )
    }
  }

  const handleTranslate = async () => {
    if (!originalText) return
    setIsTranslating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTranslatedText(
      "Contenido de documento de ejemplo que se extraería del archivo PDF o Word. Esta es una demostración de cómo el motor de traducción procesaría documentos más largos manteniendo el formato.",
    )
    setIsTranslating(false)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Document Translation</h1>
        <p className="text-muted-foreground">Translate documents while preserving structure and formatting</p>
      </div>

      {/* Upload Section */}
      <SectionCard
        title="Upload Document"
        description="Support for PDF, DOCX, and text files"
        icon={<FileText size={20} />}
      >
        <FileUploader accept=".pdf,.docx,.txt" onFileSelect={handleFileSelect} />
      </SectionCard>

      {/* Language Selection */}
      {documentFile && (
        <SectionCard title="Language Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LanguageSelector label="Source Language" value={sourceLanguage} onSelect={setSourceLanguage} />
            <LanguageSelector label="Target Language" value={targetLanguage} onSelect={setTargetLanguage} />
          </div>
        </SectionCard>
      )}

      {/* Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Original Text" description="Source document content">
          <TextEditor
            value={originalText}
            onChange={setOriginalText}
            placeholder="Document content will appear here..."
            readOnly={!!documentFile}
          />
        </SectionCard>

        <SectionCard title="Translated Text" description="Translated content">
          <TextEditor
            value={translatedText}
            onChange={setTranslatedText}
            placeholder="Translation will appear here..."
            readOnly
          />
        </SectionCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleTranslate}
          disabled={!originalText || isTranslating}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          {isTranslating ? "Translating..." : "Translate Document"}
        </Button>
        <Button variant="outline" disabled={!translatedText} className="flex-1 bg-transparent">
          <Download size={18} />
          Download Translation
        </Button>
      </div>
    </div>
  )
}
