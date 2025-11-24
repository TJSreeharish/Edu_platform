"use client"

import { useState } from "react"
import { BookOpen, Plus, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/shared/file-uploader"
import { SectionCard } from "@/components/shared/section-card"

interface Note {
  id: number
  timestamp: string
  text: string
}

export default function NoteMaker() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [currentTimestamp, setCurrentTimestamp] = useState("00:00:00")
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now(),
        timestamp: currentTimestamp,
        text: currentNote,
      }
      setNotes([...notes, newNote])
      setCurrentNote("")
    }
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const generateNotes = async () => {
    setIsGeneratingNotes(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setNotes([
      { id: 1, timestamp: "00:15", text: "Introduction to the topic" },
      { id: 2, timestamp: "02:30", text: "Key concept explained" },
      { id: 3, timestamp: "05:45", text: "Important example provided" },
    ])
    setIsGeneratingNotes(false)
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Note-Making from Videos</h1>
        <p className="text-muted-foreground">Auto-generate and organize notes with timestamp highlights</p>
      </div>

      {/* Video Upload */}
      <SectionCard
        title="Upload Video"
        description="Upload video for automatic note generation"
        icon={<BookOpen size={20} />}
      >
        <FileUploader accept="video/*" onFileSelect={generateNotes} />
      </SectionCard>

      {/* Video Player Placeholder */}
      <SectionCard title="Video Player">
        <div className="bg-input rounded-lg p-8 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">🎬</div>
            <p className="text-muted-foreground">Video player - Click play to start taking notes</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90">Play</Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Pause
          </Button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Note Input */}
        <SectionCard title="Add Note" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Timestamp</label>
              <input
                type="text"
                value={currentTimestamp}
                onChange={(e) => setCurrentTimestamp(e.target.value)}
                placeholder="00:00:00"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
              />
            </div>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Type your note..."
              className="w-full h-32 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button onClick={addNote} className="w-full bg-accent hover:bg-accent/90">
              <Plus size={18} />
              Add Note
            </Button>
          </div>
        </SectionCard>

        {/* Notes List */}
        <SectionCard title="Notes Timeline" className="lg:col-span-2">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                {isGeneratingNotes ? "Generating notes..." : "No notes yet. Add one to get started!"}
              </p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="flex gap-3 p-3 bg-input rounded-lg group">
                  <div className="flex-1">
                    <p className="text-xs font-mono text-accent mb-1">{note.timestamp}</p>
                    <p className="text-sm text-foreground">{note.text}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded transition-all"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Export Notes */}
      {notes.length > 0 && (
        <SectionCard title="Export Options">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download size={18} />
              Export as TXT
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download size={18} />
              Export as PDF
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download size={18} />
              Export as Markdown
            </Button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
