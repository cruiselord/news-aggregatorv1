import * as dotenv from 'dotenv';
import { fetchAllFeeds } from '../src/lib/scraper/rss-fetcher';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

(async () => {
  try {
    const res = await fetchAllFeeds();
    console.log('SCRAPE RESULT:', JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error('SCRAPE ERROR:', err?.message || err);
    process.exit(1);
  }
})();
