# 🚀 QUICK START: NewsAPI + Auto-Update Implementation

**Estimated Time**: 15 minutes  
**Result**: Fresh news updates every 6 hours, 4x more articles/day

---

## Step 1: Get NewsAPI Key (5 minutes)

1. Go to **https://newsapi.org/**
2. Click **"Get API Key"** (top right)
3. Select **"Developer"** (free tier)
4. Sign up with email (takes 60 seconds)
5. Copy your API key (looks like: `a1b2c3d4e5f6g7h8`)

## Step 2: Add to Your Project (2 minutes)

### Local Development
Edit `.env.local` and add:
```
NEXT_PUBLIC_NEWS_API_KEY=your_key_here
```

### Production (Vercel)
1. Go to **vercel.com** → Your project
2. Click **Settings** → **Environment Variables**
3. Add new:
   - Name: `NEXT_PUBLIC_NEWS_API_KEY`
   - Value: `your_key_here`
4. Click **Save**

## Step 3: Test Locally (5 minutes)

```bash
# Start dev server
npm run dev

# Wait for it to start, then in another terminal:
npx tsx scripts/run-scrape-test.ts
```

**Expected output**:
```
[SCRAPER] Fetching RSS feeds...
[SCRAPER] RSS: 50 articles

[SCRAPER] Fetching from NewsAPI...
[SCRAPER] NewsAPI: 100 articles

[SCRAPER] ✅ Total: 150 articles fetched
```

Then check homepage: http://localhost:3000
- Should show **April 2026 news**, not February! ✅

## Step 4: Deploy & Enable Auto-Updates (3 minutes)

### If Using Vercel

Make sure `vercel.json` exists in root:
```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Deploy:
```bash
git add .
git commit -m "Add NewsAPI integration"
git push origin main
```

Vercel automatically sets up cron to run every 6 hours ✅

### If Using Railway/Other Host

Add to `.env.production`:
```
CRON_SECRET=your_secret_key_here
```

Then manually call the endpoint periodically (or use a free service like EasyCron.com)

## Step 5: Verify It Works

### Check 1: Homepage
Visit **http://localhost:3000** (or your live site)
- News should be from **THIS WEEK**, not 2 months ago ✅

### Check 2: Admin Dashboard
Go to **http://localhost:3000/admin/login**
- Password: `admin123`
- Click **"Run RSS Scrape"**
- Should see:
  ```
  ✅ Scraped 150 articles (RSS: 50, NewsAPI: 100) and created 25 clusters
  ```

### Check 3: Logs
For Vercel:
- Go to https://vercel.com/[project]/logs
- Search for `[CRON]`
- Should see successful scrapes every 6 hours

## What Just Happened

| Before | After |
|--------|-------|
| 12 RSS sources | 12 RSS + 50k+ NewsAPI sources |
| ~50 articles/scrape | ~150 articles/scrape |
| No automatic updates | Auto-update every 6 hours |
| 2-month-old news | Fresh news within 6 hours |

## Monitoring Your Scraper

### Add to Dashboard
Visit `/admin` (login: `admin123`)
- **"Run RSS Scrape"** button shows live breakdown
- Example: `RSS: 50, NewsAPI: 100, Clusters: 25`

### Check Logs
```bash
# Local
npm run dev
# Look for [SCRAPER], [CRON], or [ADMIN SCRAPE] logs

# Vercel
vercel logs --follow
```

## Cost Analysis

| Resource | Cost |
|----------|------|
| NewsAPI free tier | $0 (100 req/day, covers us) |
| Gemini API | ~$5-50/mo (summarization) |
| Supabase | Free-$100/mo |
| Hosting (Vercel) | Free-$20/mo |
| **Total** | **$0-150/mo** |

## Troubleshooting

### "NewsAPI not configured"
```
✗ Error: NEWS_API_KEY not set

Solution:
1. Check .env.local has: NEXT_PUBLIC_NEWS_API_KEY=your_key
2. Restart dev server
3. Try again
```

### "No articles from NewsAPI"
```
1. Verify API key at https://newsapi.org/account
2. Check you have free tier active
3. Test: curl "https://newsapi.org/v2/everything?q=Nigeria&apiKey=YOUR_KEY"
```

### "Scraper ran but no new articles"
```
1. HomepageArticles might be loaded with caching
2. Clear browser cache: Ctrl+Shift+Delete
3. Check Admin dashboard for article counts
4. Wait 10 seconds for DB to update
```

## Next Steps (After Verification)

1. **Monitor** - Check admin dashboard daily for 2 days
2. **Expand** - Add 50+ RSS sources (see `SETUP_AUTO_SCRAPER.md`)
3. **Optimize** - Replace expensive Gemini with free local LLM (Month 2)
4. **Launch** - Market to first users (Month 3)

## Files You've Just Set Up

- ✅ `/src/lib/scraper/newsapi-fetcher.ts` - NewsAPI fetcher (200+ lines)
- ✅ `/src/lib/scraper/rss-fetcher.ts` - Updated to use both sources
- ✅ `/app/api/admin/scrape/route.ts` - Shows breakdown (RSS vs NewsAPI)
- ✅ `/app/api/cron/scrape/route.ts` - Automatic scraper
- ✅ `/SETUP_NEWSAPI.md` - Full NewsAPI guide
- ✅ Build verified with 30 routes

## What If Something Breaks?

**Fallback**: If NewsAPI fails, RSS feeds still work independently
- Won't break anything
- Just get ~50 articles instead of ~150
- All errors logged for debugging

## Success Criteria

✅ You'll know it worked when:
1. Homepage shows April 2026 news (not Feb)
2. Article count increasing in admin dashboard
3. Scraper runs every 6 hours automatically
4. Admin "Run RSS Scrape" shows: `RSS: 50+, NewsAPI: 50+`

---

## Commands Reference

```bash
# Test scraper
npx tsx scripts/run-scrape-test.ts

# Start dev server
npm run dev

# Deploy (Vercel)
git push origin main

# Check logs (Vercel)
vercel logs --follow

# Check API status
curl https://newsapi.org/v2/everything?q=Nigeria&apiKey=YOUR_KEY
```

---

**You're all set!** Your news aggregator now has 50k+ sources instead of 12, and updates automatically. 🎉

Next: Read `ACTION_PLAN.md` for what to do in Month 2-3.

