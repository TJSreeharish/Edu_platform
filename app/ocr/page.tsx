"use client"

import { useState } from "react"
import { BookOpen, Download, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/shared/file-uploader"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

export default function OCR() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (files: File[]) => {
    if (files[0]) setImageFile(files[0])
  }

  const handleOCR = async () => {
    if (!imageFile) return
    setIsProcessing(true)
    // Simulate OCR processing with animated gear
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setExtractedText(
      "This is the extracted text from your image or PDF document. The OCR engine has processed the visual content and converted it into editable text format. You can now edit, translate, or manipulate this text as needed.",
    )
    setIsProcessing(false)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">OCR & Editable Documents</h1>
        <p className="text-muted-foreground">Convert images and PDFs to editable text with intelligent processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <SectionCard
          title="Upload Image or PDF"
          description="Drag and drop or click to browse"
          icon={<BookOpen size={20} />}
        >
          <FileUploader accept="image/*,.pdf" onFileSelect={handleFileSelect} />
          {imageFile && !extractedText && (
            <div className="mt-4">
              <Button onClick={handleOCR} disabled={isProcessing} className="w-full bg-accent hover:bg-accent/90">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">
                      <Zap size={18} />
                    </div>
                    Processing...
                  </div>
                ) : (
                  "Extract Text"
                )}
              </Button>
            </div>
          )}
        </SectionCard>

        {/* Extracted Text Section */}
        <SectionCard
          title="Extracted Text"
          description="Edit and refine the extracted content"
          icon={<BookOpen size={20} />}
        >
          <TextEditor
            value={extractedText}
            onChange={setExtractedText}
            placeholder="Extracted text will appear here..."
          />
        </SectionCard>
      </div>

      {/* Action Section */}
      {extractedText && (
        <SectionCard title="Next Steps">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-primary hover:bg-primary/90 justify-center">
              <ArrowRight size={18} />
              Send to Translation
            </Button>
            <Button variant="outline" className="border-border justify-center bg-transparent">
              <Download size={18} />
              Download as Word File
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
