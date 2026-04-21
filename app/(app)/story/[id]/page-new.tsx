import { supabase } from "@/lib/supabaseClient"
import { getSourcePerspectives } from "@/lib/db-queries"
import { MultiPerspectiveView } from "@/components/multi-perspective-view"
import { StoryCard } from "@/components/story-card"
import { Badge } from "@/components/ui/badge"
import { BiasBar } from "@/components/bias-bar"
import Link from "next/link"
import { ChevronRight, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

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

function mapClusterToStory(row: StoryClusterRow) {
  const biasTotal =
    (row.pro_gov_coverage ?? 0) +
    (row.independent_coverage ?? 0) +
    (row.opposition_coverage ?? 0) || 1

  const biasBreakdown = {
    proGov: Math.round(((row.pro_gov_coverage ?? 0) / biasTotal) * 100),
    independent: Math.round(((row.independent_coverage ?? 0) / biasTotal) * 100),
    opposition: Math.round(((row.opposition_coverage ?? 0) / biasTotal) * 100),
  }

  return {
    id: row.id,
    headline: row.headline,
    summary: row.ai_summary ?? "",
    sourceCount: row.article_count ?? 0,
    readTime: "5 min",
    isBlindspot: Boolean(row.is_blindspot),
    blindspotPercent: row.is_blindspot
      ? Math.max(biasBreakdown.proGov, biasBreakdown.independent, biasBreakdown.opposition)
      : undefined,
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

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch main cluster
  const { data: cluster, error } = await supabase
    .from("story_clusters")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !cluster) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground">Story not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find that story. Try going back to the home page.
        </p>
      </div>
    )
  }

  const clusterRow = cluster as StoryClusterRow
  const story = mapClusterToStory(clusterRow)

  // Fetch articles with full details including images
  const { data: articlesWithDetails } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      url,
      content,
      image_url,
      published_at,
      source:sources(
        id,
        name,
        bias_label,
        website_url,
        factuality_score
      )
    `)
    .eq("cluster_id", id)
    .order("published_at", { ascending: false })

  // Group by bias
  const perspectives = {
    proGov: (articlesWithDetails || []).filter((a: any) =>
      a.source?.bias_label?.toLowerCase().includes("pro-gov")
    ),
    independent: (articlesWithDetails || []).filter((a: any) => {
      const bias = a.source?.bias_label?.toLowerCase() || ""
      return !bias.includes("pro-gov") && !bias.includes("opposition")
    }),
    opposition: (articlesWithDetails || []).filter((a: any) =>
      a.source?.bias_label?.toLowerCase().includes("opposition")
    ),
  }

  // Fetch related stories
  const { data: relatedClusters } = await supabase
    .from("story_clusters")
    .select("*")
    .neq("id", id)
    .eq("topics", story.topic)
    .order("created_at", { ascending: false })
    .limit(3)

  const relatedStories = (relatedClusters || []).map((c) => mapClusterToStory(c as StoryClusterRow))

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate text-foreground font-medium">{story.headline.slice(0, 50)}...</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{story.sourceCount} sources</Badge>
            {story.isBlindspot && (
              <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200">
                ⚠️ Blind Spot
              </Badge>
            )}
            <Badge variant="outline">{story.topic}</Badge>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-foreground mb-4">{story.headline}</h1>

          <p className="text-muted-foreground">
            {story.date} • {story.sourceCount} outlets • {story.readTime} read
          </p>
        </div>

        {/* AI Summary */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
          <Badge className="mb-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200">
            🤖 AI Summary
          </Badge>
          <p className="text-base leading-relaxed text-foreground mb-3">{story.summary}</p>
          <p className="text-xs text-muted-foreground italic">
            This is an auto-generated summary highlighting key points across all sources and perspectives.
          </p>
        </Card>

        {/* Coverage Breakdown */}
        <Card className="mb-8 p-6 border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Media Coverage Breakdown</h2>
          <div className="space-y-4">
            <BiasBar
              proGov={story.biasBreakdown.proGov}
              independent={story.biasBreakdown.independent}
              opposition={story.biasBreakdown.opposition}
              size="lg"
              showLabels
            />
            {story.isBlindspot && (
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-200">
                    Coverage Imbalance Detected
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    This story has significant coverage from one perspective ({story.blindspotPercent}%+).
                    Read diverse viewpoints below to gain a complete understanding.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Multi-Perspective View */}
        <div className="mb-12">
          <MultiPerspectiveView perspectives={perspectives} />
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Related Stories</h2>
            <div className="space-y-4">
              {relatedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
