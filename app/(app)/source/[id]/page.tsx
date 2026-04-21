 "use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ExternalLink, Users } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StoryCard } from "@/components/story-card"
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

const biasColors: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  "pro-gov": { bg: "bg-[#1565C0]/10", text: "text-[#1565C0]", label: "Pro-Government", dot: "bg-[#1565C0]" },
  independent: { bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]", label: "Independent", dot: "bg-[#2E7D32]" },
  opposition: { bg: "bg-[#B71C1C]/10", text: "text-[#B71C1C]", label: "Opposition", dot: "bg-[#B71C1C]" },
}

const biasHistoryData = [
  { month: "Sep", score: 45 },
  { month: "Oct", score: 48 },
  { month: "Nov", score: 42 },
  { month: "Dec", score: 50 },
  { month: "Jan", score: 47 },
  { month: "Feb", score: 46 },
]

type SourceRow = {
  id: string
  name: string
  bias_label: string | null
  factuality_score: number | null
  region_focus: string | null
  ownership_type: string | null
  website_url: string | null
  description?: string | null
  founded?: string | null
}

type ArticleRow = {
  id: string
  cluster_id: string | null
}

type StoryClusterRow = {
  id: string
  headline: string
  ai_summary: string | null
  topics: string[] | null
  is_blindspot: boolean | null
  blindspot_type: string | null
  pro_gov_coverage: number | null
  independent_coverage: number | null
  opposition_coverage: number | null
  article_count: number | null
  created_at: string
}

import type { Story, BiasType } from "@/lib/types"

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
    thumbnail: "/placeholder-news-1.jpg",
    date: new Date(row.created_at).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    biasBreakdown,
    topic: (row.topics?.[0] ?? "politics") as string,
  }
}

