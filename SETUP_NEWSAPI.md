# Setup NewsAPI Integration

## What is NewsAPI?

**NewsAPI.org** is a free service that aggregates news from 50,000+ sources worldwide. With the free tier, you get:
- ✅ **100 API requests per day** (plenty for our use case)
- ✅ **250 articles per request** (millions of articles available)
- ✅ **Real-time data** (updates as news breaks)
- ✅ **Nigeria-focused search** (we query specifically for Nigerian news)
- ✅ **Free forever** (no credit card required for free tier)

## Step 1: Get Your Free API Key

1. Go to [newsapi.org](https://newsapi.org/)
2. Click **"Get API Key"**
3. Choose **"Developer"** (free tier)
4. Sign up with email (takes 2 minutes)
5. You'll get an API key that looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p`

## Step 2: Add to Environment Variables

### Local Development (.env.local)

Add this line to your `.env.local` file:
```
NEWS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual NewsAPI key.

### Production (Vercel/Railway/etc)

**For Vercel**:
1. Go to your project settings
2. Environment Variables
3. Add new variable:
   - Name: `NEWS_API_KEY` (server-only)
   - Value: `your_api_key_here`
4. Deploy

**For Railway/Other Hosts**:
Same process - add env variable in your hosting dashboard.

## Step 3: Test It

### Option A: Manual Test from Admin Dashboard
1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/admin/login`
3. Login with password: `admin123`
4. Click **"Run RSS Scrape"** button
5. Should see output like:
   ```
   ✅ Scraped 150 articles (RSS: 50, NewsAPI: 100) and created 25 clusters
   ```

### Option B: Direct Test
```bash
npx tsx scripts/run-scrape-test.ts
```

Check logs for:
```
[SCRAPER] NewsAPI: 50+ articles
```

## How It Works

When you click "Run RSS Scrape" or cron job runs:

1. **Step 1**: Fetches from RSS feeds (your 12+ sources)
2. **Step 2**: Fetches from NewsAPI with Nigeria-focused queries:
   - "Nigeria politics"
   - "Lagos economy business"
   - "Nigeria security naija"
   - "Tinubu government"
   - "Nigerian election"
3. **Step 3**: Deduplicates (won't add same article twice)
4. **Step 4**: Clusters articles automatically
5. **Step 5**: Updates homepage with fresh content

**Result**: Instead of 50 articles/scrape → 100-150 articles/scrape

## Result: 4x More Content

| Before NewsAPI | After NewsAPI |
|---|---|
| 12 RSS sources | 12 RSS + NewsAPI (50k sources) |
| ~40 articles/scrape | ~100-150 articles/scrape |
| Limited coverage | Nigeria focus + international |
| Slower to get stories | Real-time breaking news |

## Free Tier Limits

- **100 requests/day** = plenty (we run once per 6 hours = 4 requests/day)
- **250 articles per request** = 100-150 new articles per scrape
- **No rate limiting within daily limit**

### Upgrade Strategy
- **Month 1-3**: Free tier ($0) - 100 articles/day from RSS + NewsAPI
- **Month 4+**: If you hit 500+ articles/day → upgrade to **Starter Plan** ($44/month = 1000 requests/day)
- **Cheaper alternative**: At scale, use other APIs (Mediastack, Webhose.io) or self-host

## Troubleshooting

### "NEWS_API_KEY not configured"
- **Solution**: Make sure env variable is set in `.env.local`
- **Check**: `echo $NEWS_API_KEY` in terminal
- **Restart**: Dev server after adding env var

### "No new articles from NewsAPI"
- **Solution**: Check NewsAPI status at https://newsapi.org/
- **Alternative**: Try manual request:
  ```bash
  curl "https://newsapi.org/v2/everything?q=Nigeria&apiKey=your_key"
  ```

### "API error: 429"
- **Solution**: You've exceeded 100 requests/day - wait until tomorrow
- **Prevention**: We rate-limit to 1 request per 24h in code

### Articles not showing on homepage
- **Solution**: Import happens in background, wait 10 seconds
- **Check**: Admin dashboard should show article count increasing
- **Debug**: Check browser console for errors

## Next Steps

After setup:
1. ✅ Test with manual scrape
2. ✅ Verify homepage shows new articles (from April, not February!)
3. ✅ Deploy to production (Vercel/Railway)
4. ✅ Set env var on production
5. ✅ Schedule cron job (every 6 hours)

## Questions?

Check: `/STRATEGIC_ANALYSIS.md` → "Free Data Sources" section for other alternatives (Mediastack, Webhose, etc.)

---

**That's it! You now have NewsAPI integrated.** 🎉

Your news will automatically update every 6 hours with fresh content from 50k+ sources, not just your 12 RSS feeds.

