"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const accents = [
  { value: "hindi", label: "Hindi Accent" },
  { value: "kannada", label: "Kannada Accent" },
  { value: "tamil", label: "Tamil Accent" },
  { value: "telugu", label: "Telugu Accent" },
  { value: "malayalam", label: "Malayalam Accent" },
  { value: "bengali", label: "Bengali Accent" },
  { value: "marathi", label: "Marathi Accent" },
  { value: "neutral", label: "Neutral Accent" },
]

interface AccentSelectorProps {
  value?: string
  onSelect: (accent: string) => void
  label?: string
}

export function AccentSelector({ value = "neutral", onSelect, label = "Accent" }: AccentSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-input border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {accents.map((accent) => (
            <SelectItem key={accent.value} value={accent.value} className="text-foreground">
              {accent.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
