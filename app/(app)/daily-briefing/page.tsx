import Link from "next/link"
import { Share2, Mail, Clock, Eye } from "lucide-react"
import { stories } from "@/lib/mock-data"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function DailyBriefingPage() {
  const heroStory = stories[0]
  const gridStories = stories.slice(1, 7)
  const alsoInNews = stories.slice(3, 8)
  const blindspotStory = stories.find((s) => s.isBlindspot) || stories[2]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          NaijaPulse Daily Briefing
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Saturday, February 28, 2026
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          8 stories · 156 articles · ~12 min read · Curated by AI
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button size="sm" className="bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90">
            <Mail className="mr-2 h-4 w-4" /> Subscribe to Daily Email
          </Button>
        </div>
      </div>

      {/* Hero Story */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="flex gap-6">
          <div className="hidden h-[220px] w-[400px] shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#008751]/20 to-[#008751]/5 text-sm text-muted-foreground">
              Featured Image
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Badge className="mb-2 bg-[#008751] text-[#ffffff] text-xs">TOP STORY</Badge>
              <h2 className="text-xl font-bold leading-tight text-foreground text-balance">
                {heroStory.headline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {heroStory.summary} Government officials have defended the policy as a necessary
                step for fiscal sustainability, while opposition voices argue it disproportionately
                affects low-income families.
              </p>
            </div>
            <div className="mt-4">
              <BiasBar
                proGov={heroStory.biasBreakdown.proGov}
                independent={heroStory.biasBreakdown.independent}
                opposition={heroStory.biasBreakdown.opposition}
                size="md"
                showLabels
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Covered by {heroStory.sourceCount} Nigerian outlets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {gridStories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`}>
            <article className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="hidden h-[80px] w-[120px] shrink-0 overflow-hidden rounded-md bg-muted sm:block">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#008751]/10 to-[#008751]/5 text-xs text-muted-foreground">
                  {story.topic}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                  {story.headline}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  {story.summary}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <BiasBar
                    proGov={story.biasBreakdown.proGov}
                    independent={story.biasBreakdown.independent}
                    opposition={story.biasBreakdown.opposition}
                  />
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {story.sourceCount} sources
                  </Badge>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Also in the News */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Also in the news</h2>
        <ul className="flex flex-col gap-2">
          {alsoInNews.map((story) => (
            <li key={story.id}>
              <Link href={`/story/${story.id}`} className="flex items-center gap-2 text-sm text-foreground hover:text-[#008751]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#008751]" />
                {story.headline}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Blindspot Alert */}
      <Link href={`/story/${blindspotStory.id}`}>
        <div className="rounded-lg border-2 border-[#FF6D00] bg-[#FF6D00]/5 p-6 transition-shadow hover:shadow-md">
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 h-6 w-6 shrink-0 text-[#FF6D00]" />
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {"Naija Blindspot Today"}
              </h3>
              <p className="mt-1 text-sm text-foreground font-medium">
                {blindspotStory.headline}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {blindspotStory.blindspotPercent}% of coverage comes from {blindspotStory.blindspotSide} sources.
                See what the other side is saying.
              </p>
              <span className="mt-2 inline-block text-sm font-medium text-[#FF6D00]">
                Read balanced coverage →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
