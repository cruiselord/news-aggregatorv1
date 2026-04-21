// @ts-nocheck
import { generateJSON } from '../ai/gemini';

// simple union-find implementation for clustering
class UnionFind {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }
  union(a: number, b: number) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) {
      this.parent[rb] = ra;
    }
  }
}

// STEP 1 — Title similarity clustering (fast, no AI cost)
export function clusterByTitleSimilarity(
  articles: { id: string; title: string }[][]
): string[][] {
  const STOP_WORDS = new Set([
    'the','a','an','of','in','is','are','was','were','and','or','but','for','to','with','that','this','at','by','from','on','as','it','its','has','have','been','will','be','not','he','she','they','their','we','you'
  ]);

  function getKeywords(title: string): Set<string> {
    return new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => !STOP_WORDS.has(w) && w.length > 3)
    );
  }

  function areSimilar(t1: string, t2: string): boolean {
    const k1 = getKeywords(t1);
    const k2 = getKeywords(t2);
    const overlap = [...k1].filter(w => k2.has(w));
    return overlap.length >= 3;
  }

  // flatten input so we can union-find over all articles
  const flat: { id: string; title: string }[] = [];
  for (const group of articles) {
    flat.push(...group);
  }

  const n = flat.length;
  const uf = new UnionFind(n);

  // compare every pair (O(n^2) but n expected small)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (areSimilar(flat[i].title, flat[j].title)) {
        uf.union(i, j);
      }
    }
  }

  const groups: Record<number, string[]> = {};
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groups[root]) groups[root] = [];
    groups[root].push(flat[i].id);
  }

  return Object.values(groups);
}

// STEP 2 — Gemini AI clustering for remaining articles
export async function clusterWithGemini(
  articles: { id: string; title: string }[]
): Promise<string[][]> {
  const list = articles.map((a, i) => `${i}: ${a.title}`).join('\n');
  const prompt = `Group these Nigerian news article titles by which real-world event they cover.
Articles that cover the same event should be in the same group.

${list}

Return ONLY a JSON array of arrays of index numbers:
[[0,3,7],[1,4],[2,5,6]]
Each index appears exactly once.`;

  const clusters = await generateJSON<number[][]>(prompt);
  return clusters.map((group: number[]) => group.map((idx: number) => articles[idx]?.id).filter(Boolean));
}

// STEP 3 — Save clusters and calculate bias distribution
export interface ArticleRow {
  id: string;
  bias_label?: string | null;
}

export async function saveClusters(
  clusters: { articles: ArticleRow[] }[],
  supabase: any
) {
  for (const cluster of clusters) {
    const total = cluster.articles.length;
    const proGov = cluster.articles.filter(
      a => a.bias_label === 'Pro-Federal-Government'
    ).length;
    const independent = cluster.articles.filter(
      a => a.bias_label === 'Independent'
    ).length;
    const opposition = cluster.articles.filter(
      a => a.bias_label === 'Opposition-Leaning'
    ).length;

    const maxCoverage = Math.max(proGov, independent, opposition) / total;
    const isBlindspot = maxCoverage > 0.8;

    // insert a new cluster row, then update articles with cluster_id
    const payload = {
      article_count: total,
      pro_gov_coverage: Math.round((proGov / total) * 100),
      independent_coverage: Math.round((independent / total) * 100),
      opposition_coverage: Math.round((opposition / total) * 100),
      is_blindspot: isBlindspot,
    } as any;

    const { data: inserted, error } = await supabase
      .from('story_clusters')
      .insert(payload)
      .select();
    if (error) {
      console.error('error inserting cluster', error);
      continue;
    }
    const clusterId = inserted?.[0]?.id;
    if (clusterId) {
      const articleIds = cluster.articles.map(a => a.id).filter(Boolean);
      if (articleIds.length) {
        const { error: updErr } = await supabase
          .from('articles')
          .update({ cluster_id: clusterId })
          .in('id', articleIds);
        if (updErr) console.error('failed to update cluster_id', updErr);
      }
    }
  }
}
