"use client"

interface TextEditorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function TextEditor({
  value = "",
  onChange,
  placeholder = "Enter text here...",
  readOnly = false,
}: TextEditorProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full h-64 p-4 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
    </div>
  )
}
