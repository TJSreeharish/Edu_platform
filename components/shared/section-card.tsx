import type { ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  icon?: ReactNode
}

export function SectionCard({ title, description, children, icon }: SectionCardProps) {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        {icon && <div className="text-accent mt-1">{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
