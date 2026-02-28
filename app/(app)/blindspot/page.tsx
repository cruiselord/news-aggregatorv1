"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, AlertTriangle, Share2, Info } from "lucide-react"
import { stories, sources } from "@/lib/mock-data"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const blindspotStories = stories.filter((s) => s.isBlindspot)

const biasColorMap: Record<string, string> = {
  "pro-gov": "bg-[#1565C0]",
  independent: "bg-[#2E7D32]",
  opposition: "bg-[#B71C1C]",
}

export default function BlindspotPage() {
  const [tab, setTab] = useState("pro-gov")

  const filtered = tab === "pro-gov"
    ? blindspotStories.filter((s) => s.blindspotSide === "Pro-Government")
    : blindspotStories.filter((s) => s.blindspotSide === "Opposition")

  const allBlindspots = [...filtered, ...blindspotStories.filter((s) => !filtered.includes(s))]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Eye className="h-8 w-8 text-[#FF6D00]" />
          <h1 className="text-2xl font-bold text-foreground">Naija Blindspot</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Stories covered heavily by only ONE political perspective in Nigerian media
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pro-gov">Pro-Gov Blindspot</TabsTrigger>
          <TabsTrigger value="opposition">Opposition Blindspot</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="flex flex-col gap-4">
            {allBlindspots.map((story) => (
              <Link key={story.id} href={`/story/${story.id}`}>
                <article className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md border-l-4 border-l-[#FF6D00]">
                  <h3 className="text-base font-semibold text-foreground">
                    {story.headline}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{story.summary}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge className="bg-[#FF6D00] text-[#ffffff] text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {story.blindspotPercent}% {story.blindspotSide} Coverage
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <BiasBar
                      proGov={story.biasBreakdown.proGov}
                      independent={story.biasBreakdown.independent}
                      opposition={story.biasBreakdown.opposition}
                      size="md"
                      showLabels
                    />
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Missing perspectives: {story.blindspotSide === "Pro-Government"
                      ? "2 opposition outlets NOT covering this"
                      : "3 pro-government outlets NOT covering this"}
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground">Who is covering:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {sources.slice(0, 4).map((source) => (
                        <span key={source.id} className="flex items-center gap-1 text-xs text-foreground">
                          <span className={`h-2 w-2 rounded-full ${biasColorMap[source.bias]}`} />
                          {source.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-sm font-medium text-[#008751]">
                      See all coverage →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Right-sidebar-style widgets inline for this page */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-[#FF6D00]" /> Why Blindspots Matter
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When a story is only told from one perspective, you miss important context.
            NaijaPulse helps you see what{"'"}s being left out of the conversation.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Your Blindspot Score</h3>
          <p className="text-3xl font-bold text-[#FF6D00]">72</p>
          <p className="text-xs text-muted-foreground">out of 100 this week — good reading balance</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Share Awareness</h3>
          <p className="mb-3 text-sm text-muted-foreground">Help others see what they{"'"}re missing</p>
          <Button variant="outline" size="sm" className="w-full">
            <Share2 className="mr-2 h-4 w-4" /> Share Blindspot Report
          </Button>
        </div>
      </div>
    </div>
  )
}
