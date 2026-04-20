import { createClient } from '@supabase/supabase-js';
import { trendingStoriesCache, blindspotCache, userStatsCache, recordCacheHit, recordCacheMiss } from './cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get articles for a specific story cluster with full details
 */
export async function getClusterArticles(clusterId: string) {
  const { data, error } = await supabase
    .from('articles')
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
        factuality_score,
        region_focus,
        ownership_type
      )
    `)
    .eq('cluster_id', clusterId)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get top trending stories (most covered in last 24h) - with caching
 */
export async function getTrendingStories(limit = 10) {
  const cacheKey = `trending:${limit}`;
  
  // Try cache first
  const cached = trendingStoriesCache.get(cacheKey);
  if (cached) {
    // Validate cached IDs still exist (re-cluster may replace cluster IDs)
    const cachedIds = (cached as any[]).map((s) => s.id).filter(Boolean);
    if (cachedIds.length > 0) {
      const { data: existingIds } = await supabase
        .from('story_clusters')
        .select('id')
        .in('id', cachedIds);
      const liveIdSet = new Set((existingIds || []).map((r: any) => r.id));
      const validCached = (cached as any[]).filter((s) => liveIdSet.has(s.id));
      if (validCached.length > 0) {
        recordCacheHit('trending');
        return validCached.slice(0, limit);
      }
    }
  }

  recordCacheMiss('trending');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('story_clusters')
    .select(`
      id,
      headline,
      ai_summary,
      topics,
      article_count,
      pro_gov_coverage,
      independent_coverage,
      opposition_coverage,
      created_at
    `)
    .gte('created_at', yesterday)
    .order('article_count', { ascending: false })
    .limit(limit);

  if (error) throw error;

  let result = data || [];

  // If no recent clusters in last 24h, fallback to latest clusters.
  if (result.length === 0) {
    const fallback = await supabase
      .from('story_clusters')
      .select(`
        id,
        headline,
        ai_summary,
        topics,
        article_count,
        pro_gov_coverage,
        independent_coverage,
        opposition_coverage,
        created_at
      `)
      .gt('article_count', 0)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!fallback.error) {
      result = fallback.data || [];
    }
  }

  // Ensure all returned clusters have linked articles.
  const resultIds = result.map((row: any) => row.id);
  if (resultIds.length > 0) {
    const { data: linkedArticles } = await supabase
      .from('articles')
      .select('cluster_id')
      .in('cluster_id', resultIds)
      .not('cluster_id', 'is', null);
    const linkedSet = new Set((linkedArticles || []).map((r: any) => r.cluster_id));
    result = result.filter((row: any) => linkedSet.has(row.id));
  }

  trendingStoriesCache.set(cacheKey, result, 600); // Cache 10 min
  return result.slice(0, limit);
}

/**
 * Get blind spot stories (stories with <25% coverage or heavily one-sided) - with caching
 */
export async function getBlindspotStories(limit = 10) {
  const cacheKey = `blindspot:${limit}`;
  
  // Try cache first
  const cached = blindspotCache.get(cacheKey);
  if (cached) {
    recordCacheHit('blindspot');
    return cached;
  }

  recordCacheMiss('blindspot');
  
  const { data, error } = await supabase
    .from('story_clusters')
    .select(`
      id,
      headline,
      ai_summary,
      topics,
      article_count,
      pro_gov_coverage,
      independent_coverage,
      opposition_coverage,
      is_blindspot,
      blindspot_type,
      created_at
    `)
    .eq('is_blindspot', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  const result = data || [];
  blindspotCache.set(cacheKey, result, 3600); // Cache for 1 hour
  return result;
}

/**
 * Get stories covered by specific bias types
 */
export async function getStoriesByBias(bias: 'pro-gov' | 'independent' | 'opposition', limit = 10) {
  let query = supabase
    .from('story_clusters')
    .select(`
      id,
      headline,
      ai_summary,
      topics,
      article_count,
      pro_gov_coverage,
      independent_coverage,
      opposition_coverage,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter by bias representation
  if (bias === 'pro-gov') {
    query = query.gt('pro_gov_coverage', 0);
  } else if (bias === 'independent') {
    query = query.gt('independent_coverage', 0);
  } else if (bias === 'opposition') {
    query = query.gt('opposition_coverage', 0);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get user's reading statistics for media diet tracker
 */
export async function getUserReadingStats(userId: string, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('user_reading_history')
    .select(`
      id,
      article:articles(
        id,
        source:sources(
          id,
          name,
          bias_label
        )
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate);

  if (error) throw error;

  // Calculate bias distribution
  const stats = {
    proGov: 0,
    independent: 0,
    opposition: 0,
    sourcesRead: new Set<string>(),
    totalArticles: data?.length || 0,
  };

  data?.forEach((item: any) => {
    const bias = item.article?.source?.bias_label?.toLowerCase() || '';
    if (bias.includes('pro-gov') || bias.includes('government')) {
      stats.proGov++;
    } else if (bias.includes('opposition')) {
      stats.opposition++;
    } else {
      stats.independent++;
    }
    if (item.article?.source?.id) {
      stats.sourcesRead.add(item.article.source.id);
    }
  });

  return {
    ...stats,
    sourcesReadCount: stats.sourcesRead.size,
    percentages: {
      proGov: stats.totalArticles ? Math.round((stats.proGov / stats.totalArticles) * 100) : 0,
      independent: stats.totalArticles ? Math.round((stats.independent / stats.totalArticles) * 100) : 0,
      opposition: stats.totalArticles ? Math.round((stats.opposition / stats.totalArticles) * 100) : 0,
    },
  };
}

/**
 * Get headlines from different sources for the same story
 */
export async function getSourcePerspectives(clusterId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      content,
      url,
      published_at,
      image_url,
      source:sources(
        id,
        name,
        bias_label,
        website_url,
        factuality_score
      )
    `)
    .eq('cluster_id', clusterId)
    .order('source(bias_label)', { ascending: true });

  if (error) throw error;

  // Group by bias
  const perspectives = {
    proGov: (data || []).filter((a: any) => a.source?.bias_label?.includes('pro-gov')),
    independent: (data || []).filter((a: any) => !a.source?.bias_label?.includes('pro-gov') && !a.source?.bias_label?.includes('opposition')),
    opposition: (data || []).filter((a: any) => a.source?.bias_label?.includes('opposition')),
  };

  return perspectives;
}

/**
 * Get topics with coverage stats
 */
export async function getTopicsInsights(limit = 10) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      id,
      name,
      slug,
      story_clusters:story_clusters(id)
    `)
    .order('story_clusters', { referencedTable: 'story_clusters', count: 'desc' })
    .limit(limit);

  if (error) throw error;

  return data?.map((topic: any) => ({
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    storyCount: topic.story_clusters?.length || 0,
  })) || [];
}

/**
 * Get source statistics
 */
export async function getSourceStats() {
  const { data, error } = await supabase
    .from('sources')
    .select(`
      id,
      name,
      bias_label,
      factuality_score,
      articles:articles(id)
    `)
    .order('articles', { referencedTable: 'articles', count: 'desc' });

  if (error) throw error;

  return data?.map((source: any) => ({
    id: source.id,
    name: source.name,
    bias: source.bias_label,
    factuality: source.factuality_score,
    articleCount: source.articles?.length || 0,
  })) || [];
}

/**
 * Get most cited sources used in current cluster
 */
export async function getClusterSourceBreakdown(clusterId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      source_id,
      source:sources(
        id,
        name,
        bias_label,
        factuality_score
      )
    `)
    .eq('cluster_id', clusterId);

  if (error) throw error;

  const sourceMap = new Map<string, any>();
  data?.forEach((article: any) => {
    const sourceId = article.source_id;
    if (!sourceMap.has(sourceId)) {
      sourceMap.set(sourceId, { ...article.source, count: 0 });
    }
    sourceMap.get(sourceId).count++;
  });

  return Array.from(sourceMap.values());
}
