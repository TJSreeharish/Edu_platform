import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import "./globals.css"

// Load fonts
const geist = Geist({ subsets: ["latin"], weight: ["400", "700"] })
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400"] })

export const metadata: Metadata = {
  title: "EduFlow - Educational Platform",
  description: "Modern multi-feature educational platform with AI-powered content processing",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0e27",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} ${geistMono.className} font-sans antialiased bg-background text-foreground`}
      >
        <div className="flex h-screen flex-col">
          {/* Navbar at the top */}
          <Navbar />

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>

          {/* Analytics */}
          <Analytics />
        </div>
      </body>
    </html>
  )
}