export default function SourceProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [following, setFollowing] = useState(false)
  const [source, setSource] = useState<
    (SourceRow & { bias: BiasType; followers: number; foundedLabel: string; ownerName: string }) | null
  >(null)
  const [comparisons, setComparisons] = useState<
    { id: string; name: string; bias: BiasType; factuality: number }[]
  >([])
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase
        .from("sources")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (!s) return

      const bias = classifyBias((s as any).bias_label)

      setSource({
        ...(s as any),
        bias,
        followers: 10000,
        foundedLabel: (s as any).founded ?? "—",
        ownerName: (s as any).owner_name ?? "",
      })

      const { data: otherSources } = await supabase
        .from("sources")
        .select("id, name, bias_label, factuality_score")
        .neq("id", id)

      setComparisons(
        (otherSources ?? [])
          .filter(
            (row: any) =>
              classifyBias(row.bias_label) === bias
          )
          .slice(0, 2)
          .map((row: any) => ({
            id: row.id,
            name: row.name,
            bias: classifyBias(row.bias_label),
            factuality: row.factuality_score ?? 7,
          }))
      )

      const { data: articleRows } = await supabase
        .from("articles")
        .select("id, cluster_id")
        .eq("source_id", id)
        .order("published_at", { ascending: false })
        .limit(5)

      const clusterIds = (articleRows ?? [])
        .map((a: any) => a.cluster_id)
        .filter(Boolean)

      if (clusterIds.length > 0) {
        const { data: clusterRows } = await supabase
          .from("story_clusters")
          .select("*")
          .in("id", clusterIds as string[])

        setStories(
          (clusterRows ?? []).map((c) =>
            mapClusterToStory(c as StoryClusterRow)
          )
        )
      }
    }

    load()
  }, [id])

  if (!source) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">Source not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find that news outlet in the database.
        </p>
      </div>
    )
  }

  const biasStyle = biasColors[source.bias]

  return (
    <div className="flex gap-0">
      {/* Main Column */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${biasStyle.bg} text-2xl font-bold ${biasStyle.text}`}>
              {source.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{source.name}</h1>
              <a href={source.website_url ?? "#"} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-sm text-[#008751] hover:underline">
                {source.website_url ?? "Visit website"} <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={`${biasStyle.bg} ${biasStyle.text} text-xs`}>
                  Bias: {biasStyle.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Factuality: {source.factuality_score ?? 7}/10
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Region: {source.region_focus ?? "National"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Ownership: {source.ownership_type ?? "Private"}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  onClick={() => setFollowing(!following)}
                  variant={following ? "default" : "outline"}
                  size="sm"
                  className={following ? "bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90" : ""}
                >
                  {following ? "Following" : "Follow this source"}
                </Button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {source.followers.toLocaleString()} followers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-bold text-foreground">About</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Founded in {source.foundedLabel}. {source.description ?? ""}
          </p>
        </div>

        {/* Ownership Card */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ownership
          </h2>
          <p className="text-sm text-foreground">
            <span className="font-medium">{source.ownership_type ?? "Private"}</span> — {source.ownerName}
          </p>
        </div>

        {/* Bias Track Record */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-foreground">Bias Track Record (6 Months)</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={biasHistoryData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#008751" strokeWidth={2} dot={{ r: 3 }} name="Bias Score" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Consistency score: Higher means more consistent editorial lean
            </p>
          </div>
        </div>

        {/* Recent Stories */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Recent Stories</h2>
          <div className="flex flex-col gap-3">
            {stories.slice(0, 5).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-[340px] shrink-0 border-l border-border p-4 lg:block">
        {/* Factuality Gauge */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Factuality Score
          </h3>
          <div className="flex flex-col items-center">
            <svg width="160" height="100" viewBox="0 0 160 100">
              <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#E5E5E5" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#B71C1C" strokeWidth="12" strokeLinecap="round" strokeDasharray="60 189" />
              <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#FFD700" strokeWidth="12" strokeLinecap="round" strokeDasharray="123 189" strokeDashoffset="-60" />
              <path d="M 20 90 A 60 60 0 0 1 140 90" fill="none" stroke="#2E7D32" strokeWidth="12" strokeLinecap="round" strokeDasharray="189 189" strokeDashoffset="-123" />
              {/* Needle */}
              <line
                x1="80"
                y1="90"
                x2={80 + 45 * Math.cos(Math.PI - (source.factuality / 10) * Math.PI)}
                y2={90 - 45 * Math.sin(Math.PI - (source.factuality / 10) * Math.PI)}
                stroke="#171717"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="80" cy="90" r="4" fill="#171717" />
              <text x="80" y="80" textAnchor="middle" className="fill-foreground text-lg font-bold">{source.factuality}</text>
            </svg>
            <p className="mt-1 text-xs text-muted-foreground">out of 10</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Source Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Source</th>
                  <th className="pb-2 text-left font-medium">Bias</th>
                  <th className="pb-2 text-right font-medium">Fact.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-[#008751]/5">
                  <td className="py-2 font-medium text-foreground">{source.name}</td>
                  <td className="py-2 capitalize text-foreground">
                    {biasStyle.label}
                  </td>
                  <td className="py-2 text-right text-foreground">
                    {source.factuality_score ?? 7}
                  </td>
                </tr>
                {comparisons.map((comp) => (
                  <tr key={comp.id} className="border-b border-border">
                    <td className="py-2">
                      <Link href={`/source/${comp.id}`} className="text-foreground hover:text-[#008751]">{comp.name}</Link>
                    </td>
                    <td className="py-2 capitalize text-muted-foreground">{comp.bias.replace("-", " ")}</td>
                    <td className="py-2 text-right text-muted-foreground">{comp.factuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reader Trust */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reader Trust
          </h3>
          <p className="text-2xl font-bold text-foreground">78%</p>
          <p className="text-xs text-muted-foreground">of NaijaPulse readers trust this source</p>
        </div>

        {/* Related Outlets */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Related Outlets
          </h3>
          <div className="flex flex-col gap-2">
            {sources.filter((s) => s.id !== source.id).slice(0, 3).map((s) => (
              <Link key={s.id} href={`/source/${s.id}`} className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${biasColors[s.bias].bg} text-xs font-bold ${biasColors[s.bias].text}`}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <span className="font-medium text-foreground">{s.name}</span>
                  <p className="text-xs text-muted-foreground capitalize">{s.bias.replace("-", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
