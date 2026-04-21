'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp } from 'lucide-react';
import { BiasBar } from '@/components/bias-bar';

interface TrendingStory {
  id: string;
  headline: string;
  ai_summary?: string | null;
  topics?: string[] | null;
  article_count?: number;
  pro_gov_coverage?: number;
  independent_coverage?: number;
  opposition_coverage?: number;
  created_at: string;
}

interface Props {
  stories: TrendingStory[];
  title?: string;
  showIcon?: boolean;
}

export function TrendingStoriesSection({
  stories,
  title = '🔥 Trending Now',
  showIcon = true,
}: Props) {
  if (stories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No trending stories yet. Check back soon!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-3 py-1 rounded-full font-semibold">
          Last 24 hours
        </span>
      </div>

      <div className="grid gap-4">
        {stories.map((story, index) => {
          const biasTotal =
            (story.pro_gov_coverage ?? 0) +
            (story.independent_coverage ?? 0) +
            (story.opposition_coverage ?? 0) || 1;

          const biasBreakdown = {
            proGov: Math.round(((story.pro_gov_coverage ?? 0) / biasTotal) * 100),
            independent: Math.round(
              ((story.independent_coverage ?? 0) / biasTotal) * 100
            ),
            opposition: Math.round(
              ((story.opposition_coverage ?? 0) / biasTotal) * 100
            ),
          };

          return (
            <Link key={story.id} href={`/story/${story.id}`}>
              <Card className="p-5 hover:shadow-md transition-all hover:border-orange-300 cursor-pointer">
                <div className="flex gap-4 items-start">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900">
                      <span className="font-bold text-orange-700 dark:text-orange-200">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground hover:text-orange-600 transition-colors mb-2">
                      {story.headline}
                    </h3>

                    {story.ai_summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {story.ai_summary}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {story.article_count || 0} outlets
                      </Badge>

                      {story.topics && story.topics.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {story.topics[0]}
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(story.created_at).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Bias Bar */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <BiasBar
                        proGov={biasBreakdown.proGov}
                        independent={biasBreakdown.independent}
                        opposition={biasBreakdown.opposition}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
