'use client';

import { Eye, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BlindspotStory {
  id: string;
  headline: string;
  topics?: string[] | null;
  article_count?: number;
  is_blindspot?: boolean;
  blindspot_type?: string;
  pro_gov_coverage?: number;
  independent_coverage?: number;
  opposition_coverage?: number;
}

interface Props {
  blindspots: BlindspotStory[];
}

function getBlindspotType(story: BlindspotStory) {
  if (!story.blindspot_type) return 'Underreported';

  const type = story.blindspot_type.toLowerCase();
  if (type.includes('left')) return 'Left-Leaning Blind Spot';
  if (type.includes('right')) return 'Right-Leaning Blind Spot';
  if (type.includes('center')) return 'Mixed Perspective Blind Spot';
  return 'Underreported Story';
}

function getCoveragePercentage(story: BlindspotStory) {
  const total =
    (story.pro_gov_coverage ?? 0) +
    (story.independent_coverage ?? 0) +
    (story.opposition_coverage ?? 0) || 1;

  const maxCoverage = Math.max(
    story.pro_gov_coverage ?? 0,
    story.independent_coverage ?? 0,
    story.opposition_coverage ?? 0
  );

  return Math.round((maxCoverage / total) * 100);
}

export function BlindspotDetectionWidget({ blindspots }: Props) {
  if (blindspots.length === 0) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <div className="flex gap-3 items-start">
          <Eye className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-200">
              No Major Blind Spots Detected
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Today's coverage appears well-balanced across different perspectives.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Blind Spots This Week ({blindspots.length})
        </h3>
      </div>

      {blindspots.slice(0, 5).map((story) => {
        const coverage = getCoveragePercentage(story);
        const blindspotLabel = getBlindspotType(story);
        const uncoveredPercent = 100 - coverage;

        return (
          <Link key={story.id} href={`/story/${story.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
              <div className="space-y-2">
                {/* Headline */}
                <h4 className="font-semibold text-foreground hover:text-orange-600 transition-colors">
                  {story.headline}
                </h4>

                {/* Story Count */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {story.article_count || 0} sources covering
                  </Badge>
                </div>

                {/* Coverage Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{blindspotLabel}</span>
                    <span className="font-semibold text-orange-600">
                      {coverage}% one-sided coverage
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                </div>

                {/* Topics */}
                {story.topics && story.topics.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {story.topics.slice(0, 2).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-2">
                  View all {story.article_count || 0} perspectives →
                </p>
              </div>
            </Card>
          </Link>
        );
      })}

      {blindspots.length > 5 && (
        <Link href="/blindspot">
          <Card className="p-3 bg-muted hover:bg-muted/80 transition-colors text-center cursor-pointer">
            <p className="text-sm font-semibold text-foreground">
              View all {blindspots.length} blind spots →
            </p>
          </Card>
        </Link>
      )}
    </div>
  );
}
