"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Star,
  BookOpen,
  Target,
  Trophy,
  Settings,
  LogOut,
  Bell,
  Flame,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const badges = [
  { name: "Bias Buster", desc: "Read 50+ articles from opposing perspectives", earned: true },
  { name: "News Hawk", desc: "7-day reading streak", earned: true },
  { name: "Fact Finder", desc: "Score 100% on 5 daily quizzes", earned: true },
  { name: "Deep Diver", desc: "Read all perspectives on 10 stories", earned: false },
  { name: "Blindspot Spotter", desc: "Discover 20 blindspot stories", earned: false },
]

const recentActivity = [
  { action: "Completed daily quiz", points: "+25 NP", time: "2 hours ago" },
  { action: "Read 3 articles on Fuel Subsidy", points: "+15 NP", time: "4 hours ago" },
  { action: "Explored a Blindspot story", points: "+10 NP", time: "Yesterday" },
  { action: "7-day streak achieved!", points: "+50 NP", time: "Yesterday" },
]

export default function ProfilePage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#008751] text-2xl font-bold text-[#ffffff]">
            AO
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">AdaObi_Lagos</h1>
            <p className="text-sm text-muted-foreground">ada.obi@example.com</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Star className="h-4 w-4 text-[#FFD700]" /> 240 NP
              </span>
              <Badge variant="secondary" className="text-xs">Rank #42</Badge>
              <Badge className="bg-[#008751]/10 text-[#008751] text-xs">Bias Buster</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-[#FF6D00]" /> 7-day streak
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth/login">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" /> Articles Read
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">127</p>
          <p className="text-xs text-muted-foreground">this month</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" /> Bias Balance
          </div>
          <p className="mt-2 text-lg font-bold text-[#2E7D32]">61% Independent</p>
          <p className="text-xs text-muted-foreground">22% Pro-Gov, 17% Opp</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" /> Quiz Score
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">82%</p>
          <p className="text-xs text-muted-foreground">average accuracy</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-[#FF6D00]" /> Best Streak
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">14</p>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Badges */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Your Badges</h2>
          <div className="flex flex-col gap-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  badge.earned
                    ? "border-[#008751]/30 bg-[#008751]/5"
                    : "border-border opacity-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    badge.earned ? "bg-[#FFD700]/20" : "bg-secondary"
                  }`}
                >
                  <Trophy
                    className={`h-5 w-5 ${
                      badge.earned ? "text-[#FFD700]" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
                {badge.earned && (
                  <Badge className="bg-[#008751] text-[#ffffff] text-xs">Earned</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">Recent Activity</h2>
            <div className="flex flex-col gap-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs font-semibold text-[#008751]"
                  >
                    {activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Level Progress
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Level 4 — News Hawk</span>
              <span className="text-muted-foreground">240 / 500 NP</span>
            </div>
            <Progress
              value={48}
              className="mt-2 h-3 bg-secondary [&>[data-slot=progress-indicator]]:bg-[#008751]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              260 more NP to reach Level 5 — Fact Finder
            </p>
          </div>

          {/* Notification Settings */}
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Settings className="h-5 w-5" /> Notification Settings
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifs" className="flex items-center gap-2 text-sm text-foreground">
                  <Bell className="h-4 w-4 text-muted-foreground" /> Daily Briefing Email
                </Label>
                <Switch
                  id="email-notifs"
                  checked={emailNotifs}
                  onCheckedChange={setEmailNotifs}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifs" className="flex items-center gap-2 text-sm text-foreground">
                  <Bell className="h-4 w-4 text-muted-foreground" /> Blindspot Alerts
                </Label>
                <Switch
                  id="push-notifs"
                  checked={pushNotifs}
                  onCheckedChange={setPushNotifs}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
