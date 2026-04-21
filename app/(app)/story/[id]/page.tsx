import Link from "next/link"
import Image from "next/image"
import { ChevronRight, MapPin, Clock, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { Story } from "@/lib/types"
import { classifyBias } from "@/lib/utils"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { StoryCard } from "@/components/story-card"
import { MultiPerspectiveView } from "@/components/multi-perspective-view"

type StoryClusterRow = {
  id: string
  headline: string
  ai_summary: string | null
  feed_url?: string | null
  image_url?: string | null
  content?: string | null
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
  factuality_score: number | null
  region_focus: string | null
  ownership_type: string | null
  website_url: string | null
}

type ArticleWithSourceRow = {
  id: string
  title: string
  url: string
  content: string | null
  image_url: string | null
  published_at: string | null
  source_id: string | null
  bias_label: string | null
  factuality_score: number | null
  source: {
    id: string
    name: string
    bias_label: string | null
    website_url: string | null
    factuality_score: number | null
  } | null
}

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

function getHeadlineKeywords(headline: string) {
  return Array.from(
    new Set(
      headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 5)
        .slice(0, 5)
    )
  )
}

function fallbackSummaryFromArticles(
  aiSummary: string | null,
  articles: ArticleWithSourceRow[],
  clusterContent?: string | null
) {
  if (aiSummary && aiSummary.trim().length > 20) return aiSummary
  const snippets = articles
    .map((a) => (a.content ?? "").replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 60)
    .slice(0, 2)
    .map((text) => text.slice(0, 220))

  if (snippets.length === 0) {
    if (clusterContent && clusterContent.trim().length > 40) {
      return clusterContent.slice(0, 320)
    }
    return "Summary not available yet. Open the source articles below while we refresh this cluster summary."
  }
  return snippets.join(" ")
}

function clampText(value: string | null | undefined, max = 220) {
  const text = (value ?? "").replace(/\s+/g, " ").trim()
  if (!text) return ""
  return text.length > max ? `${text.slice(0, max)}...` : text
}


