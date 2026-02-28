"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Target, BarChart3, AlertTriangle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { sources, stories } from "@/lib/mock-data"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const dateRanges = ["Last 7 days", "30 days", "All time"]

const pieData = [
  { name: "Pro-Gov", value: 22, fill: "#1565C0" },
  { name: "Independent", value: 61, fill: "#2E7D32" },
  { name: "Opposition", value: 17, fill: "#B71C1C" },
]

const topicData = [
  { name: "Politics", value: 45 },
  { name: "Economy", value: 22 },
  { name: "Sports", value: 18 },
  { name: "Other", value: 15 },
]

const topSources = [
  { rank: 1, name: "Premium Times", bias: "independent", articles: 12 },
  { rank: 2, name: "Punch", bias: "independent", articles: 9 },
  { rank: 3, name: "Channels TV", bias: "independent", articles: 8 },
  { rank: 4, name: "Daily Trust", bias: "pro-gov", articles: 6 },
  { rank: 5, name: "Sahara Reporters", bias: "opposition", articles: 5 },
]

const biasColorMap: Record<string, { bg: string; text: string }> = {
  "pro-gov": { bg: "bg-[#1565C0]/10", text: "text-[#1565C0]" },
  independent: { bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]" },
  opposition: { bg: "bg-[#B71C1C]/10", text: "text-[#B71C1C]" },
}

const blindspotStories = stories.filter((s) => s.isBlindspot).slice(0, 3)

export default function MyBiasPage() {
  const [dateRange, setDateRange] = useState("Last 7 days")

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Naija Media Diet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your reading habits and bias exposure
          </p>
        </div>
        <div className="flex gap-1">
          {dateRanges.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                dateRange === range ? "bg-[#008751] text-[#ffffff]" : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1 — Stat Boxes */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Articles Read
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">47</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" /> Your Bias
          </div>
          <p className="mt-2 text-lg font-bold text-[#2E7D32]">Lean Independent</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" /> Factuality Avg
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">7.2<span className="text-base font-normal text-muted-foreground">/10</span></p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-[#FF6D00]" /> Blindspots Missed
          </div>
          <p className="mt-2 text-3xl font-bold text-[#FF6D00]">12</p>
        </div>
      </div>

      {/* Row 2 — Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Donut Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Reading Distribution
          </h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            {pieData.map((entry) => (
              <span key={entry.name} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                {entry.name} {entry.value}%
              </span>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            You mostly read Independent sources — consider exploring Pro-Government perspectives
          </p>
        </div>

        {/* Factuality Gauge */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Factuality Score
          </h2>
          <div className="flex flex-col items-center justify-center">
            <svg width="240" height="140" viewBox="0 0 240 140">
              <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#E5E5E5" strokeWidth="16" strokeLinecap="round" />
              <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#B71C1C" strokeWidth="16" strokeLinecap="round" strokeDasharray="94 283" />
              <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#FFD700" strokeWidth="16" strokeLinecap="round" strokeDasharray="189 283" strokeDashoffset="-94" />
              <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#2E7D32" strokeWidth="16" strokeLinecap="round" strokeDasharray="283 283" strokeDashoffset="-189" />
              {/* Needle pointing to 7.2 */}
              <line
                x1="120"
                y1="120"
                x2={120 + 70 * Math.cos(Math.PI - (7.2 / 10) * Math.PI)}
                y2={120 - 70 * Math.sin(Math.PI - (7.2 / 10) * Math.PI)}
                stroke="#171717"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="120" cy="120" r="5" fill="#171717" />
              <text x="120" y="105" textAnchor="middle" className="fill-foreground text-2xl font-bold">7.2</text>
            </svg>
            <p className="mt-2 text-sm text-muted-foreground">
              The sources you read are mostly HIGH factuality
            </p>
          </div>
        </div>
      </div>

      {/* Row 3 — Tables */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Top 5 Sources */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Top 5 Sources
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Outlet</th>
                <th className="pb-2 text-left font-medium">Bias</th>
                <th className="pb-2 text-right font-medium">Articles</th>
              </tr>
            </thead>
            <tbody>
              {topSources.map((s) => {
                const style = biasColorMap[s.bias]
                return (
                  <tr key={s.rank} className="border-b border-border">
                    <td className="py-2.5 text-muted-foreground">{s.rank}</td>
                    <td className="py-2.5 font-medium text-foreground">{s.name}</td>
                    <td className="py-2.5">
                      <Badge className={`${style.bg} ${style.text} text-xs capitalize`}>
                        {s.bias.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-foreground">{s.articles}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Favorite Topics */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Favorite Topics
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 50]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#008751" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Blindspots */}
      <div className="mt-6 rounded-lg border-2 border-[#FF6D00] bg-[#FF6D00]/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
          <AlertTriangle className="h-5 w-5 text-[#FF6D00]" />
          Your Reading Blindspots
        </h2>
        <div className="flex flex-col gap-3">
          {blindspotStories.map((story) => (
            <div key={story.id} className="flex items-center justify-between rounded-md bg-card p-3 border border-border">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{story.headline}</p>
                <p className="text-xs text-muted-foreground">
                  You only read {story.blindspotSide} coverage
                </p>
              </div>
              <Link href={`/story/${story.id}`} className="ml-4 flex shrink-0 items-center gap-1 text-sm font-medium text-[#008751] hover:underline">
                Read the other side <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
