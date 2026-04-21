// Advanced clustering with Named Entity Recognition and semantic similarity
// @ts-nocheck

import { generateJSON } from '../ai/gemini';

// ============================================================================
// ENTITY EXTRACTION (Named Entity Recognition)
// ============================================================================

interface ExtractedEntity {
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'POLICY' | 'EVENT';
  value: string;
  score: number;
}

export function extractEntities(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  
  // Common patterns for Nigerian context
  const patterns = {
    PERSON: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
    ORGANIZATION: /\b((?:Federal|State|Local|Court|Commission|Ministry|Department|Senate|House|Bank|Corporation|Company|Agency)\s+[A-Z][a-z\s]+)\b/gi,
    LOCATION: /\b(Lagos|Abuja|Kano|Rivers|Kaduna|Enugu|Cross\s+River|Ogun|Osun|Ondo|Edo|Delta|Akwa\s+Ibom|Bayelsa|Plateau|Nasarawa|Kebbi|Sokoto|Katsina|Kogi|Kwara|Niger|Taraba|Zamfara|Gombe|Borno|Adamawa|Yobe|Ekiti|Bauchi|Benue|Imo|Abia|Anambra|Ebonyi|Calabar|Port\s+Harcourt|Benin|Accra|Dakar|Nigeria|Africa|West\s+Africa|North|South|East|West|Central)\b/gi,
    POLICY: /\b((?:bill|law|act|policy|regulation|directive|order|decree|amendment|treaty|agreement|protocol|framework|initiative|program|scheme)\s+[A-Z][a-z\s0-9]+)\b/gi,
    EVENT: /\b((?:election|summit|conference|meeting|protest|strike|pandemic|crisis|disaster|incident|trial|hearing|ceremony|session)\s+[A-Z][a-z\s0-9]+)\b/gi,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    let match;
    const regexWithG = new RegExp(pattern.source, pattern.flags);
    while ((match = regexWithG.exec(text)) !== null) {
      const value = match[1].trim();
      if (value.length > 2) {
        entities.push({
          type: type as ExtractedEntity['type'],
          value: value.toLowerCase(),
          score: 1.0,
        });
      }
    }
  }

  // Remove duplicates, keeping higher scores
  const deduped: Record<string, ExtractedEntity> = {};
  for (const entity of entities) {
    const key = `${entity.type}:${entity.value}`;
    if (!deduped[key] || deduped[key].score < entity.score) {
      deduped[key] = entity;
    }
  }

  return Object.values(deduped);
}

// ============================================================================
// SEMANTIC SIMILARITY
// ============================================================================

// Simple word-based semantic similarity using TF-IDF-like scoring
export function calculateSemanticSimilarity(text1: string, text2: string): number {
  const STOP_WORDS = new Set([
    'the','a','an','of','in','is','are','was','were','and','or','but','for','to','with','that','this',
    'at','by','from','on','as','it','its','has','have','been','will','be','not','he','she','they',
    'their','we','you','your','which','about','up','so','than','then','one','two','more','most'
  ]);

  function getWords(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => !STOP_WORDS.has(w) && w.length > 2)
    );
  }

  const words1 = getWords(text1);
  const words2 = getWords(text2);

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  // Jaccard similarity
  return intersection / union;
}

// Enhanced entity-based similarity
export function calculateEntitySimilarity(entities1: ExtractedEntity[], entities2: ExtractedEntity[]): number {
  if (entities1.length === 0 || entities2.length === 0) return 0;

  let matches = 0;
  for (const e1 of entities1) {
    for (const e2 of entities2) {
      if (e1.type === e2.type && e1.value === e2.value) {
        matches++;
      }
    }
  }

  return matches / Math.max(entities1.length, entities2.length);
}

// ============================================================================
// ADVANCED CLUSTERING
// ============================================================================

export interface ArticleWithContent {
  id: string;
  title: string;
  summary: string;
}

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

/**
 * Advanced clustering combining:
 * 1. Entity matching (high precision)
 * 2. Semantic similarity (medium precision)
 * 3. Title keyword overlap (baseline)
 */
