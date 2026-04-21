import { getBlindspotStories } from "@/lib/db-queries"
import { Card } from "@/components/ui/card"
import { AlertCircle, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Blind Spots | NaijaPulse",
  description: "Stories covered by only one perspective or heavily one-sided",
}

export default async function BlindspotPage() {
  const blindspots = await getBlindspotStories(20)

  const groupedByTopic = blindspots.reduce(
    (acc, story) => {
      const topic = (story.topics?.[0] || "Other") as string
      if (!acc[topic]) acc[topic] = []
      acc[topic].push(story)
      return acc
    },
    {} as Record<string, typeof blindspots>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-10 w-10 text-orange-600" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                ⚠️ Blind Spots in Coverage
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Stories that are heavily one-sided or barely covered by mainstream media
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <Card className="mb-8 p-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <h2 className="font-bold text-foreground mb-2">What's a Blind Spot?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            A "blind spot" in media coverage occurs when:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="shrink-0">📊</span>
              <span>
                <strong>Underreported stories:</strong> Important news covered by fewer than 30% of media outlets
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">🔄</span>
              <span>
                <strong>One-sided coverage:</strong> A story covered by 70%+ from a single perspective
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">⚖️</span>
              <span>
                <strong>Missing balance:</strong> News that lacks viewpoints from pro-government, independent, or opposition outlets
              </span>
            </li>
          </ul>
        </Card>

        {/* Blind Spots by Topic */}
        {Object.entries(groupedByTopic).length === 0 ? (
          <Card className="p-12 text-center">
            <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">No Major Blind Spots Detected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Today's coverage appears well-balanced across different perspectives. Great job consuming diverse media!
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByTopic).map(([topic, stories]) => (
              <div key={topic}>
                <h2 className="text-2xl font-bold text-foreground mb-4 capitalize">
                  {topic} ({stories.length})
                </h2>

                <div className="grid gap-4">
                  {stories.map((story) => {
                    const total =
                      (story.pro_gov_coverage ?? 0) +
                      (story.independent_coverage ?? 0) +
                      (story.opposition_coverage ?? 0) || 1

                    const maxCoverage = Math.max(
                      story.pro_gov_coverage ?? 0,
                      story.independent_coverage ?? 0,
                      story.opposition_coverage ?? 0
                    )

                    const dominant = Math.round((maxCoverage / total) * 100)

                    let dominantPerspective = ""
                    if (story.pro_gov_coverage === maxCoverage) dominantPerspective = "Pro-Government"
                    else if (story.opposition_coverage === maxCoverage) dominantPerspective = "Opposition"
                    else dominantPerspective = "Independent"

                    return (
                      <Link key={story.id} href={`/story/${story.id}`}>
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                          <div className="space-y-3">
                            {/* Headline */}
                            <h3 className="text-lg font-semibold text-foreground hover:text-orange-600 transition-colors">
                              {story.headline}
                            </h3>

                            {/* Coverage Analysis */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {dominant}% coverage dominated by <strong>{dominantPerspective}</strong>
                                </span>
                                <span className="font-semibold text-orange-600">Coverage Gap</span>
                              </div>

                              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500"
                                  style={{ width: `${dominant}%` }}
                                />
                              </div>
                            </div>

                            {/* Coverage Breakdown */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
                                <p className="text-red-700 dark:text-red-300 font-semibold">
                                  {story.pro_gov_coverage ?? 0}
                                </p>
                                <p className="text-red-600 dark:text-red-400 text-xs">Pro-Gov</p>
                              </div>
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                                <p className="text-green-700 dark:text-green-300 font-semibold">
                                  {story.independent_coverage ?? 0}
                                </p>
                                <p className="text-green-600 dark:text-green-400 text-xs">Independent</p>
                              </div>
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                                <p className="text-blue-700 dark:text-blue-300 font-semibold">
                                  {story.opposition_coverage ?? 0}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400 text-xs">Opposition</p>
                              </div>
                            </div>

                            {/* Call to Action */}
                            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                              Read {story.article_count || 0} perspectives →
                            </p>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
