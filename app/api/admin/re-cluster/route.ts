import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { clusterArticlesAdvanced } from '@/src/lib/scraper/advanced-clusterer';
import { invalidateOnDataChange } from '@/lib/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/admin/re-cluster
export async function POST(request: NextRequest) {
  try {
    // Fetch recent articles (larger window so old clusters don't stay empty)
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content, ai_summary, bias_label, url, image_url, published_at')
      .order('published_at', { ascending: false })
      .limit(5000);

    if (fetchError) throw fetchError;
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        clusterCount: 0,
        message: 'No articles to cluster',
      });
    }

    // First, clear existing clusters
    const { error: clearError } = await supabase
      .from('articles')
      .update({ cluster_id: null })
      .not('cluster_id', 'is', null);

    if (clearError) throw clearError;

    // Remove stale clusters so /story pages don't point to orphaned records
    const { error: deleteClustersError } = await supabase
      .from('story_clusters')
      .delete()
      .not('id', 'is', null);
    if (deleteClustersError) {
      throw deleteClustersError;
    }

    // Convert articles to format expected by clustering algorithm
    const articlesToCluster = articles.map((a) => ({
      id: a.id,
      title: a.title || '',
      summary: a.ai_summary || a.content || '',
    }));

    // Run advanced clustering
    const clusters = await clusterArticlesAdvanced(articlesToCluster, false);

    // Save clusters and calculate bias distribution
    let createdCount = 0;
    for (const clusterIds of clusters) {
      if (clusterIds.length === 0) continue;

      // Get articles in this cluster
      const clusterArticles = articles.filter((a) => clusterIds.includes(a.id));
      if (clusterArticles.length === 0) continue;

      // Calculate bias distribution
      const proGov = clusterArticles.filter(
        (a) => a.bias_label === 'Pro-Federal-Government'
      ).length;
      const independent = clusterArticles.filter(
        (a) => a.bias_label === 'Independent'
      ).length;
      const opposition = clusterArticles.filter(
        (a) => a.bias_label === 'Opposition-Leaning'
      ).length;

      const total = clusterArticles.length || 1;
      const maxCoverage = Math.max(proGov, independent, opposition) / total;
      const isBlindspot = maxCoverage > 0.8;
      const leadArticle =
        clusterArticles.find((a: any) => a.image_url || a.content) ??
        clusterArticles[0];

      const clusterPayload = {
        headline: leadArticle?.title || clusterArticles[0]?.title || 'Untitled',
        article_count: total,
        pro_gov_coverage: Math.round((proGov / total) * 100),
        independent_coverage: Math.round((independent / total) * 100),
        opposition_coverage: Math.round((opposition / total) * 100),
        is_blindspot: isBlindspot,
        blindspot_type: isBlindspot
          ? proGov > independent && proGov > opposition
            ? 'Pro-Government Heavy'
            : opposition > proGov && opposition > independent
            ? 'Opposition Heavy'
            : 'Government/Opposition Heavy'
          : null,
        // Optional, requires schema migration (added in sql script)
        feed_url: leadArticle?.url ?? null,
        image_url: leadArticle?.image_url ?? null,
        content: leadArticle?.content ?? null,
      };

      // Create cluster entry
      let { data: inserted, error: insertError } = await supabase
        .from('story_clusters')
        .insert([clusterPayload])
        .select();

      // Backward compatibility if schema columns are not created yet
      if (
        insertError &&
        String(insertError.message || '').includes('column story_clusters.feed_url does not exist')
      ) {
        const fallbackPayload = {
          headline: clusterPayload.headline,
          article_count: clusterPayload.article_count,
          pro_gov_coverage: clusterPayload.pro_gov_coverage,
          independent_coverage: clusterPayload.independent_coverage,
          opposition_coverage: clusterPayload.opposition_coverage,
          is_blindspot: clusterPayload.is_blindspot,
          blindspot_type: clusterPayload.blindspot_type,
        };
        const fallbackInsert = await supabase
          .from('story_clusters')
          .insert([fallbackPayload])
          .select();
        inserted = fallbackInsert.data;
        insertError = fallbackInsert.error;
      }

      if (insertError) throw insertError;

      const clusterId = inserted?.[0]?.id;
      if (clusterId) {
        // Link articles to cluster
        const { error: linkError } = await supabase
          .from('articles')
          .update({ cluster_id: clusterId })
          .in('id', clusterIds);

        if (linkError) throw linkError;
        createdCount++;
      }
    }

    // Invalidate cache
    invalidateOnDataChange();

    return NextResponse.json({
      success: true,
      clusterCount: createdCount,
      articleCount: articles.length,
      message: `Created ${createdCount} clusters from ${articles.length} articles`,
    });
  } catch (error) {
    console.error('Re-clustering error:', error);
    return NextResponse.json(
      { error: 'Failed to re-cluster articles', details: String(error) },
      { status: 500 }
    );
  }
}
