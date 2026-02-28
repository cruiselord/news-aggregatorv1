import { stories } from "@/lib/mock-data"
import { StoryCard, BlindspotAlertCard } from "@/components/story-card"

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Top Stories — Today
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>
      <div className="flex flex-col gap-4">
        {stories.map((story, index) => (
          <div key={story.id}>
            <StoryCard story={story} />
            {(index + 1) % 4 === 0 && index < stories.length - 1 && (
              <div className="mt-4">
                <BlindspotAlertCard />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
