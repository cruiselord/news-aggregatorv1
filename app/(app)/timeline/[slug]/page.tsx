"use client"

import { use } from "react"
import Link from "next/link"
import { Bell, Users, TrendingUp } from "lucide-react"
import { timelineEvents } from "@/lib/mock-data"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const biasShiftData = [
  { week: "W1", proGov: 28, independent: 52, opposition: 20 },
  { week: "W2", proGov: 35, independent: 45, opposition: 20 },
  { week: "W3", proGov: 25, independent: 35, opposition: 40 },
  { week: "W4", proGov: 55, independent: 30, opposition: 15 },
  { week: "W5", proGov: 45, independent: 35, opposition: 20 },
  { week: "W6", proGov: 15, independent: 40, opposition: 45 },
  { week: "W7", proGov: 35, independent: 45, opposition: 20 },
  { week: "W8", proGov: 30, independent: 50, opposition: 20 },
]

const keyPlayers = [
  { name: "INEC Chairman", role: "Electoral Commission" },
  { name: "President Tinubu", role: "Head of State" },
  { name: "Atiku Abubakar", role: "Opposition Leader" },
  { name: "Peter Obi", role: "Labour Party" },
  { name: "Senate President", role: "Legislature" },
]

const dotColors: Record<string, string> = {
  neutral: "bg-[#008751]",
  disputed: "bg-[#FF6D00]",
  crisis: "bg-[#B71C1C]",
}

export default function TimelinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  return (
    <div className="flex gap-0">
      {/* Main Timeline */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground text-balance">2027 Election Coverage</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Jan 15 – Feb 28, 2026 · 156 articles · 23 sources · 8 weeks
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[100px] top-0 bottom-0 w-0.5 bg-[#008751]/30" />

          <div className="flex flex-col gap-8">
            {timelineEvents.map((event, i) => (
              <div key={i} className="relative flex gap-6">
                {/* Date */}
                <div className="w-[84px] shrink-0 pt-1 text-right">
                  <p className="text-sm font-bold text-[#008751]">{event.date.split(",")[0]}</p>
                  <p className="text-xs text-muted-foreground">{event.date.split(", ")[1]}</p>
                </div>

                {/* Dot */}
                <div className="relative z-10 mt-1.5 flex items-start justify-center">
                  <div className={`h-4 w-4 rounded-full border-2 border-card ${dotColors[event.status]}`} />
                </div>

                {/* Event Card */}
                <div className="flex-1 rounded-lg border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.coverageCount} sources covered this
                  </p>
                  <div className="mt-3">
                    <BiasBar
                      proGov={event.biasBreakdown.proGov}
                      independent={event.biasBreakdown.independent}
                      opposition={event.biasBreakdown.opposition}
                      size="sm"
                      showLabels
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    {["PT", "CH", "PU"].map((initial) => (
                      <div key={initial} className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-xs font-bold text-muted-foreground">
                        {initial}
                      </div>
                    ))}
                  </div>
                  <Link href={`/story/${slug}`} className="mt-3 inline-block text-sm font-medium text-[#008751] hover:underline">
                    See all coverage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-[300px] shrink-0 border-l border-border p-4 lg:block">
        {/* Key Players */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Key Players
          </h3>
          <ul className="flex flex-col gap-2">
            {keyPlayers.map((player) => (
              <li key={player.name} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.role}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bias Shift Chart */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Bias Shift Over Time
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={biasShiftData}>
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="proGov" stroke="#1565C0" strokeWidth={2} dot={false} name="Pro-Gov" />
              <Line type="monotone" dataKey="independent" stroke="#2E7D32" strokeWidth={2} dot={false} name="Independent" />
              <Line type="monotone" dataKey="opposition" stroke="#B71C1C" strokeWidth={2} dot={false} name="Opposition" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subscribe */}
        <div className="mt-4">
          <Button className="w-full bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90">
            <Bell className="mr-2 h-4 w-4" /> Subscribe to Updates
          </Button>
        </div>
      </div>
    </div>
  )
}
