-- Seed major international RSS sources (idempotent by source name).
-- Run in Supabase SQL editor if needed.

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'BBC World News',
  'https://www.bbc.com/news',
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'Independent',
  8.8,
  'Public',
  'International (UK)',
  true
where not exists (select 1 from public.sources where name = 'BBC World News');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'The Guardian World',
  'https://www.theguardian.com/world',
  'https://www.theguardian.com/world/rss',
  'Independent',
  8.3,
  'Private',
  'International (UK)',
  true
where not exists (select 1 from public.sources where name = 'The Guardian World');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'Reuters World',
  'https://www.reuters.com/world/',
  'https://feeds.reuters.com/Reuters/worldNews',
  'Independent',
  9.0,
  'Private',
  'International',
  true
where not exists (select 1 from public.sources where name = 'Reuters World');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'NPR News',
  'https://www.npr.org',
  'https://feeds.npr.org/1001/rss.xml',
  'Independent',
  8.5,
  'Public',
  'International (US)',
  true
where not exists (select 1 from public.sources where name = 'NPR News');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'CNN Top Stories',
  'https://edition.cnn.com',
  'http://rss.cnn.com/rss/edition.rss',
  'Independent',
  7.4,
  'Private',
  'International (US)',
  true
where not exists (select 1 from public.sources where name = 'CNN Top Stories');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'New York Times World',
  'https://www.nytimes.com/section/world',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'Independent',
  8.6,
  'Private',
  'International (US)',
  true
where not exists (select 1 from public.sources where name = 'New York Times World');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'Al Jazeera English',
  'https://www.aljazeera.com',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'Independent',
  8.1,
  'State',
  'International (MENA)',
  true
where not exists (select 1 from public.sources where name = 'Al Jazeera English');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'ESPN Top Headlines',
  'https://www.espn.com',
  'https://www.espn.com/espn/rss/news',
  'Independent',
  7.8,
  'Private',
  'International Sports',
  true
where not exists (select 1 from public.sources where name = 'ESPN Top Headlines');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'Sky Sports News',
  'https://www.skysports.com',
  'https://www.skysports.com/rss/12040',
  'Independent',
  7.6,
  'Private',
  'International Sports (UK)',
  true
where not exists (select 1 from public.sources where name = 'Sky Sports News');

insert into public.sources
  (name, website_url, rss_url, bias_label, factuality_score, ownership_type, region_focus, is_active)
select
  'Variety Entertainment',
  'https://variety.com',
  'https://variety.com/feed/',
  'Independent',
  7.5,
  'Private',
  'International Entertainment',
  true
where not exists (select 1 from public.sources where name = 'Variety Entertainment');
