"use client"

import { useEffect, useState } from "react"
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
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type BadgeJson = {
  code?: string
  label?: string
}

type UserProfile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  naira_points: number | null
  streak_count: number | null
  longest_streak: number | null
  last_active_date: string | null
  badges: BadgeJson[] | null
  articles_read: number | null
  quizzes_completed: number | null
  state: string | null
  lga: string | null
}

type GamificationEvent = {
  id: string
  event_type: string
  points_earned: number | null
  metadata: any
  created_at: string
}

type QuizResult = {
  id: string
  score: number
  total_questions: number
}

type UserRead = {
  bias_label: string | null
  factuality_score: number | null
}

type RecentActivityItem = {
  action: string
  points: string
  time: string
}

function formatDateTime(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ProfilePage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [articlesRead, setArticlesRead] = useState(0)
  const [biasStats, setBiasStats] = useState({
    independent: 0,
    proGov: 0,
    opposition: 0,
  })
  const [avgQuizAccuracy, setAvgQuizAccuracy] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1) Determine signed-in user; if none, stop and show login CTA
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user ?? null

        if (!user) {
          setLoading(false)
          setProfile(null)
          return
        }

        // 2) Load profile for authenticated user
        const { data: prof, error: profError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profError || !prof) {
          setLoading(false)
          return
        }

        setProfile(prof as UserProfile)

        const userId = prof.id

        // 2) Parallel fetch: reads, events, quiz results
        const [{ data: reads }, { data: events }, { data: quizzes }] =
          await Promise.all([
            supabase
              .from("user_article_reads")
              .select("bias_label, factuality_score")
              .eq("user_id", userId),
            supabase
              .from("gamification_events")
              .select("*")
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("quiz_results")
              .select("*")
              .eq("user_id", userId)
              .order("quiz_date", { ascending: false })
              .limit(10),
          ])

        // Articles read
        const totalReads = reads?.length ?? 0
        setArticlesRead(prof.articles_read ?? totalReads)

        // Bias breakdown
        if (reads && reads.length > 0) {
          let pro = 0
          let indep = 0
          let opp = 0

          for (const r of reads as UserRead[]) {
            const label = (r.bias_label ?? "").toLowerCase()
            if (label.includes("pro-federal") || label.includes("pro-gov")) pro++
            else if (label.includes("opposition")) opp++
            else indep++
          }

          const total = pro + indep + opp || 1
          setBiasStats({
            independent: Math.round((indep / total) * 100),
            proGov: Math.round((pro / total) * 100),
            opposition: Math.round((opp / total) * 100),
          })
        }

        // Recent activity from gamification events
        if (events && events.length > 0) {
          const mapped: RecentActivityItem[] = (events as GamificationEvent[]).map(
            (e) => ({
              action:
                e.event_type === "article_read"
                  ? "Read an article"
                  : e.event_type === "article_read_opposing_view"
                  ? "Read opposing perspective"
                  : e.event_type === "quiz_completed"
                  ? "Completed daily quiz"
                  : e.event_type,
              points: `+${e.points_earned ?? 0} NP`,
              time: formatDateTime(e.created_at),
            })
          )
          setRecentActivity(mapped)
        }

        // Quiz accuracy
        if (quizzes && quizzes.length > 0) {
          let correct = 0
          let totalQs = 0
          for (const q of quizzes as QuizResult[]) {
            correct += q.score
            totalQs += q.total_questions
          }
          if (totalQs > 0) {
            setAvgQuizAccuracy(Math.round((correct / totalQs) * 100))
          }
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const displayName =
    profile?.display_name || profile?.username || "Guest Reader"
  const username = profile?.username || "naija_reader"
  const email = "adegoke@example.com"
  const points = profile?.naira_points ?? 0
  const streak = profile?.streak_count ?? 0
  const bestStreak = profile?.longest_streak ?? streak
  const primaryBadge =
    profile?.badges && profile.badges.length > 0
      ? profile.badges[0].label ?? profile.badges[0].code ?? "Bias Buster"
      : "Bias Buster"

  const level = points >= 4000 ? 4 : 1
  const nextLevelTarget = 500 * (level + 1)
  const levelProgress = Math.min(
    100,
    Math.round((points / nextLevelTarget) * 100)
  )

  return (
    <div className="p-6">
      {!loading && !profile && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">You are not signed in</h2>
          <p className="text-sm text-muted-foreground mb-4">Please sign in to view your profile and personalized stats.</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/signup">Create account</Link>
            </Button>
          </div>
        </div>
      )}
      {/* Profile Header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#008751] text-2xl font-bold text-[#ffffff]">
            {displayName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{username}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                <Star className="h-4 w-4 text-[#FFD700]" /> {points} NP
              </span>
              <Badge variant="secondary" className="text-xs">
                Level {level}
              </Badge>
              <Badge className="bg-[#008751]/10 text-[#008751] text-xs">
                {primaryBadge}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-[#FF6D00]" /> {streak}-day streak
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
          <p className="mt-2 text-3xl font-bold text-foreground">
            {articlesRead}
          </p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" /> Bias Balance
          </div>
          <p className="mt-2 text-lg font-bold text-[#2E7D32]">
            {biasStats.independent}% Independent
          </p>
          <p className="text-xs text-muted-foreground">
            {biasStats.proGov}% Pro-Gov, {biasStats.opposition}% Opp
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" /> Quiz Score
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {avgQuizAccuracy}%
          </p>
          <p className="text-xs text-muted-foreground">average accuracy</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-[#FF6D00]" /> Best Streak
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {bestStreak}
          </p>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Badges */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Your Badges</h2>
          <div className="flex flex-col gap-3">
            {(profile?.badges as BadgeJson[] | null)?.length
              ? profile!.badges!.map((badge) => (
                  <div
                    key={badge.code ?? badge.label}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      true
                        ? "border-[#008751]/30 bg-[#008751]/5"
                        : "border-border opacity-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFD700]/20">
                      <Trophy className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {badge.label ?? badge.code}
                      </p>
                    </div>
                    <Badge className="bg-[#008751] text-[#ffffff] text-xs">
                      Earned
                    </Badge>
                  </div>
                ))
              : !loading && (
                  <p className="text-sm text-muted-foreground">
                    No badges yet. Start reading to earn your first badge.
                  </p>
                )}
          </div>
        </div>

        {/* Recent Activity + Level + Notifications */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-3">
              {recentActivity.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">
                  No recent activity yet.
                </p>
              )}
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
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
              <span className="font-medium text-foreground">
                Level {level} — News Hawk
              </span>
              <span className="text-muted-foreground">
                {points} / {nextLevelTarget} NP
              </span>
            </div>
            <Progress
              value={levelProgress}
              className="mt-2 h-3 bg-secondary [&>[data-slot=progress-indicator]]:bg-[#008751]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {Math.max(nextLevelTarget - points, 0)} more NP to reach the next
              level.
            </p>
          </div>

          {/* Notification Settings */}
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Settings className="h-5 w-5" /> Notification Settings
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="email-notifs"
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" /> Daily
                  Briefing Email
                </Label>
                <Switch
                  id="email-notifs"
                  checked={emailNotifs}
                  onCheckedChange={setEmailNotifs}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="push-notifs"
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" /> Blindspot
                  Alerts
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
