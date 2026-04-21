import Parser from 'rss-parser';
import { createServerClient } from '../supabase/server';
import { fetchFromNewsAPI } from './newsapi-fetcher';

const parser = new Parser({
  timeout: 5000,
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['description', 'description'],
    ],
  },
});

type FetchResult = {
  newArticles: number;
  rssArticles: number;
  newsapiArticles: number;
  errors: string[];
  success: boolean;
};

function stripHtml(value?: string | null): string | null {
  if (!value) return null;
  const clean = value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return clean || null;
}

function firstImageFromHtml(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function pickImageUrl(item: any): string | null {
  return (
    item?.enclosure?.url ||
    item?.mediaContent?.url ||
    item?.mediaThumbnail?.url ||
    item?.itunes?.image ||
    firstImageFromHtml(item?.contentEncoded) ||
    firstImageFromHtml(item?.content) ||
    firstImageFromHtml(item?.description) ||
    null
  );
}

function pickArticleText(item: any): string | null {
  const best =
    stripHtml(item?.contentEncoded) ||
    stripHtml(item?.content) ||
    stripHtml(item?.description) ||
    stripHtml(item?.contentSnippet) ||
    null;

  if (!best) return null;
  return best.substring(0, 5000);
}

async function fetchRSSFeeds(): Promise<{ newArticles: number; errors: string[] }> {
  const supabase = createServerClient();
  const errors: string[] = [];
  let newArticles = 0;

  // Get all active sources with RSS URLs
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .not('rss_url', 'is', null);

  if (!sources || sources.length === 0) {
    return { newArticles: 0, errors: ['No RSS sources found'] };
  }

  for (const source of sources) {
    try {
      // Wrap with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const feed = await Promise.race([
        parser.parseURL(source.rss_url!),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RSS fetch timeout')), 10000)
        ),
      ] as const);

      clearTimeout(timeoutId);
      
      for (const item of (feed as any).items?.slice(0, 20) || []) {
        if (!item.link || !item.title) continue;
        
        const { error } = await supabase.from('articles').upsert({
          source_id: source.id,
          title: item.title,
          url: item.link,
          content: pickArticleText(item),
          image_url: pickImageUrl(item),
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          bias_label: source.bias_label,
        }, { onConflict: 'url', ignoreDuplicates: true });

        if (!error) newArticles++;
      }
    } catch (err: any) {
      errors.push(`${source.name}: ${err.message}`);
    }
  }

  return { newArticles, errors };
}

export async function fetchAllFeeds(): Promise<FetchResult> {
  let totalNewArticles = 0;
  let rssCount = 0;
  let newsapiCount = 0;
  const allErrors: string[] = [];

  // 1. Fetch from RSS feeds
  console.log('[SCRAPER] Fetching RSS feeds...');
  const rssResult = await fetchRSSFeeds();
  rssCount = rssResult.newArticles;
  totalNewArticles += rssCount;
  allErrors.push(...rssResult.errors);
  console.log(`[SCRAPER] RSS: ${rssCount} articles, ${rssResult.errors.length} errors`);

  // 2. Fetch from NewsAPI (free tier)
  if (process.env.NEWS_API_KEY) {
    console.log('[SCRAPER] Fetching from NewsAPI...');
    const newsapiResult = await fetchFromNewsAPI();
    newsapiCount = newsapiResult.newArticles;
    totalNewArticles += newsapiCount;
    allErrors.push(...newsapiResult.errors);
    console.log(
      `[SCRAPER] NewsAPI: ${newsapiCount} articles, ${newsapiResult.errors.length} errors`
    );
  } else {
    console.log('[SCRAPER] NewsAPI not configured (optional)');
  }

  return {
    newArticles: totalNewArticles,
    rssArticles: rssCount,
    newsapiArticles: newsapiCount,
    errors: allErrors,
    success: totalNewArticles > 0,
  };
}
