import Link from "next/link"
import { Clock, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BiasBar } from "@/components/bias-bar"
import type { Story } from "@/lib/mock-data"

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/story/${story.id}`}>
      <article className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
        <div className="hidden h-[130px] w-[200px] shrink-0 overflow-hidden rounded-md bg-muted sm:block">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#008751]/20 to-[#008751]/5 text-xs text-muted-foreground">
            {story.topic}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#008751]/10 text-[#008751] text-xs">
                {story.sourceCount} sources
              </Badge>
              {story.isBlindspot && (
                <Badge className="bg-[#FF6D00] text-[#ffffff] text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  Naija Blindspot
                </Badge>
              )}
            </div>
            <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
              {story.headline}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-1">
              {story.summary}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <BiasBar
              proGov={story.biasBreakdown.proGov}
              independent={story.biasBreakdown.independent}
              opposition={story.biasBreakdown.opposition}
            />
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {story.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function BlindspotAlertCard() {
  return (
    <Link href="/blindspot">
      <div className="flex items-center gap-3 rounded-lg border-2 border-[#FF6D00] bg-[#FF6D00]/5 p-4 transition-shadow hover:shadow-md">
        <Eye className="h-8 w-8 shrink-0 text-[#FF6D00]" />
        <div>
          <h3 className="font-semibold text-foreground">
            Naija Blindspot Alert
          </h3>
          <p className="text-sm text-muted-foreground">
            3 stories today are being covered by only one political perspective. See what you might be missing.
          </p>
        </div>
        <span className="ml-auto shrink-0 text-sm font-medium text-[#FF6D00]">
          View All →
        </span>
      </div>
    </Link>
  )
}
