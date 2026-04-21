# 📋 Quick Reference - Commands & Setup

## 🚀 Get Started in 15 Minutes

### 1. Get NewsAPI Key (Free)
```bash
# Browse to: https://newsapi.org/
# Sign up → Get key → Copy to clipboard
```

### 2. Configure Project
```bash
# Edit .env.local - add this line:
NEXT_PUBLIC_NEWS_API_KEY=your_key_here
```

### 3. Test Locally
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run scraper test
npx tsx scripts/run-scrape-test.ts

# Expected: "RSS: 50, NewsAPI: 100, Total: 150 articles"
```

### 4. Deploy
```bash
# Commit and push
git add .
git commit -m "Add NewsAPI integration"
git push origin main

# Vercel auto-deploys and enables cron (every 6 hours)
```

### 5. Verify
```bash
# Check homepage shows April 2026 news (not Feb)
# Visit admin dashboard: http://localhost:3000/admin/login
# Password: admin123
# Click "Run RSS Scrape" → See breakdown
```

---

## 🎛️ Common Admin Commands

### Manual Scrape from Admin Dashboard
```
1. Go to http://localhost:3000/admin/login
2. Password: admin123
3. Click "Run RSS Scrape" button
4. Wait 30 seconds for results
5. See: "RSS: X, NewsAPI: Y, Clusters: Z"
```

### Check Scraper Logs
```bash
# Local development
npm run dev
# Look for [SCRAPER], [ADMIN SCRAPE], [CRON] logs

# Production (Vercel)
vercel logs --follow
# Look for [CRON] entries
```

### Test NewsAPI Directly
```bash
# Verify API key works
curl "https://newsapi.org/v2/everything?q=Nigeria&apiKey=YOUR_KEY"
```

---

## 📁 File Reference

### Key Files
| File | Purpose |
|------|---------|
| `/src/lib/scraper/newsapi-fetcher.ts` | NewsAPI integration |
| `/src/lib/scraper/rss-fetcher.ts` | Combined RSS + NewsAPI fetcher |
| `/app/api/admin/scrape/route.ts` | Manual scrape endpoint |
| `/app/api/cron/scrape/route.ts` | Auto scraper (every 6h) |
| `/app/(app)/admin/page.tsx` | Dashboard UI |

### Documentation
| File | What To Read |
|------|------|
| `QUICKSTART_NEWSAPI.md` | 15-min setup (START HERE) |
| `NEWSAPI_IMPLEMENTATION.md` | Complete technical overview |
| `SETUP_NEWSAPI.md` | Detailed NewsAPI guide |
| `ACTION_PLAN.md` | Week-by-week roadmap |
| `STRATEGIC_ANALYSIS.md` | Market opportunity & strategy |

---

## 🔧 Environment Variables

### Local (`.env.local`)
```
# NewsAPI free tier key (required)
NEXT_PUBLIC_NEWS_API_KEY=your_key_from_newsapi.org

# Cron secret (for security)
CRON_SECRET=any_random_string_you_choose

# Existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Production (Vercel Dashboard)
```
Settings → Environment Variables

Add:
- NEXT_PUBLIC_NEWS_API_KEY = your_newsapi_key
- CRON_SECRET = your_random_secret
```

---

## 📊 Expected Output

### After Successful Scrape
```
Terminal Output:
─────────────
[SCRAPER] Fetching RSS feeds...
[SCRAPER] RSS: 50 articles, 0 errors

[SCRAPER] Fetching from NewsAPI...
[SCRAPER] NewsAPI: 100 articles, 0 errors

[SCRAPER] Created 25 clusters from 150 articles

✅ Success!
RSS: 50
NewsAPI: 100
Clusters: 25
Execution time: 32000ms
```

### Admin Dashboard Button
```
✅ Scraped 150 articles (RSS: 50, NewsAPI: 100) and created 25 clusters in 32000ms
```

---

## 🐛 Troubleshooting Commands

### Verify API Key
```bash
# Should return 200 OK + articles
curl "https://newsapi.org/v2/everything?q=Nigeria&pageSize=5&apiKey=YOUR_API_KEY"
```

### Check if Dev Server is Running
```bash
# Test homepage
curl http://localhost:3000

# Test API endpoint
curl http://localhost:3000/api/cron/scrape \
  -H "Authorization: Bearer your_cron_secret"
```