export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: cluster, error } = await supabase
    .from("story_clusters")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !cluster) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">Story not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t find that story in the database.
        </p>
      </div>
    )
  }

  const story = mapClusterToStory(cluster as StoryClusterRow)

  const { data: dbSources } = await supabase
    .from("sources")
    .select(
      "id, name, bias_label, factuality_score, region_focus, ownership_type, website_url"
    )

  const sources = (dbSources ?? []).map((s) => {
    const bias = classifyBias(s.bias_label)
    return {
      id: s.id,
      name: s.name,
      bias,
      factuality: s.factuality_score ?? 7,
      region: s.region_focus ?? "National",
      ownership: s.ownership_type ?? "Private",
      ownerName: "",
      url: s.website_url ?? "",
    }
  })

  let articles: ArticleWithSourceRow[] = []

  const { data: clusterArticlesData } = await supabase
    .from("articles")
    .select(
      "id,title,url,content,image_url,published_at,source_id,bias_label,factuality_score,source:sources(id,name,bias_label,website_url,factuality_score)"
    )
    .eq("cluster_id", id)
    .order("published_at", { ascending: false })
    .limit(250)

  articles = (clusterArticlesData ?? []) as ArticleWithSourceRow[]

  // Fallback: if cluster has no linked articles, try finding likely matches by headline keywords.
  if (articles.length === 0) {
    const keywords = getHeadlineKeywords(story.headline)
    if (keywords.length > 0) {
      const orClause = keywords.map((k) => `title.ilike.%${k}%`).join(",")
      const { data: fallbackArticlesData } = await supabase
        .from("articles")
        .select(
          "id,title,url,content,image_url,published_at,source_id,bias_label,factuality_score,source:sources(id,name,bias_label,website_url,factuality_score)"
        )
        .or(orClause)
        .order("published_at", { ascending: false })
        .limit(30)

      articles = (fallbackArticlesData ?? []) as ArticleWithSourceRow[]
    }
  }

  const perspectives = {
    proGov: articles.filter(
      (a) => classifyBias(a.source?.bias_label ?? a.bias_label) === "pro-gov"
    ),
    independent: articles.filter(
      (a) => classifyBias(a.source?.bias_label ?? a.bias_label) === "independent"
    ),
    opposition: articles.filter(
      (a) => classifyBias(a.source?.bias_label ?? a.bias_label) === "opposition"
    ),
  }

  const proGovCount = perspectives.proGov.length
  const independentCount = perspectives.independent.length
  const oppositionCount = perspectives.opposition.length
  const totalCoverageCount = articles.length
  const totalForPercent = totalCoverageCount || 1
  const computedBreakdown = {
    proGov: Math.round((proGovCount / totalForPercent) * 100),
    independent: Math.round((independentCount / totalForPercent) * 100),
    opposition: Math.round((oppositionCount / totalForPercent) * 100),
  }
  const effectiveBreakdown =
    totalCoverageCount > 0 ? computedBreakdown : story.biasBreakdown
  const pageSummary = fallbackSummaryFromArticles(
    cluster.ai_summary,
    articles,
    (cluster as StoryClusterRow).content ?? null
  )
  const topContentSnippet =
    articles
      .map((a) => (a.content ?? "").replace(/\s+/g, " ").trim())
      .find((text) => text.length > 80)
      ?.slice(0, 900) ??
    ((cluster as StoryClusterRow).content ?? null)
  const leadArticle =
    articles[0] ??
    ((cluster as StoryClusterRow).feed_url
      ? ({
          id: `cluster-${id}`,
          title: story.headline,
          url: (cluster as StoryClusterRow).feed_url ?? "#",
          content: (cluster as StoryClusterRow).content ?? null,
          image_url: (cluster as StoryClusterRow).image_url ?? null,
          published_at: cluster.created_at,
          source_id: null,
          bias_label: null,
          factuality_score: null,
          source: null,
        } as ArticleWithSourceRow)
      : null)
  const latestArticles = articles.slice(0, 5)

  const coverageSources = Array.from(
    new Map(
      articles
        .filter((a) => a.source?.id)
        .map((a) => [a.source?.id as string, a.source])
    ).values()
  )

  const sourceCounts = Array.from(
    articles.reduce((acc, article) => {
      const sourceName = article.source?.name ?? "Unknown Source"
      acc.set(sourceName, (acc.get(sourceName) ?? 0) + 1)
      return acc
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const { data: relatedClusters } = await supabase
    .from("story_clusters")
    .select("*")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3)

  const relatedStories: Story[] =
    relatedClusters?.map((c) => mapClusterToStory(c as StoryClusterRow)) ?? []

  return (
    <div className="flex gap-0">
      {/* Main Column */}
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-[#008751]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/topic/${story.topic}`} className="capitalize hover:text-[#008751]">{story.topic}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{story.headline.slice(0, 40)}...</span>
        </nav>

        {/* Headline */}
        <h1 className="text-2xl font-bold leading-tight text-foreground text-balance">
          {story.headline}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {story.date} · {totalCoverageCount || story.sourceCount} sources · {story.readTime} read
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total Sources</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {totalCoverageCount || story.sourceCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Pro-Gov Share</p>
            <p className="mt-1 text-lg font-semibold text-[#1565C0]">
              {effectiveBreakdown.proGov}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Independent Share</p>
            <p className="mt-1 text-lg font-semibold text-[#2E7D32]">
              {effectiveBreakdown.independent}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Opposition Share</p>
            <p className="mt-1 text-lg font-semibold text-[#B71C1C]">
              {effectiveBreakdown.opposition}%
            </p>
          </div>
        </div>

        {leadArticle && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Coverage
            </p>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
                {leadArticle.image_url ? (
                  <Image
                    src={leadArticle.image_url}
                    alt={leadArticle.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {leadArticle.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {clampText(leadArticle.content, 320) || "Full text not available for this source yet."}
                </p>
                <a
                  href={leadArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-[#008751] hover:underline"
                >
                  Read full story at {leadArticle.source?.name ?? "source"} →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="mt-6 rounded-xl bg-secondary p-5">
          <Badge className="mb-2 bg-[#008751]/10 text-[#008751] text-xs">
            NaijaPulse AI Summary
          </Badge>
          <p className="text-sm leading-relaxed text-foreground">
            {pageSummary}
          </p>
          <p className="mt-3 text-xs text-muted-foreground italic">
            AI-generated neutral summary · Not editorial opinion
          </p>
        </div>

        {/* Key Developments */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Key Developments
          </h2>
          {topContentSnippet ? (
            <p className="text-sm leading-relaxed text-foreground">{topContentSnippet}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Detailed article content is not available for this story yet. Run RSS scrape in Admin to fetch full text and images.
            </p>
          )}
        </div>

        {/* Bias Coverage Bar */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Bias Coverage
          </h2>
          <BiasBar
            proGov={effectiveBreakdown.proGov}
            independent={effectiveBreakdown.independent}
            opposition={effectiveBreakdown.opposition}
            size="lg"
            showLabels
          />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{proGovCount} pro-gov</span>
            <span>{independentCount} independent</span>
            <span>{oppositionCount} opposition</span>
            <span>{totalCoverageCount} total articles</span>
          </div>
          {story.isBlindspot && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-[#FF6D00]/10 px-3 py-2 text-sm text-[#FF6D00]">
              <span className="font-medium">Naija Blindspot: {story.blindspotPercent}%+ from one perspective</span>
            </div>
          )}
        </div>

        {/* Coverage by Bias */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Coverage by Bias</h2>
          <MultiPerspectiveView perspectives={perspectives} />
        </div>

        {latestArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-foreground">Latest Reports</h2>
            <div className="space-y-3">
              {latestArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border bg-card p-3 hover:shadow-sm"
                >
                  <p className="text-sm font-medium text-foreground">{article.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {article.source?.name ?? "Unknown Source"} ·{" "}
                    {article.published_at
                      ? new Date(article.published_at).toLocaleString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No timestamp"}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related Stories */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Related Stories</h2>
          <div className="flex flex-col gap-3">
            {relatedStories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-[300px] shrink-0 border-l border-border p-4 lg:block">
        {/* State Coverage Map */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> State Coverage
          </h3>
          <div className="flex flex-wrap gap-1">
            {["Lagos", "Abuja", "Kano", "Rivers", "Kaduna", "Oyo"].map((state) => (
              <Badge key={state} variant="secondary" className="text-xs">
                {state}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Local signal currently uses source metadata; geo-tagged article coverage coming next.
          </p>
        </div>

        {/* Publication Timeline */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Publication Timeline
          </h3>
          <ul className="flex flex-col gap-2">
            {latestArticles.length === 0 ? (
              <li className="text-xs text-muted-foreground">No publication timestamps found.</li>
            ) : (
              latestArticles.map((article) => (
                <li key={article.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">
                    {article.source?.name ?? "Unknown Source"}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Ownership Summary */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Ownership Summary
          </h3>
          <ul className="flex flex-col gap-2">
            {sourceCounts.length === 0 ? (
              <li className="text-xs text-muted-foreground">No source ownership data for this cluster yet.</li>
            ) : (
              sourceCounts.map(([sourceName, count]) => (
                <li key={sourceName} className="text-sm">
                  <span className="font-medium text-foreground">{sourceName}</span>
                  <p className="text-xs text-muted-foreground">
                    {count} article{count === 1 ? "" : "s"} in this story
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sources in Cluster
          </h3>
          <div className="flex flex-wrap gap-1">
            {coverageSources.length === 0 ? (
              <span className="text-xs text-muted-foreground">No linked sources yet.</span>
            ) : (
              coverageSources.slice(0, 12).map((source) => (
                <Badge key={source.id} variant="secondary" className="text-xs">
                  {source.name}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
