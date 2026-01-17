"use client"

import { useState } from "react"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

export default function Summarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [lengthType, setLengthType] = useState("medium")
  const [sentenceRange, setSentenceRange] = useState(5)
  const [summaryStyle, setSummaryStyle] = useState("abstractive")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  // ---------- FILE UPLOAD ----------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setInputText("")
    setSummary("")
    setStatus("File selected. Ready to summarize.")
  }

  // ---------- SUMMARIZE ----------
  const handleSummarize = async () => {
    if (!file) {
      alert("Please upload a document first")
      return
    }

    setLoading(true)
    setStatus("Uploading document and extracting text...")
    setSummary("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("length_type", lengthType)
    formData.append("sentence_range", String(sentenceRange))
    formData.append("summary_style", summaryStyle)

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/modules/summarize/",
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await response.json()

      if (data.status === "success") {
        setInputText(data.extracted_text)
        setSummary(data.summary)
        setStatus("Summary generated successfully")
      } else {
        setStatus("Error: " + data.message)
      }
    } catch (error) {
      setStatus("Backend not reachable")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Document Summarization</h1>

      <SectionCard
        title="Upload Document"
        description="PDF, DOCX, TXT supported"
        icon={<FileText size={20} />}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="block w-full"
        />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionCard title="Original Content">
          <TextEditor
            value={inputText}
            onChange={setInputText}
            placeholder="Extracted document text will appear here"
          />
        </SectionCard>

        <SectionCard title="Summary Configuration">
          <div className="space-y-4">
            <select
              value={lengthType}
              onChange={(e) => setLengthType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>

            <div>
              <label>Number of sentences: {sentenceRange}</label>
              <input
                type="range"
                min={2}
                max={10}
                value={sentenceRange}
                onChange={(e) => setSentenceRange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <select
              value={summaryStyle}
              onChange={(e) => setSummaryStyle(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="abstractive">Abstractive</option>
              <option value="points">Bullet Points</option>
              <option value="technical">Technical</option>
              <option value="scientific">Scientific</option>
              <option value="simple">Simple</option>
            </select>

            <Button
              onClick={handleSummarize}
              disabled={loading}
              className="w-full bg-accent"
            >
              {loading ? "Summarizing..." : "Generate Summary"}
            </Button>

            {status && (
              <p className="text-sm text-muted-foreground">{status}</p>
            )}
          </div>
        </SectionCard>
      </div>

      {summary && (
        <SectionCard title="Generated Summary">
          <TextEditor value={summary} onChange={setSummary} />
          <Button variant="outline" className="w-full mt-4">
            <Download size={18} /> Download Summary
          </Button>
        </SectionCard>
      )}
    </div>
  )
}
