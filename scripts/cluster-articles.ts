#!/usr/bin/env ts-node

// register ts-node so that we can require other .ts modules at runtime
require('ts-node/register');

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// bring in clustering helpers via require now that ts-node is registered
const {
  clusterByTitleSimilarity,
  clusterWithGemini,
  saveClusters,
} = require('../src/lib/scraper/story-clusterer');

// article row interface for typing
type ArticleRow = { id: string; bias_label?: string | null };

function loadEnvFile(filename: string) {
  try {
    const contents = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf8');
    contents.split(/\r?\n/).forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx);
      let value = trimmed.slice(idx + 1);
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    });
  } catch (e) {
    // ignore
  }
}

// load .env files like the JS script did
loadEnvFile('.env.local');
loadEnvFile('.env');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // fetch recent articles (this mirrors the old script)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) throw error;
  if (!articles || articles.length === 0) {
    console.log('No articles found to cluster.');
    return;
  }

  // prepare simple list of id/title
  const simple = articles.map((a: any) => ({ id: a.id, title: a.title }));

  // Step1: title similarity
  const groupsOfIds = clusterByTitleSimilarity(simple.map((x: {id:string;title:string}) => [x]));
  const groups: ArticleRow[][] = groupsOfIds.map((ids: string[]) =>
    simple
      .filter((a: {id:string}) => ids.includes(a.id))
      .map((a: {id:string}) => ({ id: a.id, bias_label: (articles.find((ar: any) => ar.id === a.id)?.bias_label as string) }))
  );

  // identify leftovers (singleton groups) for AI clustering
  const leftovers = groups
    .filter(g => g.length === 1)
    .map(g => g[0]);

  let aiClusters: string[][] = [];
  if (leftovers.length > 1) {
    aiClusters = await clusterWithGemini(leftovers.map((a: ArticleRow) => ({ id: a.id, title: articles.find((ar: any) => ar.id === a.id)?.title || '' }))); // type helper
  }

  // assemble final clusters for saving
  const finalClusters: { articles: ArticleRow[] }[] = [];
  for (const grp of groups.filter(g => g.length > 1)) {
    finalClusters.push({ articles: grp });
  }
  for (const ids of aiClusters) {
    const arr = ids
      .map(id => {
        const art = leftovers.find(l => l.id === id);
        if (art) return art;
        // fallback to original articles array
        const orig = articles.find((a: any) => a.id === id);
        return orig ? { id: orig.id, bias_label: orig.bias_label } : undefined;
      })
      .filter(Boolean) as ArticleRow[];
    if (arr.length) finalClusters.push({ articles: arr });
  }

  console.log('Saving', finalClusters.length, 'clusters');
  await saveClusters(finalClusters, supabase);
}

main().catch(e => {
  console.error('Clustering error', e);
  process.exit(1);
});
