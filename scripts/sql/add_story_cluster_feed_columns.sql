-- Add representative article metadata to story clusters.
-- Run this in Supabase SQL Editor.

alter table public.story_clusters
  add column if not exists feed_url text,
  add column if not exists image_url text,
  add column if not exists content text;

create index if not exists idx_story_clusters_feed_url
  on public.story_clusters (feed_url);
