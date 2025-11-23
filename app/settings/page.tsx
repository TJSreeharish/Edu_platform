"use client"

import { useState } from "react"
import { Settings, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/shared/language-selector"
import { AccentSelector } from "@/components/shared/accent-selector"
import { SectionCard } from "@/components/shared/section-card"
import { Checkbox } from "@/components/ui/checkbox"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    defaultAccent: "neutral",
    notifications: true,
    darkMode: true,
    autoSave: true,
    compressionQuality: "high",
  })

  const handleSave = () => {
    // Simulate saving settings
    alert("Settings saved successfully!")
  }

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your platform preferences and defaults</p>
      </div>

      {/* Language & Localization */}
      <SectionCard
        title="Language & Localization"
        description="Set your preferred language and accent settings"
        icon={<Settings size={20} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LanguageSelector
            label="Default Language"
            value={settings.defaultLanguage}
            onSelect={(value) => setSettings({ ...settings, defaultLanguage: value })}
          />
          <AccentSelector
            label="Default Accent"
            value={settings.defaultAccent}
            onSelect={(value) => setSettings({ ...settings, defaultAccent: value })}
          />
        </div>
      </SectionCard>

      {/* Preferences */}
      <SectionCard title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked as boolean })}
              className="border-border"
            />
            <label className="text-sm font-medium text-foreground cursor-pointer">Dark Mode</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked as boolean })}
              className="border-border"
            />
            <label className="text-sm font-medium text-foreground cursor-pointer">Enable Notifications</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked as boolean })}
              className="border-border"
            />
            <label className="text-sm font-medium text-foreground cursor-pointer">Auto-save Changes</label>
          </div>
        </div>
      </SectionCard>

      {/* Output Quality */}
      <SectionCard title="Output Quality">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Compression Quality</label>
          <select
            value={settings.compressionQuality}
            onChange={(e) => setSettings({ ...settings, compressionQuality: e.target.value })}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="low">Low (Faster, Smaller File Size)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Best Quality)</option>
          </select>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div className="flex gap-4">
        <Button onClick={handleSave} className="flex-1 bg-accent hover:bg-accent/90">
          <Save size={18} />
          Save Settings
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
