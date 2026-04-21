import { createServerClient } from '../supabase/server';

/**
 * NewsAPI.org free tier fetcher
 * Free tier: 100 requests/day, 250 articles per request
 * Supports Nigeria-focused queries
 */

type NewsAPIArticle = {
  source: { id: string; name: string };
  author?: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
};

type NewsAPIResponse = {
  status: 'ok' | 'error';
  articles: NewsAPIArticle[];
  totalResults?: number;
};

const NEWS_API_BASE = 'https://newsapi.org/v2';

/**
 * Get NewsAPI key - lazy loaded to ensure env vars are available
 */
function getNewsAPIKey(): string | null {
  const key = process.env.NEXT_PUBLIC_NEWS_API_KEY || process.env.NEWS_API_KEY;
  return key || null;
}

/**
 * Queries to fetch Nigeria-focused news
 * These are optimized for Nigerian news coverage
 */
const SEARCHES = [
  { q: 'Nigeria politics', language: 'en', country: 'ng' },
  { q: 'Lagos economy business', language: 'en', country: 'ng' },
  { q: 'Nigeria security naija', language: 'en', country: 'ng' },
  { q: 'Tinubu government', language: 'en', country: 'ng' },
  { q: 'Nigerian election', language: 'en', country: 'ng' },
];

function stripHtml(value?: string | null): string | null {
  if (!value) return null;
  const clean = value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return clean || null;
}

function determineBias(sourceName: string): string {
  // Map NewsAPI sources to bias labels based on known outlets
  const proGovSources = ['ThisDay', 'channelstv', 'nigeriannewsecho'];
  const oppositionSources = ['Premium Times', 'BusinessDay', 'Punch'];
  const internationalSources = ['BBC', 'CNN', 'Reuters', 'Associated Press'];

  const name = sourceName.toLowerCase();

  if (internationalSources.some(s => name.includes(s.toLowerCase()))) {
    return 'International';
  }
  if (proGovSources.some(s => name.includes(s.toLowerCase()))) {
    return 'Pro-Federal-Government';
  }
  if (oppositionSources.some(s => name.includes(s.toLowerCase()))) {
    return 'Opposition-Leaning';
  }

  return 'Independent';
}

export async function fetchFromNewsAPI(): Promise<{ newArticles: number; errors: string[] }> {
  if (!NEWS_API_KEY) {
    return {
      newArticles: 0,
      errors: ['NEWS_API_KEY not configured. Get free key at newsapi.org'],
    };
  }

  const supabase = createServerClient();
  const errors: string[] = [];
  let newArticles = 0;

  // Check API rate limit (100 requests/day free tier)
  // Each search = 1 request, so max 5 searches per day to be safe
  const today = new Date().toISOString().split('T')[0];
  const { data: logData } = await supabase
    .from('api_logs')
    .select('id')
    .eq('api_name', 'newsapi')
    .gte('created_at', `${today}T00:00:00`)
    .limit(1);

  if ((logData?.length ?? 0) > 0) {
    // Already ran today, skip to avoid rate limit
    return {
      newArticles: 0,
      errors: ['NewsAPI already run today (rate limit: 1x/day)'],
    };
  }

  try {
    // Fetch from each search query
    for (const search of SEARCHES) {
      try {
        const params = new URLSearchParams({
          q: search.q,
          language: search.language,
          country: search.country,
          apiKey: NEWS_API_KEY,
          pageSize: '50', // Max 50 per call
          sortBy: 'publishedAt',
        });

        const response = await fetch(`${NEWS_API_BASE}/everything?${params.toString()}`, {
          headers: { 'User-Agent': 'NaijaPulse/1.0' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `NewsAPI error: ${errorData.message || response.statusText}`
          );
        }

        const data: NewsAPIResponse = await response.json();

        if (data.status !== 'ok') {
          throw new Error(`API returned error: ${data.articles}`);
        }

        // Process articles
        for (const article of data.articles || []) {
          try {
            // Skip if no URL or title
            if (!article.url || !article.title) continue;

            // Get or create source
            const sourceName = article.source.name || 'Unknown Source';
            const { data: existingSource } = await supabase
              .from('sources')
              .select('id')
              .eq('name', sourceName)
              .single();

            let sourceId = existingSource?.id;

            if (!sourceId) {
              // Create new source
              const bias = determineBias(sourceName);
              const { data: newSource, error: createError } = await supabase
                .from('sources')
                .insert({
                  name: sourceName,
                  website_url: new URL(article.url).origin,
                  rss_url: null,
                  bias_label: bias,
                  factuality_score: 0.75, // Default for new sources
                  ownership_type: 'Independent',
                  region_focus: 'Nigeria',
                  is_active: true,
                })
                .select('id')
                .single();

              if (createError) {
                console.error(`Failed to create source ${sourceName}:`, createError);
                continue;
              }

              sourceId = newSource?.id;
            }

            if (!sourceId) continue;

            // Insert article
            const content = stripHtml(
              article.content || article.description
            );

            const { error } = await supabase
              .from('articles')
              .upsert(
                {
                  source_id: sourceId,
                  title: article.title,
                  url: article.url,
                  content: content ? content.substring(0, 5000) : null,
                  image_url: article.urlToImage || null,
                  published_at: article.publishedAt,
                  bias_label: determineBias(sourceName),
                },
                { onConflict: 'url', ignoreDuplicates: true }
              );

            if (!error) {
              newArticles++;
            }
          } catch (articleError: any) {
            console.error('Error processing article:', articleError.message);
          }
        }

        // Log this API call
        await supabase.from('api_logs').insert({
          api_name: 'newsapi',
          endpoint: search.q,
          articles_fetched: data.articles?.length || 0,
          status: 'success',
        });

        // Add small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (searchError: any) {
        errors.push(`NewsAPI search "${search.q}": ${searchError.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`NewsAPI fatal error: ${error.message}`);
  }

  return { newArticles, errors };
}
