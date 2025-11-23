"use client"

import { Play, Pause, Download } from "lucide-react"
import { useState } from "react"

interface AudioWaveformProps {
  duration?: number
  onPlay?: () => void
  onDownload?: () => void
}

export function AudioWaveform({ duration = 120, onPlay, onDownload }: AudioWaveformProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    onPlay?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-4 bg-card/50 border border-border rounded-lg p-4">
      <button onClick={handlePlay} className="p-2 hover:bg-primary/20 rounded-lg transition-colors">
        {isPlaying ? <Pause size={20} className="text-primary" /> : <Play size={20} className="text-primary" />}
      </button>

      <div className="flex-1">
        <div className="h-12 flex items-end justify-between gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-accent to-accent/40 rounded-full"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <button onClick={onDownload} className="p-2 hover:bg-primary/20 rounded-lg transition-colors">
        <Download size={20} className="text-muted-foreground hover:text-primary" />
      </button>
    </div>
  )
}
