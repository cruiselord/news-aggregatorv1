"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy, Medal, Star, ArrowUp, Flame } from "lucide-react"
import { leaderboardUsers } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

const timeFilters = ["This Week", "This Month", "All Time"]

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("This Week")

  const podium = leaderboardUsers.slice(0, 3)
  const rest = leaderboardUsers.slice(3)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <Trophy className="h-7 w-7 text-[#FFD700]" /> Leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Top readers and bias-balanced news consumers in Nigeria
          </p>
        </div>
        <div className="flex gap-1">
          {timeFilters.map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                timeFilter === f
                  ? "bg-[#008751] text-[#ffffff]"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="mb-8 flex items-end justify-center gap-4">
        {/* 2nd place */}
        <div className="flex w-36 flex-col items-center rounded-lg border border-border bg-card p-4">
          <Medal className="mb-2 h-6 w-6 text-[#A0A0A0]" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A0A0A0]/10 text-lg font-bold text-[#A0A0A0]">
            {podium[1].avatar}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{podium[1].username}</p>
          <p className="text-xs text-muted-foreground">{podium[1].points.toLocaleString()} NP</p>
          <Badge variant="secondary" className="mt-1 text-xs">{podium[1].badge}</Badge>
        </div>

        {/* 1st place */}
        <div className="flex w-40 flex-col items-center rounded-lg border-2 border-[#FFD700] bg-[#FFD700]/5 p-5">
          <Trophy className="mb-2 h-8 w-8 text-[#FFD700]" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/20 text-xl font-bold text-[#FFD700]">
            {podium[0].avatar}
          </div>
          <p className="mt-2 text-base font-bold text-foreground">{podium[0].username}</p>
          <p className="text-sm font-medium text-[#FFD700]">{podium[0].points.toLocaleString()} NP</p>
          <Badge className="mt-1 bg-[#FFD700] text-[#171717] text-xs">{podium[0].badge}</Badge>
        </div>

        {/* 3rd place */}
        <div className="flex w-36 flex-col items-center rounded-lg border border-border bg-card p-4">
          <Medal className="mb-2 h-6 w-6 text-[#CD7F32]" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#CD7F32]/10 text-lg font-bold text-[#CD7F32]">
            {podium[2].avatar}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{podium[2].username}</p>
          <p className="text-xs text-muted-foreground">{podium[2].points.toLocaleString()} NP</p>
          <Badge variant="secondary" className="mt-1 text-xs">{podium[2].badge}</Badge>
        </div>
      </div>

      {/* Your Position */}
      <div className="mb-6 rounded-lg border-2 border-[#008751] bg-[#008751]/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-muted-foreground">#42</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008751] text-sm font-bold text-[#ffffff]">
              AO
            </div>
            <div>
              <p className="font-semibold text-foreground">AdaObi_Lagos (You)</p>
              <p className="text-xs text-muted-foreground">240 NP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-[#008751]">
              <ArrowUp className="h-4 w-4" /> 5 ranks this week
            </span>
            <Badge className="bg-[#008751]/10 text-[#008751] text-xs">Bias Buster</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-[#FF6D00]" /> 7 days
            </span>
          </div>
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Rank</th>
              <th className="px-4 py-3 text-left font-medium">Reader</th>
              <th className="px-4 py-3 text-left font-medium">Badge</th>
              <th className="px-4 py-3 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardUsers.map((user) => (
              <tr key={user.rank} className="border-b border-border last:border-b-0 hover:bg-accent/50">
                <td className="px-4 py-3">
                  <span className={`font-bold ${user.rank <= 3 ? "text-[#FFD700]" : "text-muted-foreground"}`}>
                    #{user.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#008751]/10 text-xs font-bold text-[#008751]">
                      {user.avatar}
                    </div>
                    <span className="font-medium text-foreground">{user.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">{user.badge}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="flex items-center justify-end gap-1 font-medium text-foreground">
                    <Star className="h-3.5 w-3.5 text-[#FFD700]" />
                    {user.points.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How Points Work */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">How NaijaPulse Points Work</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold text-[#008751]">+5 NP</p>
            <p className="text-sm text-foreground">Read an article</p>
          </div>
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold text-[#008751]">+10 NP</p>
            <p className="text-sm text-foreground">Read opposing perspectives</p>
          </div>
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold text-[#008751]">+25 NP</p>
            <p className="text-sm text-foreground">Complete daily quiz</p>
          </div>
        </div>
      </div>
    </div>
  )
}
