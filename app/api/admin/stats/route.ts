import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCacheStats } from '@/lib/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/stats
export async function GET() {
  try {
    // Get total articles count
    const { count: articlesCount, error: articlesError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (articlesError) throw articlesError;

    // Get total clusters count
    const { count: clustersCount, error: clustersError } = await supabase
      .from('story_clusters')
      .select('*', { count: 'exact', head: true });

    if (clustersError) throw clustersError;

    // Get blindspots count
    const { count: blindspotsCount, error: blindspotsError } = await supabase
      .from('story_clusters')
      .select('*', { count: 'exact', head: true })
      .eq('is_blindspot', true);

    if (blindspotsError) throw blindspotsError;

    // Get sources count
    const { count: sourcesCount, error: sourcesError } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true });

    if (sourcesError) throw sourcesError;

    // Get cache stats
    const cacheStats = getCacheStats();

    const stats = {
      totalArticles: articlesCount || 0,
      totalClusters: clustersCount || 0,
      blindspots: blindspotsCount || 0,
      sources: sourcesCount || 0,
      cacheStats,
      lastClusteringTime: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
