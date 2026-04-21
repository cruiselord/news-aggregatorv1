# How to Enable Automatic News Updates

## Problem
News was showing from February 2026 (2 months stale). The app has articles in the database but they weren't being refreshed automatically or displayed on the homepage.

## Solution
We've implemented automatic news scraping that will:
- ✅ Fetch new articles from all RSS sources every 6 hours
- ✅ Cluster articles automatically
- ✅ Clear caches to show fresh content
- ✅ Update the homepage with latest news

## Setup Instructions

### Option 1: Deploy on Vercel (Recommended - Full Automatic)

**Step 1**: Create `vercel.json` in project root:
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

**Step 2**: Set Environment Variable
In Vercel dashboard → Settings → Environment Variables, add:
```
CRON_SECRET=your-secret-key-here
```
(Choose any random string, e.g., `kj3h4k2j3h4jk234`)

**Step 3**: Deploy to Vercel
```bash
git add .
git commit -m "Add automatic news scraper"
git push origin main
```

**Result**: News will update automatically every 6 hours ✅

---

### Option 2: GitHub Actions (Any Host - Free Alternative)

**Step 1**: Create `.github/workflows/scrape-news.yml`:
```yaml
name: Scrape News Every 6 Hours

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: npx tsx scripts/run-scrape-test.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          NEXT_PUBLIC_GOOGLE_API_KEY: ${{ secrets.NEXT_PUBLIC_GOOGLE_API_KEY }}
```

**Step 2**: Set GitHub Secrets
In GitHub repo → Settings → Secrets and variables → Actions:
- `NEXT_PUBLIC_SUPABASE_URL` (from .env.local)
- `SUPABASE_SERVICE_ROLE_KEY` (from .env.local)
- `NEXT_PUBLIC_GOOGLE_API_KEY` (from .env.local)

**Result**: Scraper runs on GitHub's free servers every 6 hours ✅

---

### Option 3: Manual Admin Button (Already Implemented)

Go to `http://localhost:3000/admin/login` → Login with `admin123`

Click **"Run RSS Scrape"** button on dashboard

**Result**: Fetches new articles immediately ✅

---

## Verify It's Working

### Check 1: Admin Dashboard
Visit `/admin` → Dashboard shows:
- Total Articles count increasing
- Story Clusters count increasing
- Cache stats updating

### Check 2: Homepage
Visit `/` → You should see:
- News from TODAY (April 21, 2026), not February
- "Last updated: X minutes ago" message (when we add it)

### Check 3: Logs
```bash
# For Vercel: Check logs at https://vercel.com/[project]/logs
# For GitHub Actions: Check at https://github.com/[user]/[repo]/actions
```

---

## Recommendations

### Immediate (Do This Week)
1. ✅ Choose Option 1 (Vercel) or Option 2 (GitHub Actions)
2. ✅ Deploy with environment variables
3. ✅ Test: Wait 6 hours OR manually scrape from admin panel
4. ✅ Verify homepage shows current news

### Next Week
- Add 50+ Nigerian RSS sources (currently only 12)
- Add NewsAPI integration (50k sources)
- Monitor scraper logs for errors

### Month 2
- Add web scraping for major outlets (Guardian, Vanguard, ThisDay)
- Full automated pipeline

---

## Troubleshooting

**Problem**: Cron not running
- **Solution**: Check environment variables are set correctly
- **Check**: Vercel logs or GitHub Actions tab

**Problem**: Articles still not showing on homepage
- **Solution**: Clear browser cache: Ctrl+Shift+Delete
- **Check**: Admin dashboard → Last Updated timestamp

**Problem**: "No new articles" message
- **Solution**: Check RSS sources have articles
- **Check**: Visit sources manually to verify they have content

**Problem**: High Gemini API costs
- **Solution**: Switch to free local summarizer (Ollama/Mistral)
- **Check**: Replace Gemini in `/src/lib/ai/summarizer.ts`

---

## File Changes Made

Created:
- ✅ `/app/api/cron/scrape/route.ts` - Cron scraper endpoint
- ✅ Updated `/app/api/admin/scrape/route.ts` - Admin scraper with clustering

Updated:
- ✅ `/app/(app)/admin/page.tsx` - Better scrape feedback

---

## Questions?

Check `/STRATEGIC_ANALYSIS.md` for full technical analysis and recommendations.

