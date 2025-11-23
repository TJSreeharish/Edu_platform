"use client"

import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex-1">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index < currentStep
                    ? "bg-accent text-accent-foreground"
                    : index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-input text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check size={18} /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                    index < currentStep ? "bg-accent" : "bg-input"
                  }`}
                />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-2 text-center">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
