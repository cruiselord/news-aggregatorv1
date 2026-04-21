import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/src/lib/scraper/rss-fetcher";
import { clusterArticlesAdvanced } from "@/src/lib/scraper/advanced-clusterer";
import { supabase } from "@/lib/supabaseClient";
import { trendingStoriesCache, blindspotCache } from "@/lib/cache";

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized - CRON_SECRET not set or invalid" },
      { status: 401 }
    );
  }

  try {
    console.log("[CRON] Starting article scrape...");
    const startTime = Date.now();

    // 1. Fetch new articles from RSS + NewsAPI
    const fetchResult = await fetchAllFeeds();
    console.log(
      `[CRON] Fetched: ${fetchResult.newArticles} articles (RSS: ${fetchResult.rssArticles}, NewsAPI: ${fetchResult.newsapiArticles}), Errors: ${fetchResult.errors.length}`
    );

    if (fetchResult.newArticles === 0) {
      return NextResponse.json({
        status: "no_new_articles",
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      });
    }

    // 2. Get unclustered articles for clustering
    const { data: unclusteredArticles, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, ai_summary, content")
      .is("cluster_id", null)
      .order("published_at", { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    let clusterCount = 0;
    if (unclusteredArticles && unclusteredArticles.length > 0) {
      console.log(
        `[CRON] Clustering ${unclusteredArticles.length} unclustered articles...`
      );

      // Cluster without Gemini refinement to save costs (faster too)
      try {
        const clusters = await clusterArticlesAdvanced(
          unclusteredArticles,
          false
        );
        clusterCount = clusters.length;
        console.log(`[CRON] Created ${clusters.length} clusters`);
      } catch (clusterError) {
        console.error("[CRON] Clustering error (non-fatal):", clusterError);
        // Continue even if clustering fails
      }
    }

    // 3. Clear caches to ensure fresh data on next request
    console.log("[CRON] Clearing caches...");
    try {
      trendingStoriesCache.clear();
      blindspotCache.clear();
      console.log("[CRON] Caches cleared successfully");
    } catch (cacheError) {
      console.error("[CRON] Cache clear error:", cacheError);
    }

    // 4. Update last scrape timestamp in a settings table or metadata
    // (optional: could store in DB for dashboard visibility)

    const duration = Date.now() - startTime;
    console.log(`[CRON] ✅ Complete in ${duration}ms`);

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      metrics: {
        articlesAdded: fetchResult.newArticles,
        breakdown: {
          rss: fetchResult.rssArticles,
          newsapi: fetchResult.newsapiArticles,
        },
        articlesClustered: unclusteredArticles?.length ?? 0,
        clustersCreated: clusterCount,
        cacheCleared: true,
      },
      duration,
      errors: fetchResult.errors,
    });
  } catch (error) {
    console.error("[CRON] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Scrape failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
