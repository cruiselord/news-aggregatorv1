"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { topics, sources } from "@/lib/mock-data"

const biasColors: Record<string, string> = {
  "pro-gov": "bg-[#1565C0]",
  independent: "bg-[#2E7D32]",
  opposition: "bg-[#B71C1C]",
}

export function LeftSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-secondary p-4 lg:block">
      <nav>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Topics
        </h3>
        <ul className="flex flex-col gap-0.5">
          {topics.map((topic) => {
            const isActive = pathname === `/topic/${topic.slug}`
            return (
              <li key={topic.slug}>
                <Link
                  href={`/topic/${topic.slug}`}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    isActive
                      ? "bg-[#008751]/10 text-[#008751]"
                      : "text-foreground"
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6 rounded-lg bg-card p-3 border border-border">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your Streak
        </h3>
        <p className="text-lg font-bold text-foreground">7 Day Streak</p>
        <Progress value={70} className="mt-2 h-1.5 bg-[#008751]/20 [&>[data-slot=progress-indicator]]:bg-[#008751]" />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Following
        </h3>
        <ul className="flex flex-col gap-1">
          {sources.slice(0, 3).map((source) => (
            <li key={source.id}>
              <Link
                href={`/source/${source.id}`}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${biasColors[source.bias]}`}
                />
                <span className="truncate">{source.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-1">
        <Link href="/my-bias" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
          My Bias Dashboard
        </Link>
        <Link href="/blindspot" className="rounded-md px-3 py-2 text-sm font-medium text-[#FF6D00] hover:bg-accent">
          Blindspot Feed
        </Link>
        <Link href="/leaderboard" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
          Leaderboard
        </Link>
        <Link href="/subscribe" className="rounded-md bg-[#008751]/10 px-3 py-2 text-sm font-medium text-[#008751] hover:bg-[#008751]/20">
          Upgrade to Pro
        </Link>
      </div>
    </aside>
  )
}
