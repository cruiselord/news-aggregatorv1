import Link from "next/link"
import { ChevronRight, MapPin, Clock, Building2 } from "lucide-react"
import { stories, sources } from "@/lib/mock-data"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { StoryCard } from "@/components/story-card"

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = stories.find((s) => s.id === id) || stories[0]

  const proGovSources = sources.filter((s) => s.bias === "pro-gov").slice(0, 2)
  const independentSources = sources.filter((s) => s.bias === "independent").slice(0, 3)
  const oppositionSources = sources.filter((s) => s.bias === "opposition").slice(0, 2)

  const relatedStories = stories.filter((s) => s.id !== story.id).slice(0, 3)

  return (
    <div className="flex gap-0">
      {/* Main Column */}
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-[#008751]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/topic/${story.topic}`} className="capitalize hover:text-[#008751]">{story.topic}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{story.headline.slice(0, 40)}...</span>
        </nav>

        {/* Headline */}
        <h1 className="text-2xl font-bold leading-tight text-foreground text-balance">
          {story.headline}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Feb 24 – Feb 28, 2026 · {story.sourceCount} sources · {story.readTime} read
        </p>

        {/* AI Summary */}
        <div className="mt-6 rounded-xl bg-secondary p-5">
          <Badge className="mb-2 bg-[#008751]/10 text-[#008751] text-xs">
            NaijaPulse AI Summary
          </Badge>
          <p className="text-sm leading-relaxed text-foreground">
            {story.summary} Multiple outlets have reported varying perspectives on this development,
            with government-aligned sources emphasizing policy justifications while opposition outlets
            focus on public impact and criticism of implementation.
          </p>
          <p className="mt-3 text-xs text-muted-foreground italic">
            AI-generated neutral summary · Not editorial opinion
          </p>
        </div>

        {/* Bias Coverage Bar */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Bias Coverage
          </h2>
          <BiasBar
            proGov={story.biasBreakdown.proGov}
            independent={story.biasBreakdown.independent}
            opposition={story.biasBreakdown.opposition}
            size="lg"
            showLabels
          />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{proGovSources.length} outlets · {Math.round(story.sourceCount * story.biasBreakdown.proGov / 100)} articles</span>
            <span>{independentSources.length} outlets · {Math.round(story.sourceCount * story.biasBreakdown.independent / 100)} articles</span>
            <span>{oppositionSources.length} outlets · {Math.round(story.sourceCount * story.biasBreakdown.opposition / 100)} articles</span>
          </div>
          {story.isBlindspot && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-[#FF6D00]/10 px-3 py-2 text-sm text-[#FF6D00]">
              <span className="font-medium">Naija Blindspot: {story.blindspotPercent}%+ from one perspective</span>
            </div>
          )}
        </div>

        {/* Coverage by Bias */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Coverage by Bias</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Pro-Gov Column */}
            <div>
              <div className="mb-3 rounded-t-lg bg-[#1565C0] px-3 py-2 text-sm font-semibold text-[#ffffff]">
                Pro-Government
              </div>
              {proGovSources.map((source) => (
                <div key={source.id} className="mb-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-xs font-bold text-[#1565C0]">
                      {source.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{source.name}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                    Government defends policy as necessary step for economic growth
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    Officials say the measures will reduce deficit and attract investment...
                  </p>
                  <Link href={`/source/${source.id}`} className="mt-2 inline-block text-xs font-medium text-[#008751]">
                    Read →
                  </Link>
                </div>
              ))}
            </div>

            {/* Independent Column */}
            <div>
              <div className="mb-3 rounded-t-lg bg-[#2E7D32] px-3 py-2 text-sm font-semibold text-[#ffffff]">
                Independent
              </div>
              {independentSources.slice(0, 2).map((source) => (
                <div key={source.id} className="mb-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 text-xs font-bold text-[#2E7D32]">
                      {source.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{source.name}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                    Analysis: Both sides of the debate have valid points, experts say
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    Economists are divided on the long-term impact of recent decisions...
                  </p>
                  <Link href={`/source/${source.id}`} className="mt-2 inline-block text-xs font-medium text-[#008751]">
                    Read →
                  </Link>
                </div>
              ))}
            </div>

            {/* Opposition Column */}
            <div>
              <div className="mb-3 rounded-t-lg bg-[#B71C1C] px-3 py-2 text-sm font-semibold text-[#ffffff]">
                Opposition
              </div>
              {oppositionSources.map((source) => (
                <div key={source.id} className="mb-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B71C1C]/10 text-xs font-bold text-[#B71C1C]">
                      {source.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{source.name}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                    Critics blast government for ignoring public welfare
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    Opposition leaders demand reversal of controversial policy...
                  </p>
                  <Link href={`/source/${source.id}`} className="mt-2 inline-block text-xs font-medium text-[#008751]">
                    Read →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Stories */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Related Stories</h2>
          <div className="flex flex-col gap-3">
            {relatedStories.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden w-[300px] shrink-0 border-l border-border p-4 lg:block">
        {/* State Coverage Map */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> State Coverage
          </h3>
          <div className="flex flex-wrap gap-1">
            {["Lagos", "Abuja", "Kano", "Rivers", "Kaduna", "Oyo"].map((state) => (
              <Badge key={state} variant="secondary" className="text-xs">
                {state}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">6 states reported this story</p>
        </div>

        {/* Publication Timeline */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Publication Timeline
          </h3>
          <ul className="flex flex-col gap-2">
            {[
              { outlet: "Premium Times", time: "6:30 AM" },
              { outlet: "Channels TV", time: "7:15 AM" },
              { outlet: "Punch", time: "8:00 AM" },
              { outlet: "Daily Trust", time: "9:45 AM" },
              { outlet: "Sahara Reporters", time: "11:20 AM" },
            ].map((entry) => (
              <li key={entry.outlet} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{entry.outlet}</span>
                <span className="text-xs text-muted-foreground">{entry.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ownership Summary */}
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Ownership Summary
          </h3>
          <ul className="flex flex-col gap-2">
            {sources.slice(0, 3).map((source) => (
              <li key={source.id} className="text-sm">
                <span className="font-medium text-foreground">{source.name}</span>
                <p className="text-xs text-muted-foreground">{source.ownership} — {source.ownerName}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
