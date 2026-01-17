"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Allowed languages only:
 * English, Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali
 */
const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  { value: "te", label: "Telugu" },
  { value: "ta", label: "Tamil" },
  { value: "ml", label: "Malayalam" },
  { value: "bn", label: "Bengali" },
]

interface LanguageSelectorProps {
  value?: string
  onSelect: (language: string) => void
  label?: string
}

export function LanguageSelector({
  value = "en",
  onSelect,
  label = "Language",
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>

      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-input border-border text-foreground">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>

        <SelectContent className="bg-card border-border">
          {languages.map((lang) => (
            <SelectItem
              key={lang.value}
              value={lang.value}
              className="text-foreground"
            >
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
