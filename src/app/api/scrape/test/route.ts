import { NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/scraper/rss-fetcher';

export async function GET() {
  const result = await fetchAllFeeds();
  return NextResponse.json(result);
}
