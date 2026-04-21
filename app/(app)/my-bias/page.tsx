import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, BookOpen } from "lucide-react"
import { MediaDietTracker } from "@/components/media-diet-tracker"

export const metadata = {
  title: "My Bias | NaijaPulse",
  description: "Track your media diet and understand your reading patterns",
}

// Demo stats - in production, fetch from authenticated user
const DEMO_STATS = {
  proGov: 15,
  independent: 28,
  opposition: 12,
  totalArticles: 55,
  sourcesReadCount: 8,
  sourcesRead: new Set(),
  percentages: {
    proGov: 27,
    independent: 51,
    opposition: 22,
  },
}

export default function MyBiasPage() {
  const stats = DEMO_STATS

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Reading Balance</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Understand your media consumption patterns and diversify your news diet
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Diet Tracker */}
            <MediaDietTracker stats={stats} />

            {/* Reading History Overview */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Reading History
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                      Pro-Government
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.proGov} articles
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      {stats.percentages.proGov}% of reading
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">
                      Independent
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.independent} articles
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      {stats.percentages.independent}% of reading
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                      Opposition
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.opposition} articles
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      {stats.percentages.opposition}% of reading
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{stats.totalArticles}</span> articles read from{" "}
                    <span className="font-semibold">{stats.sourcesReadCount}</span> sources in the
                    last 7 days
                  </p>
                </div>
              </div>
            </Card>

            {/* Tips & Recommendations */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Recommendations</h2>

              <div className="space-y-4">
                {stats.percentages.independent < 40 && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-200">
                        Increase Independent Coverage
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        You're reading mostly politically aligned sources. Independent media outlets
                        can help you see stories from multiple angles.
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 p-4 flex gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900 dark:text-purple-200">
                      Diversify Your Sources
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Reading from {stats.sourcesReadCount < 5 ? "more" : "varied"} sources helps prevent
                      echo chambers and ensures you see stories from different perspectives.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                  <p className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    💡 Pro Tip
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Next time you read an article, try reading the same story from outlets with
                    different perspectives. You'll notice how the framing, headlines, and emphasis
                    change based on editorial bias.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Understanding Media Bias */}
            <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
              <h3 className="font-bold text-foreground mb-4">Understanding Media Bias</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 mb-1">
                    🔴 Pro-Government
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    Outlets aligned with current government policies and statements
                  </p>
                </div>

                <div>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 mb-1">
                    🟢 Independent
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    Outlets that strive for balanced coverage across political spectrum
                  </p>
                </div>

                <div>
                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 mb-1">
                    🔵 Opposition
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    Outlets that critique government and promote opposition ideas
                  </p>
                </div>
              </div>
            </Card>

            {/* Balanced Reading Goal */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Balanced Reading Goal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A healthy media diet includes perspectives from all sides:
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Pro-Government</span>
                  <span className="text-xs text-muted-foreground">25-35%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: "30%" }} />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="font-semibold">Independent</span>
                  <span className="text-xs text-muted-foreground">40-50%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: "45%" }} />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="font-semibold">Opposition</span>
                  <span className="text-xs text-muted-foreground">20-30%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: "25%" }} />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 italic">
                This ensures you understand all perspectives on major issues.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
