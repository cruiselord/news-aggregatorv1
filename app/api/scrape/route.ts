import { NextResponse } from "next/server"
import { fetchAllFeeds } from "@/src/lib/scraper/rss-fetcher"

export async function GET(request: Request) {
  const secret = request.headers.get("x-scraper-secret") || ""
  if (secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await fetchAllFeeds()
  return NextResponse.json(result)
}