### Clear Database (Be Careful!)
```bash
# Via Supabase Dashboard:
# 1. Open https://supabase.com
# 2. Go to SQL Editor
# 3. Run:
DELETE FROM articles;
DELETE FROM story_clusters;
-- Then re-run scraper
```

### Check Logs Locally
```bash
# Grep for scraper output
npm run dev 2>&1 | grep -i "scraper\|newsapi\|cron"
```

---

## 📈 Monitoring

### Daily
```bash
# Check feeds are working
npx tsx scripts/run-scrape-test.ts

# Verify homepage shows fresh news
curl http://localhost:3000 | grep -o "202[4-6]" | head -5
```

### Weekly
```bash
# Check admin dashboard stats
# Expected: Articles increasing, cache hit rate > 80%

# Monitor API usage (at newsapi.org dashboard)
# Should see: ~4-5 requests/day consumed
```

### Monthly
```bash
# Still under 100 requests/day limit? ✅
# Database size reasonable? 
# Any errors in logs? 
# Users happy with news freshness?
```

---

## 🚨 Emergency Procedures

### If Homepage Shows Old News
```bash
# Force refresh cache
curl http://localhost:3000/api/admin/cache/invalidate \
  -X POST \
  -H "Authorization: Bearer your_cron_secret"

# Then manually scrape
curl http://localhost:3000/api/admin/scrape -X POST
```

### If NewsAPI Quota Exceeded
```bash
# Check current usage: https://newsapi.org/account
# Wait until tomorrow (resets midnight UTC)
# Or reduce scrape frequency temporarily

# Still use RSS feeds meanwhile (~50 articles/scrape)
```

### If Scraper Crashes
```bash
# Check logs
npm run dev 2>&1 | grep ERROR

# Restart dev server
# Ctrl+C, then: npm run dev

# Check: npx tsx scripts/run-scrape-test.ts
```

---

## ✅ Deployment Checklist

- [ ] NewsAPI key obtained from newsapi.org
- [ ] `.env.local` has `NEXT_PUBLIC_NEWS_API_KEY`
- [ ] Local test passes: `npx tsx scripts/run-scrape-test.ts`
- [ ] Build succeeds: `npm run build`
- [ ] Homepage shows April 2026 news
- [ ] Admin dashboard works (login with admin123)
- [ ] Vercel env vars set (NEXT_PUBLIC_NEWS_API_KEY, CRON_SECRET)
- [ ] Pushed to git: `git push origin main`
- [ ] Vercel build succeeded
- [ ] Cron job scheduled (check `vercel.json`)
- [ ] Live site shows fresh news
- [ ] Monitor logs for first 24 hours

---

## 💡 Pro Tips

### For Development
```bash
# Fast iteration with watch mode + cron testing
npm run dev &
while true; do
  echo "Testing scraper..."
  npx tsx scripts/run-scrape-test.ts
  sleep 3600  # Run every hour
done
```

### For Production Maintenance
```bash
# Monitor Vercel cron logs
vercel logs --follow

# Automatically retry failed scrapes
# (Already built-in - cron retries every 6h)
```

### Cost Optimization
```bash
# Track NewsAPI usage (free tier shows on dashboard)
# If approaching 100/day:
# - Reduce scrape frequency (8h instead of 6h)
# - Or upgrade to Starter Plan ($44/mo for 1000/day)

# Budget estimate:
# 4 requests/day × 30 days = 120 requests/month
# Free tier limit = 3000 requests/month
# Usage = 4% of free tier - plenty of buffer! ✅
```

---

## 📞 Support

**Problem**: Can't find something?
→ Check `QUICKSTART_NEWSAPI.md` for step-by-step guide

**Problem**: Why is it doing X?
→ Check `NEWSAPI_IMPLEMENTATION.md` for technical deep dive

**Problem**: What's next?
→ Check `ACTION_PLAN.md` for week-by-week roadmap

**Problem**: Market opportunity?
→ Check `STRATEGIC_ANALYSIS.md` for full analysis

---

## Quick Links

- 📖 Start with: `QUICKSTART_NEWSAPI.md`
- 📚 Learn more: `NEWSAPI_IMPLEMENTATION.md`
- 🗺️ Plan ahead: `ACTION_PLAN.md`
- 🎯 Market fit: `STRATEGIC_ANALYSIS.md`
- 🔐 API Docs: https://newsapi.org/docs

---

**You've got this!** 🚀 Deploy now, monitor later.

