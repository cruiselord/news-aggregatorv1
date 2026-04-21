"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

type TrendingItem = {
  topic: string
  articleCount: number
}

type LeaderboardUser = {
  rank: number
  username: string
  points: number
  badge: string
  avatar: string
}

export function RightSidebar() {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    []
  )

  useEffect(() => {
    async function load() {
      const [{ data: clusters }, { data: profiles }] = await Promise.all([
        supabase
          .from("story_clusters")
          .select("headline, article_count")
          .order("article_count", { ascending: false })
          .limit(10),
        supabase
          .from("user_profiles")
          .select("username, naira_points, badges")
          .order("naira_points", { ascending: false })
          .limit(10),
      ])

      setTrendingItems(
        (clusters ?? []).map((c: any) => ({
          topic: c.headline,
          articleCount: c.article_count ?? 0,
        }))
      )

      const users: LeaderboardUser[] =
        (profiles ?? []).map((p: any, idx: number) => ({
          rank: idx + 1,
          username: p.username ?? `reader_${idx + 1}`,
          points: p.naira_points ?? 0,
          badge:
            (Array.isArray(p.badges) && p.badges[0]?.label) ||
            "Bias Buster",
          avatar:
            (p.username ?? "NP")
              .split("_")[0]
              .slice(0, 2)
              .toUpperCase() || "NP",
        })) ?? []

      setLeaderboardUsers(users)
    }

    load()
  }, [])

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[280px] shrink-0 overflow-y-auto border-l border-border bg-secondary p-4 xl:block">
      {/* Bias Donut */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Naija Bias
        </h3>
        <div className="flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E5E5" strokeWidth="12" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1565C0" strokeWidth="12"
              strokeDasharray="69.1 245.0" strokeDashoffset="0" className="origin-center -rotate-90" transform="rotate(-90 60 60)" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#2E7D32" strokeWidth="12"
              strokeDasharray="191.6 122.5" strokeDashoffset="-69.1" className="origin-center -rotate-90" transform="rotate(-90 60 60)" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#B71C1C" strokeWidth="12"
              strokeDasharray="53.4 260.7" strokeDashoffset="-260.7" className="origin-center -rotate-90" transform="rotate(-90 60 60)" />
            <text x="60" y="56" textAnchor="middle" className="fill-foreground text-xs font-bold">61%</text>
            <text x="60" y="70" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>Independent</text>
          </svg>
        </div>
        <div className="mt-2 flex justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#1565C0]" />22%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#2E7D32]" />61%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#B71C1C]" />17%</span>
        </div>
      </div>

      {/* Trending */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trending in Nigeria
        </h3>
        <ul className="flex flex-col gap-2">
          {trendingItems.map((item, i) => (
            <li key={item.topic}>
              <Link
                href={`/search?q=${encodeURIComponent(item.topic)}`}
                className="flex items-center justify-between text-sm text-foreground hover:text-[#008751]"
              >
                <span className="truncate">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {item.topic}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.articleCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

        {/* Top Readers */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Top Readers This Week
        </h3>
        <ul className="flex flex-col gap-2">
          {leaderboardUsers.slice(0, 3).map((user) => (
            <li key={user.username} className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#008751]/10 text-xs font-bold text-[#008751]">
                {user.avatar}
              </div>
              <span className="flex-1 truncate text-sm text-foreground">
                {user.username}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {user.points.toLocaleString()} NP
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/leaderboard"
          className="mt-3 block text-center text-xs font-medium text-[#008751] hover:underline"
        >
          View Full Leaderboard
        </Link>
      </div>

      {/* Quiz CTA */}
      <Link href="/quiz">
        <div className="mt-4 rounded-lg bg-[#008751] p-4 text-center text-[#ffffff]">
          <p className="text-sm font-bold">{"Today's Quiz"}</p>
          <p className="mt-1 text-xs text-[#ffffff]/80">
            Test your media literacy & earn points
          </p>
        </div>
      </Link>
    </aside>
  )
}
