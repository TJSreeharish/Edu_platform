"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

const EMOTION_API_URL = "http://172.16.2.131:9091/predict-emotion"

// 🔹 Backend LABEL → Emotion mapping
const LABEL_TO_EMOTION: Record<string, string> = {
  LABEL_0: "angry",
  LABEL_1: "happy",
  LABEL_2: "neutral",
  LABEL_3: "sad",
}

export default function ContextEngine() {
  const [inputText, setInputText] = useState("")
  const [emotion, setEmotion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeEmotion = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    setEmotion(null)
    setError(null)

    try {
      const res = await fetch(EMOTION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      })

      if (!res.ok) {
        throw new Error("Emotion API failed")
      }

      const data = await res.json()

      // 🔹 Convert LABEL_x → readable emotion
      const readableEmotion =
        LABEL_TO_EMOTION[data.emotion] ?? data.emotion

      setEmotion(readableEmotion)
    } catch (err) {
      setError("Backend error. Is FastAPI running on port 9091?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Emotion Analysis</h1>
        <p className="text-muted-foreground">
          Detect emotional tone using an offline deep learning model
        </p>
      </div>

      <SectionCard
        title="Input Text"
        description="Enter text to analyze emotion"
        icon={<Zap size={20} />}
      >
        <TextEditor
          value={inputText}
          onChange={setInputText}
          placeholder="Type something emotional..."
        />
      </SectionCard>

      <Button
        onClick={analyzeEmotion}
        disabled={!inputText || loading}
        className="w-full bg-accent"
      >
        {loading ? "Analyzing..." : "Analyze Emotion"}
      </Button>

      {emotion && (
        <div className="text-lg font-semibold">
          🧠 Detected Emotion:{" "}
          <span className="text-accent capitalize">{emotion}</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  )
}
