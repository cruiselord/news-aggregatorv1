import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaseClient"
import { getTrendingStories, getBlindspotStories } from "@/lib/db-queries"
import { TrendingStoriesSection } from "@/components/trending-stories-section"
import { BlindspotDetectionWidget } from "@/components/blindspot-detection-widget"
import { StoryCard } from "@/components/story-card"
import type { Story } from "@/lib/types"

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

function mapClusterToStory(
  c: StoryClusterRow,
  thumbnailByClusterId: Record<string, string> = {}
): Story {
  const biasTotal =
    (c.pro_gov_coverage ?? 0) +
      (c.independent_coverage ?? 0) +
      (c.opposition_coverage ?? 0) || 1

  const biasBreakdown = {
    proGov: Math.round(((c.pro_gov_coverage ?? 0) / biasTotal) * 100),
    independent: Math.round(((c.independent_coverage ?? 0) / biasTotal) * 100),
    opposition: Math.round(((c.opposition_coverage ?? 0) / biasTotal) * 100),
  }

  const blindspotPercent = c.is_blindspot
    ? Math.max(
        biasBreakdown.proGov,
        biasBreakdown.independent,
        biasBreakdown.opposition
      )
    : undefined

  return {
    id: c.id,
    headline: c.headline,
    summary: c.ai_summary ?? "",
    sourceCount: c.article_count ?? 0,
    readTime: "5 min",
    isBlindspot: Boolean(c.is_blindspot),
    blindspotPercent,
    blindspotSide: c.blindspot_type ?? undefined,
    thumbnail: c.image_url ?? thumbnailByClusterId[c.id] ?? "/placeholder-news-1.jpg",
    date: new Date(c.created_at).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    biasBreakdown,
    topic: (c.topics?.[0] ?? "politics") as string,
  }
}

export default async function HomePage() {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  try {
    // Fetch all story data in parallel
    const [trendingData, blindspotData, allClustersData] = await Promise.all([
      getTrendingStories(10),
      getBlindspotStories(10),
      supabase
        .from("story_clusters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
    ])

    const trendingStories = trendingData || []
    const blindspots = blindspotData || []
    const allClusters = (allClustersData.data || []) as StoryClusterRow[]
    const clusterIds = allClusters.map((c) => c.id)
    const thumbnailByClusterId: Record<string, string> = {}

    if (clusterIds.length > 0) {
      const { data: articleImages } = await supabase
        .from("articles")
        .select("cluster_id, image_url, published_at")
        .in("cluster_id", clusterIds)
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })

      for (const row of articleImages ?? []) {
        const clusterId = (row as any).cluster_id as string | null
        const imageUrl = (row as any).image_url as string | null
        if (!clusterId || !imageUrl) continue
        if (!thumbnailByClusterId[clusterId]) {
          thumbnailByClusterId[clusterId] = imageUrl
        }
      }
    }

    const allStories: Story[] = allClusters.map((cluster) =>
      mapClusterToStory(cluster, thumbnailByClusterId)
    )

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Understand Nigerian Media
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {today} • See how different outlets cover the news
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trending Section */}
              <section>
                <TrendingStoriesSection stories={trendingStories.slice(0, 5)} />
              </section>

              {/* All Stories Tab */}
              <section>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2" >
                    <TabsTrigger value="all">All Stories</TabsTrigger>
                    <TabsTrigger value="recent">Latest</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4 mt-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Showing all {allStories.length} stories
                    </div>
                    {allStories.length === 0 ? (
                      <p className="text-muted-foreground">No stories yet. Fetching RSS feeds...</p>
                    ) : (
                      allStories.map((story) => (
                        <StoryCard key={story.id} story={story} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-4 mt-4">
                    {allStories.slice(0, 10).map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </TabsContent>
                </Tabs>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Blind Spots */}
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">
                  ⚠️ Blind Spots
                </h2>
                <BlindspotDetectionWidget blindspots={blindspots} />
              </section>

              {/* Quick Stats */}
              <section className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Stories</p>
                    <p className="text-2xl font-bold text-foreground">{allStories.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trending</p>
                    <p className="text-2xl font-bold text-orange-600">{trendingStories.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Blind Spots</p>
                    <p className="text-2xl font-bold text-orange-600">{blindspots.length}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Error Loading Stories</h2>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}
