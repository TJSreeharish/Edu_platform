"use client"

import { useState } from "react"
import { Calculator, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/shared/file-uploader"
import { TextEditor } from "@/components/shared/text-editor"
import { SectionCard } from "@/components/shared/section-card"

export default function MathVisualizer() {
  const [equations, setEquations] = useState<string[]>([])
  const [latex, setLatex] = useState("")
  const [customEquation, setCustomEquation] = useState("")

  const handleAddEquation = () => {
    if (customEquation.trim()) {
      setEquations([...equations, customEquation])
      setCustomEquation("")
    }
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Math Visualization</h1>
        <p className="text-muted-foreground">Extract, convert, and visualize mathematical equations</p>
      </div>

      <Tabs defaultValue="extraction" className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-input border-border">
          <TabsTrigger value="extraction">Equation Extraction</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        {/* Extraction Tab */}
        <TabsContent value="extraction" className="space-y-6">
          <SectionCard
            title="Upload Document"
            description="Upload PDF or image containing math equations"
            icon={<Calculator size={20} />}
          >
            <FileUploader
              accept="image/*,.pdf"
              onFileSelect={() => {
                setEquations(["y = mx + b", "E = mc²", "ax² + bx + c = 0"])
              }}
            />
          </SectionCard>

          {equations.length > 0 && (
            <SectionCard title="Extracted Equations">
              <div className="space-y-3">
                {equations.map((eq, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-input rounded-lg">
                    <span className="text-foreground font-mono text-sm">{eq}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="LaTeX Editor">
            <TextEditor value={latex} onChange={setLatex} placeholder="Enter or edit LaTeX code..." />
            <div className="flex gap-4 mt-4">
              <Button className="flex-1 bg-primary hover:bg-primary/90">Preview LaTeX</Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90">Send to Desmos View</Button>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          <SectionCard title="Graph Visualization">
            <div className="bg-input rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-muted-foreground">Desmos Graph Viewer - 2D visualization</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Equation Input">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customEquation}
                  onChange={(e) => setCustomEquation(e.target.value)}
                  placeholder="Enter equation (e.g., y = x^2)"
                  className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-foreground"
                />
                <Button onClick={handleAddEquation} className="bg-accent hover:bg-accent/90">
                  <Plus size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-primary hover:bg-primary/90">Render 2D Graph</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Generate Manim GIF</Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="3D Visualization">
            <div className="bg-input rounded-lg p-8 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎲</div>
                <p className="text-muted-foreground">3D Object Placeholder - Coming Soon</p>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
