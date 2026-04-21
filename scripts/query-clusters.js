const fs = require('fs');
const path = require('path');
function loadEnv(f) {
  try {
    fs.readFileSync(path.resolve(process.cwd(), f), 'utf8').split(/\r?\n/).forEach(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const i = t.indexOf('=');
      if (i === -1) return;
      let k = t.slice(0, i), v = t.slice(i + 1);
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(k in process.env)) process.env[k] = v;
    });
  } catch (e) {}
}
loadEnv('.env.local');
loadEnv('.env');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('story_clusters').select('id,headline').limit(3);
  if (error) {
    console.error('error', error);
  } else {
    console.log(data);
  }
})();