export function clusterAdvanced(
  articles: ArticleWithContent[],
  options = { entityThreshold: 0.3, semanticThreshold: 0.5, keywordThreshold: 3 }
): string[][] {
  if (articles.length === 0) return [];

  const n = articles.length;
  const uf = new UnionFind(n);

  // Extract entities for each article once
  const allEntities = articles.map(a => ({
    title: extractEntities(a.title),
    summary: extractEntities(a.summary),
  }));

  // Compare pairs with multi-stage similarity strategy
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = articles[i];
      const b = articles[j];
      const ea = allEntities[i];
      const eb = allEntities[j];

      let shouldCluster = false;
      let similarity = 0;

      // Stage 1: Strong entity match (title + summary entities match)
      const titleEntitySim = calculateEntitySimilarity(ea.title, eb.title);
      const summaryEntitySim = calculateEntitySimilarity(ea.summary, eb.summary);
      const entitySimilarity = Math.max(titleEntitySim, summaryEntitySim);

      if (entitySimilarity >= options.entityThreshold) {
        shouldCluster = true;
        similarity = 0.9 * entitySimilarity; // High confidence
      }

      // Stage 2: Semantic similarity on full text
      if (!shouldCluster) {
        const semanticSim = calculateSemanticSimilarity(
          `${a.title} ${a.summary}`,
          `${b.title} ${b.summary}`
        );
        if (semanticSim >= options.semanticThreshold) {
          shouldCluster = true;
          similarity = 0.7 * semanticSim; // Medium confidence
        }
      }

      // Stage 3: Keyword overlap (fallback)
      if (!shouldCluster) {
        const keywordSim = calculateSemanticSimilarity(a.title, b.title);
        if (keywordSim >= 0.4) {
          // Lower threshold for keywords
          shouldCluster = true;
          similarity = 0.5 * keywordSim; // Lower confidence
        }
      }

      if (shouldCluster) {
        uf.union(i, j);
      }
    }
  }

  // Group by cluster root
  const groups: Record<number, string[]> = {};
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groups[root]) groups[root] = [];
    groups[root].push(articles[i].id);
  }

  return Object.values(groups);
}

// ============================================================================
// GEMINI-POWERED REFINEMENT FOR SINGLETONS
// ============================================================================

export async function refineWithGemini(
  clusters: string[][],
  articleMap: Map<string, ArticleWithContent>,
  enableRefinement = true
): Promise<string[][]> {
  if (!enableRefinement) return clusters;

  // Find singleton clusters that might be misclassified
  const singletons = clusters.filter(c => c.length === 1).slice(0, 10); // Limit to top 10
  if (singletons.length < 2) return clusters;

  const singletonArticles = singletons
    .map(c => articleMap.get(c[0]))
    .filter(Boolean) as ArticleWithContent[];

  if (singletonArticles.length < 2) return clusters;

  const prompt = `Analyze these Nigerian news articles and identify which ones cover the same real-world event. 
Group related articles together.

${singletonArticles.map((a, i) => `Article ${i}:\nTitle: ${a.title}\nSummary: ${a.summary.slice(0, 200)}...`).join('\n\n')}

Return ONLY a JSON array indicating which articles should be grouped together. Use -1 for singletons.
Format: [group1, group2, ...] where each group is an array of indices.
Example: [[0, 2], [1, 3], [4]]`;

  try {
    const result = await generateJSON<number[][]>(prompt);
    // Merge singleton clusters that Gemini Says should be together
    const nonSingletons = clusters.filter(c => c.length > 1);
    const mergedSingletons = result.filter(g => g.length > 1).map(indices =>
      indices.map(idx => singletonArticles[idx]?.id).filter(Boolean)
    );
    const remainingSingletons = result
      .filter(g => g.length === 1)
      .map(indices => singletonArticles[indices[0]]?.id)
      .filter(Boolean)
      .map(id => [id]);

    return [...nonSingletons, ...mergedSingletons, ...remainingSingletons];
  } catch (error) {
    console.warn('Gemini refinement failed:', error);
    return clusters;
  }
}

// ============================================================================
// EXPORT UNIFIED CLUSTERING FUNCTION
// ============================================================================

export async function clusterArticlesAdvanced(
  articles: ArticleWithContent[],
  useGeminiRefinement = false
): Promise<string[][]> {
  const clusters = clusterAdvanced(articles);

  if (useGeminiRefinement) {
    const articleMap = new Map(articles.map(a => [a.id, a]));
    return refineWithGemini(clusters, articleMap, true);
  }

  return clusters;
}
