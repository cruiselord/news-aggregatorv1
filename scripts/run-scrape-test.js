const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filename) {
  try {
    const contents = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf8');
    contents.split(/\r?\n/).forEach((line) => {
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
  } catch (e) {}
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const parser = new Parser();

(async () => {
  try {
    const errors = [];
    let newArticles = 0;

    const { data: sources, error: srcErr } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .not('rss_url', 'is', null);

    if (srcErr) {
      console.error('Error fetching sources:', srcErr);
      process.exit(1);
    }
    if (!sources || sources.length === 0) {
      console.log(JSON.stringify({ newArticles: 0, errors: ['No sources found'], success: false }, null, 2));
      process.exit(0);
    }

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.rss_url);
        for (const item of (feed.items || []).slice(0, 20)) {
          if (!item.link || !item.title) continue;
          const { error } = await supabase.from('articles').upsert({
            source_id: source.id,
            title: item.title,
            url: item.link,
            content: item.contentSnippet ? item.contentSnippet.substring(0, 800) : null,
            image_url: (item.enclosure && item.enclosure.url) ? item.enclosure.url : null,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            bias_label: source.bias_label,
          }, { onConflict: 'url', ignoreDuplicates: true });

          if (!error) newArticles++;
        }
      } catch (err) {
        errors.push(`${source.name}: ${err.message || err}`);
      }
    }

    console.log(JSON.stringify({ newArticles, errors, success: true }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
