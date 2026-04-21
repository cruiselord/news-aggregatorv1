'use client';

import Image from 'next/image';
import { ArrowLeft, ExternalLink, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ArticleReaderProps {
  article: {
    id: string;
    title: string;
    content?: string | null;
    image_url?: string | null;
    url: string;
    published_at?: string;
    source: {
      id: string;
      name: string;
      bias_label?: string | null;
      website_url?: string | null;
      factuality_score?: number | null;
    };
  };
  clusterHeadline?: string;
  onBack?: () => void;
}

function getBiasBadge(bias?: string | null) {
  if (!bias) return { color: 'bg-slate-500', label: 'Neutral', emoji: '🟢' };
  const lower = bias.toLowerCase();
  if (lower.includes('pro-gov') || lower.includes('government')) {
    return { color: 'bg-red-500', label: 'Pro-Government', emoji: '🔴' };
  }
  if (lower.includes('opposition')) {
    return { color: 'bg-blue-500', label: 'Opposition', emoji: '🔵' };
  }
  return { color: 'bg-green-500', label: 'Independent', emoji: '🟢' };
}

export function ArticleReader({ article, clusterHeadline, onBack }: ArticleReaderProps) {
  const bias = getBiasBadge(article.source?.bias_label);
  const publishDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-NG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const estimatedReadTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Navigation & Controls */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border py-4 mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Header: Story Context */}
      {clusterHeadline && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Story Context</p>
          <h2 className="text-lg font-bold text-foreground">{clusterHeadline}</h2>
        </div>
      )}

      {/* Article Title */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground mb-4">
        {article.title}
      </h1>

      {/* Source & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
            {article.source.name.charAt(0)}
          </div>
          <div>
            <a
              href={article.source.website_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-blue-600 transition-colors"
            >
              {article.source.name}
            </a>
            <p className="text-xs text-muted-foreground">{publishDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`${bias.color} text-white`}>
            {bias.emoji} {bias.label}
          </Badge>
          {article.source?.factuality_score && (
            <Badge variant="secondary">
              {article.source.factuality_score}% factual
            </Badge>
          )}
          {estimatedReadTime && (
            <Badge variant="outline">
              {estimatedReadTime} min read
            </Badge>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {article.image_url && (
        <div className="mb-8 -mx-6 sm:rounded-lg overflow-hidden">
          <div className="relative w-full h-96 md:h-[500px] bg-muted">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-8">
        {article.content ? (
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded text-muted-foreground text-center italic">
            Full article content not available. Read on the source website →
          </div>
        )}
      </div>

      {/* Read Full Article CTA */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-foreground mb-2">Read Full Article</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Visit {article.source.name} to read the complete original article with additional context and images.
        </p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Visit Source
          <ExternalLink className="h-4 w-4" />
        </a>
      </Card>

      {/* Source Info Card */}
      <Card className="p-6 bg-muted/50 border-border">
        <h3 className="font-semibold text-foreground mb-4">About {article.source.name}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-1">Editorial Bias</p>
            <Badge className={`${bias.color} text-white w-fit`}>
              {bias.label}
            </Badge>
          </div>
          {article.source?.factuality_score && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Factuality Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${article.source.factuality_score}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">
                  {article.source.factuality_score}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </article>
  );
}
