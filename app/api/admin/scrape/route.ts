import { NextResponse } from "next/server"
import { fetchAllFeeds } from "@/src/lib/scraper/rss-fetcher"
import { clusterArticlesAdvanced } from "@/src/lib/scraper/advanced-clusterer"
import { supabase } from "@/lib/supabaseClient"
import { trendingStoriesCache, blindspotCache } from "@/lib/cache"

// POST /api/admin/scrape
export async function POST() {
  try {
    const startTime = Date.now()

    // 1. Fetch new articles from RSS + NewsAPI
    const result = await fetchAllFeeds()
    console.log(`[ADMIN SCRAPE] Fetched ${result.newArticles} articles (RSS: ${result.rssArticles}, NewsAPI: ${result.newsapiArticles})`)

    if (!result.success && result.newArticles === 0) {
      return NextResponse.json(
        {
          success: false,
          newArticles: 0,
          errors: result.errors,
          message: "Failed to fetch articles from any source",
        },
        { status: 400 }
      )
    }

    // 2. Cluster unclustered articles
    let clusterCount = 0
    let unclusteredCount = 0
    try {
      const { data: unclusteredArticles, error: fetchError } = await supabase
        .from("articles")
        .select("id, title, ai_summary, content")
        .is("cluster_id", null)
        .order("published_at", { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError

      unclusteredCount = unclusteredArticles?.length ?? 0
      if (unclusteredArticles && unclusteredArticles.length > 0) {
        console.log(
          `[ADMIN SCRAPE] Clustering ${unclusteredCount} articles...`
        )
        const clusters = await clusterArticlesAdvanced(unclusteredArticles, false)
        clusterCount = clusters.length
        console.log(`[ADMIN SCRAPE] Created ${clusterCount} clusters`)
      }
    } catch (clusterError) {
      console.error("[ADMIN SCRAPE] Clustering error:", clusterError)
      // Continue even if clustering fails - still got new articles
    }

    // 3. Clear caches to ensure fresh data
    try {
      trendingStoriesCache.clear()
      blindspotCache.clear()
      console.log("[ADMIN SCRAPE] Caches cleared")
    } catch (cacheError) {
      console.error("[ADMIN SCRAPE] Cache clear error:", cacheError)
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      newArticles: result.newArticles,
      breakdown: {
        rss: result.rssArticles,
        newsapi: result.newsapiArticles,
      },
      articlesClustered: unclusteredCount,
      clustersCreated: clusterCount,
      cacheCleared: true,
      errors: result.errors,
      duration,
      message: `✅ Scraped ${result.newArticles} articles (RSS: ${result.rssArticles}, NewsAPI: ${result.newsapiArticles}) and created ${clusterCount} clusters in ${duration}ms`,
    })
  } catch (error) {
    console.error("[ADMIN SCRAPE] Error:", error)
    return NextResponse.json(
      {
        success: false,
        newArticles: 0,
        errors: [String(error)],
        message: "Scrape operation failed",
      },
      { status: 500 }
    )
  }
}
