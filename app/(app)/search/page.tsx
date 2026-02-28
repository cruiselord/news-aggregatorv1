"use client"

import { useState } from "react"
import Link from "next/link"
import { Search as SearchIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { stories, sources, topics, trendingItems } from "@/lib/mock-data"
import { StoryCard } from "@/components/story-card"
import { BiasBar } from "@/components/bias-bar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const dateFilters = ["Last 24h", "Last week", "Last month", "Custom range"]
const biasFilters = ["All", "Pro-Gov", "Independent", "Opposition"]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [activeDate, setActiveDate] = useState("Last week")
  const [activeBias, setActiveBias] = useState("All")

  const filteredStories = query
    ? stories.filter(
        (s) =>
          s.headline.toLowerCase().includes(query.toLowerCase()) ||
          s.summary.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const filteredSources = query
    ? sources.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const filteredTopics = query
    ? topics.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const hasQuery = query.length > 0
  const hasResults = filteredStories.length > 0 || filteredSources.length > 0 || filteredTopics.length > 0

  return (
    <div className="p-6">
      {/* Large Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics, sources, or stories..."
          className="h-14 rounded-xl bg-secondary pl-12 pr-10 text-lg"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Pre-search suggestions */}
      {!hasQuery && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recent searches:</h3>
            <div className="flex flex-wrap gap-2">
              {["Fuel subsidy", "ASUU Strike", "Naira exchange"].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Trending:</h3>
            <div className="flex flex-wrap gap-2">
              {trendingItems.slice(0, 5).map((item) => (
                <button
                  key={item.topic}
                  onClick={() => setQuery(item.topic)}
                  className="rounded-full bg-[#008751]/10 px-3 py-1.5 text-sm text-[#008751] hover:bg-[#008751]/20"
                >
                  {item.topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      {hasQuery && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Date:</span>
            {dateFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveDate(f)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  activeDate === f ? "bg-[#008751] text-[#ffffff]" : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">Bias:</span>
            {biasFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveBias(f)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  activeBias === f ? "bg-[#008751] text-[#ffffff]" : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && (
        <div className="mt-6 flex gap-0">
          <div className="flex-1">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="stories">Stories</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {!hasResults && (
                  <div className="py-12 text-center">
                    <p className="text-lg font-medium text-foreground">No results found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
                  </div>
                )}

                {/* Story Results */}
                {filteredStories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Stories</h3>
                    <div className="flex flex-col gap-3">
                      {filteredStories.map((s) => (
                        <StoryCard key={s.id} story={s} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Results */}
                {filteredSources.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Sources</h3>
                    <div className="flex flex-col gap-2">
                      {filteredSources.map((source) => {
                        const colors = {
                          "pro-gov": { bg: "bg-[#1565C0]/10", text: "text-[#1565C0]" },
                          independent: { bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]" },
                          opposition: { bg: "bg-[#B71C1C]/10", text: "text-[#B71C1C]" },
                        }
                        const style = colors[source.bias]
                        return (
                          <Link key={source.id} href={`/source/${source.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-md">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} font-bold ${style.text}`}>
                              {source.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{source.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{source.bias.replace("-", " ")} · Factuality: {source.factuality}/10</p>
                            </div>
                            <Button variant="outline" size="sm">Follow</Button>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Topic Results */}
                {filteredTopics.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {filteredTopics.map((t) => (
                        <Link key={t.slug} href={`/topic/${t.slug}`}>
                          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                            {t.icon} {t.name} — {t.storyCount} stories
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stories" className="mt-4">
                <div className="flex flex-col gap-3">
                  {(filteredStories.length > 0 ? filteredStories : stories).map((s) => (
                    <StoryCard key={s.id} story={s} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                <div className="flex flex-col gap-2">
                  {(filteredSources.length > 0 ? filteredSources : sources).map((source) => (
                    <Link key={source.id} href={`/source/${source.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-md">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-foreground">
                        {source.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{source.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{source.bias.replace("-", " ")} · {source.factuality}/10</p>
                      </div>
                      <Button variant="outline" size="sm">Follow</Button>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="topics" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {(filteredTopics.length > 0 ? filteredTopics : topics).map((t) => (
                    <Link key={t.slug} href={`/topic/${t.slug}`}>
                      <Badge variant="secondary" className="px-4 py-2 text-sm">
                        {t.icon} {t.name} — {t.storyCount} stories
                      </Badge>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="ml-6 hidden w-[260px] shrink-0 lg:block">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Related Searches</h3>
              <div className="flex flex-col gap-1">
                {["Nigeria economy 2026", "Election coverage bias", "Oil price Nigeria"].map((term) => (
                  <button key={term} onClick={() => setQuery(term)} className="text-left text-sm text-[#008751] hover:underline">
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Trending Searches</h3>
              <div className="flex flex-col gap-1">
                {trendingItems.slice(0, 5).map((item) => (
                  <button key={item.topic} onClick={() => setQuery(item.topic)} className="text-left text-sm text-foreground hover:text-[#008751]">
                    {item.topic} ({item.articleCount})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
