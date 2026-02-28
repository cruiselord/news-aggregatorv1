"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { topics, sources, nigerianStates } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const biasColors: Record<string, { bg: string; text: string }> = {
  "pro-gov": { bg: "bg-[#1565C0]/10", text: "text-[#1565C0]" },
  independent: { bg: "bg-[#2E7D32]/10", text: "text-[#2E7D32]" },
  opposition: { bg: "bg-[#B71C1C]/10", text: "text-[#B71C1C]" },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [followedSources, setFollowedSources] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState("")

  const toggleTopic = (slug: string) => {
    setSelectedTopics((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )
  }

  const toggleSource = (id: string) => {
    setFollowedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% complete</span>
        </div>
        <Progress value={(step / 3) * 100} className="mb-8 h-2 bg-secondary [&>[data-slot=progress-indicator]]:bg-[#008751]" />

        {/* Step 1: Topics */}
        {step === 1 && (
          <div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Choose Your Topics</h2>
            <p className="mb-6 text-sm text-muted-foreground">Select topics you want to follow</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {topics.map((topic) => {
                const selected = selectedTopics.includes(topic.slug)
                return (
                  <button
                    key={topic.slug}
                    onClick={() => toggleTopic(topic.slug)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      selected
                        ? "border-[#008751] bg-[#008751]/5"
                        : "border-border bg-card hover:bg-accent"
                    }`}
                  >
                    <span className="text-2xl">{topic.icon}</span>
                    <span className="text-sm font-medium text-foreground">{topic.name}</span>
                    {selected && <Check className="h-4 w-4 text-[#008751]" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Sources */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Follow Nigerian Sources</h2>
            <p className="mb-6 text-sm text-muted-foreground">Choose outlets to follow in your feed</p>
            <div className="flex flex-col gap-2">
              {sources.map((source) => {
                const followed = followedSources.includes(source.id)
                const style = biasColors[source.bias]
                return (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} font-bold ${style.text}`}>
                        {source.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{source.name}</p>
                        <Badge className={`${style.bg} ${style.text} text-xs capitalize`}>
                          {source.bias.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant={followed ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSource(source.id)}
                      className={followed ? "bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90" : ""}
                    >
                      {followed ? "Following" : "Follow"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: State */}
        {step === 3 && (
          <div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Your State</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Select your state for localized news coverage
            </p>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            className="bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90"
          >
            {step === 3 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
