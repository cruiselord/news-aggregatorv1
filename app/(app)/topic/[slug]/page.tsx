"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { topics } from "@/lib/mock-data"
import { StoryCard } from "@/components/story-card"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Story, BiasType } from "@/lib/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const subTopics: Record<string, string[]> = {
  economy: ["All", "Inflation", "Oil & Gas", "Banking", "Agriculture", "Trade"],
  politics: ["All", "Elections", "Legislation", "Governance", "Diplomacy"],
  security: ["All", "Terrorism", "Banditry", "Police Reform", "Maritime"],
  sports: ["All", "Football", "Athletics", "Basketball", "Boxing"],
  entertainment: ["All", "Nollywood", "Music", "Fashion", "Events"],
  health: ["All", "Epidemics", "Healthcare", "Pharma", "Mental Health"],
  tech: ["All", "Startups", "Fintech", "AI", "Telecom"],
}

const biasChartData = [
  { week: "W1", proGov: 30, independent: 50, opposition: 20 },
  { week: "W2", proGov: 35, independent: 45, opposition: 20 },
  { week: "W3", proGov: 28, independent: 52, opposition: 20 },
  { week: "W4", proGov: 32, independent: 48, opposition: 20 },
]

type TopicRow = {
  id: string
  name: string
  slug: string
  icon: string | null
  article_count: number | null
}

type StoryClusterRow = {
  id: string
  headline: string
  ai_summary: string | null
  image_url?: string | null
  topics: string[] | null
  is_blindspot: boolean | null
  blindspot_type: string | null
  pro_gov_coverage: number | null
  independent_coverage: number | null
  opposition_coverage: number | null
  article_count: number | null
  created_at: string
}

type SourceRow = {
  id: string
  name: string
  bias_label: string | null
}

import { classifyBias } from "@/lib/utils"

function mapClusterToStory(row: StoryClusterRow): Story {
  const biasTotal =
    (row.pro_gov_coverage ?? 0) +
      (row.independent_coverage ?? 0) +
      (row.opposition_coverage ?? 0) || 1

  const biasBreakdown = {
    proGov: Math.round(((row.pro_gov_coverage ?? 0) / biasTotal) * 100),
    independent: Math.round(
      ((row.independent_coverage ?? 0) / biasTotal) * 100
    ),
    opposition: Math.round(
      ((row.opposition_coverage ?? 0) / biasTotal) * 100
    ),
  }

  const blindspotPercent = row.is_blindspot
    ? Math.max(
        biasBreakdown.proGov,
        biasBreakdown.independent,
        biasBreakdown.opposition
      )
    : undefined

  return {
    id: row.id,
    headline: row.headline,
    summary: row.ai_summary ?? "",
    sourceCount: row.article_count ?? 0,
    readTime: "5 min",
    isBlindspot: Boolean(row.is_blindspot),
    blindspotPercent,
    blindspotSide: row.blindspot_type ?? undefined,
    thumbnail: row.image_url ?? "/placeholder-news-1.jpg",
    date: new Date(row.created_at).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    biasBreakdown,
    topic: (row.topics?.[0] ?? "politics") as string,
  }
}

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [following, setFollowing] = useState(false)
  const [activeSubTopic, setActiveSubTopic] = useState("All")

  const [topic, setTopic] = useState<TopicRow | null>(null)
  const [topicStories, setTopicStories] = useState<Story[]>([])
  const [topSources, setTopSources] = useState<
    { id: string; name: string; bias: BiasType }[]
  >([])
  // derived data
  // stories with highest source count (i.e. most debated)
  const mostDebated = [...topicStories]
    .sort((a, b) => b.sourceCount - a.sourceCount)
    .slice(0, 5)

  useEffect(() => {
    async function load() {
      const [{ data: topicRow }, { data: clusters }, { data: sourceRows }] =
        await Promise.all([
          supabase
            .from("topics")
            .select("*")
            .eq("slug", slug)
            .maybeSingle(),
          supabase
            .from("story_clusters")
            .select("*")
            .contains("topics", [slug])
            .order("created_at", { ascending: false }),
          supabase
            .from("sources")
            .select("id, name, bias_label")
            .order("name", { ascending: true }),
        ])

      if (topicRow) {
        setTopic(topicRow as TopicRow)
      }

      setTopicStories(
        (clusters ?? []).map((c) => mapClusterToStory(c as StoryClusterRow))
      )

      setTopSources(
        (sourceRows ?? []).slice(0, 5).map((s: any) => ({
          id: s.id,
          name: s.name,
          bias: classifyBias(s.bias_label),
        }))
      )
    }

    load()
  }, [slug])

  const pills = subTopics[slug] || subTopics.politics

  return (
    <div className="flex gap-0">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{topic?.icon ?? "📄"}</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {topic?.name ?? slug}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {topicStories.length} stories from Nigerian sources
                </p>
              </div>
            </div>
            <Button
              onClick={() => setFollowing(!following)}
              className={following ? "bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90" : ""}
              variant={following ? "default" : "outline"}
            >
              {following ? <><Check className="mr-1 h-4 w-4" /> Following</> : "Follow This Topic"}
            </Button>
          </div>
        </div>

        {/* Sub-topic Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveSubTopic(pill)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeSubTopic === pill
                  ? "bg-[#008751] text-[#ffffff]"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Stories */}
        <div className="mt-6 flex flex-col gap-4">
          {topicStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        {/* Most Debated */}
        {mostDebated.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-foreground">Most Debated</h2>
            <div className="flex flex-col gap-3">
              {mostDebated.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-[300px] shrink-0 border-l border-border p-4 lg:block">
        {/* Topic Bias Chart */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topic Bias Over 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={biasChartData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="proGov" stroke="#1565C0" strokeWidth={2} dot={{ r: 3 }} name="Pro-Gov" />
              <Line type="monotone" dataKey="independent" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} name="Independent" />
              <Line type="monotone" dataKey="opposition" stroke="#B71C1C" strokeWidth={2} dot={{ r: 3 }} name="Opposition" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Sources */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Sources on {topic.name}
          </h3>
          <ul className="flex flex-col gap-2">
            {topSources.map((source, i) => (
              <li key={source.id}>
                <Link href={`/source/${source.id}`} className="flex items-center justify-between text-sm text-foreground hover:text-[#008751]">
                  <span>{i + 1}. {source.name}</span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {source.bias.replace("-", " ")}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Related Topics */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Related Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {topics.filter((t) => t.slug !== slug).slice(0, 4).map((t) => (
              <Link key={t.slug} href={`/topic/${t.slug}`}>
                <Badge variant="secondary" className="text-xs">
                  {t.icon} {t.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
