'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface MediaDietStats {
  proGov: number;
  independent: number;
  opposition: number;
  sourcesRead: Set<string>;
  totalArticles: number;
  sourcesReadCount: number;
  percentages: {
    proGov: number;
    independent: number;
    opposition: number;
  };
}

interface Props {
  stats?: MediaDietStats;
}

export function MediaDietTracker({ stats }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !stats) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading your media diet...</p>
      </Card>
    );
  }

  const dominant = Math.max(
    stats.percentages.proGov,
    stats.percentages.independent,
    stats.percentages.opposition
  );

  const isDominant = dominant > 50;
  const dominantSide =
    dominant === stats.percentages.proGov
      ? 'Pro-Government'
      : dominant === stats.percentages.opposition
      ? 'Opposition'
      : 'Independent';

  // Calculate recommended perspective
  const getRecommendedPerspective = () => {
    if (stats.percentages.proGov > 60)
      return 'opposition';
    if (stats.percentages.opposition > 60)
      return 'pro-government';
    if (stats.percentages.independent > 50)
      return 'opposition or pro-government';
    return 'a mix';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Your Reading Balance</h2>
            <p className="text-sm text-muted-foreground">
              Last 7 days • {stats.totalArticles} articles from {stats.sourcesReadCount} sources
            </p>
          </div>
          <TrendingUp className="h-6 w-6 text-purple-600" />
        </div>

        {/* Bias Distribution */}
        <div className="space-y-3">
          {/* Pro-Gov */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-foreground">🔴 Pro-Government</span>
              <span className="text-sm font-bold text-red-600">
                {stats.percentages.proGov}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${stats.percentages.proGov}%` }}
              />
            </div>
          </div>

          {/* Independent */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-foreground">🟢 Independent</span>
              <span className="text-sm font-bold text-green-600">
                {stats.percentages.independent}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${stats.percentages.independent}%` }}
              />
            </div>
          </div>

          {/* Opposition */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-foreground">🔵 Opposition</span>
              <span className="text-sm font-bold text-blue-600">
                {stats.percentages.opposition}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${stats.percentages.opposition}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {isDominant && (
        <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                Your Reading Leans {dominant > 70 ? 'Heavily ' : ''}Toward {dominantSide}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Try reading more from {getRecommendedPerspective()} outlets to balance your perspective.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Reading Habits */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Reading Habits</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.proGov}</p>
            <p className="text-xs text-muted-foreground mt-1">Pro-Gov</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.independent}</p>
            <p className="text-xs text-muted-foreground mt-1">Independent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.opposition}</p>
            <p className="text-xs text-muted-foreground mt-1">Opposition</p>
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      {stats.sourcesReadCount < 5 && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Tip:</strong> You're reading from only {stats.sourcesReadCount} sources.
            Diversify your news diet by exploring outlets with different perspectives.
          </p>
        </Card>
      )}
    </div>
  );
}
