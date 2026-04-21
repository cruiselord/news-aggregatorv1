/*
This script connects to your Supabase database using the SERVICE_ROLE key
and introspects the schema to emit TypeScript interfaces for every table.
Currently it will fetch the columns for the tables listed below and write
`src/lib/supabase/types.ts` with the generated types.

Usage:
  npx ts-node scripts/generate-supabase-types.ts
(or add a package.json script to make it easier)

Make sure the following environment variables are set in your .env.local:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
*/

// We use a direct PostgreSQL connection for introspection rather than the
// Supabase REST client. The information_schema tables are not exposed by
// PostgREST which is why the previous implementation logged errors while
// trying to query them. Using a raw PG client avoids that limitation.
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// simple .env loader so we don't need an extra dependency
function loadEnvFile(filename: string) {
  try {
    const contents = fs.readFileSync(path.resolve(process.cwd(), filename), 'utf8');
    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx);
      let value = trimmed.slice(idx + 1);
      // remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    });
  } catch (e) {
    // ignore if file doesn't exist
  }
}
// load .env files commonly used by the app
loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;
if (!supabaseUrl || !serviceKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// A direct database URL is required for introspection. You can find it under
// "Settings -> Database -> Connection string" in your Supabase project and
// export it as SUPABASE_DB_URL in your .env.local. We deliberately avoid
// guessing the host because the dashboard sometimes uses custom domains.
if (!dbUrl) {
  console.error(
    'Please set SUPABASE_DB_URL to your project database connection string (service_role).'
  );
  process.exit(1);
}

// pg client used to run introspection queries
const pg = new Client({ connectionString: dbUrl });

// tables we care about (can be extended automatically if desired)
const tables = [
  'sources',
  'topics',
  'story_clusters',
  'articles',
  'user_profiles',
  'gamification_events',
  'saved_articles',
  'quiz_results',
  'story_timelines',
  'timeline_events',
  'cluster_topics',
  'user_topic_follows',
  'source_follows',
  'user_article_reads',
  'daily_briefings',
];

async function main() {
  let output = '// generated file - do not edit directly\n';
  output += '// run `npm run gen-types` (or similar) to regenerate\n\n';

  await pg.connect();
  for (const table of tables) {
    try {
      const res = await pg.query(
        `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
        `,
        [table]
      );
      output += `export interface ${toPascal(table)} {\n`;
      res.rows.forEach((col: any) => {
        const name = col.column_name;
        let type = sqlTypeToTs(col.data_type);
        const nullable = col.is_nullable === 'YES';
        if (nullable) type += ' | null';
        output += `  ${name}: ${type};\n`;
      });
      output += '}\n\n';
    } catch (err) {
      console.error(`error fetching columns for ${table}:`, err);
    }
  }
  await pg.end();

  const dest = path.resolve(process.cwd(), 'src/lib/supabase/types.ts');
  fs.writeFileSync(dest, output);
  console.log('wrote', dest);
}

function toPascal(str: string) {
  return str
    .split(/[_-]/)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function sqlTypeToTs(sql: string) {
  switch (sql) {
    case 'integer':
    case 'bigint':
    case 'numeric':
    case 'double precision':
    case 'real':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'text':
    case 'character varying':
    case 'character':
    case 'uuid':
    case 'date':
    case 'timestamp without time zone':
    case 'timestamp with time zone':
      return 'string';
    case 'json':
    case 'jsonb':
      return 'any';
    case 'USER-DEFINED':
      return 'any';
    default:
      if (sql.endsWith('[]')) return 'any[]';
      return 'any';
  }
}

main();
