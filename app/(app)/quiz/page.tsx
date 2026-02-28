"use client"

import { useState } from "react"
import Link from "next/link"
import { Share2, Home, Trophy } from "lucide-react"
import { quizQuestions } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = quizQuestions[currentQ]
  const isCorrect = selected === question?.correct
  const answered = selected !== null

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    if (index === question.correct) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ((prev) => prev + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  if (finished) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/20">
              <Trophy className="h-8 w-8 text-[#FFD700]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Quiz Complete!</h1>
          <p className="mt-2 text-4xl font-bold text-[#008751]">
            {score}/{quizQuestions.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You earned <span className="font-bold text-[#FFD700]">+{score * 25} NP</span> points
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" /> Share Score
            </Button>
            <Button asChild className="bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Back to Feed
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQ + 1} of {quizQuestions.length}</span>
          <span className="font-medium text-[#FFD700]">+25 NP</span>
        </div>
        <Progress
          value={((currentQ + 1) / quizQuestions.length) * 100}
          className="mb-6 h-2 bg-secondary [&>[data-slot=progress-indicator]]:bg-[#008751]"
        />

        {/* Question Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">{question.question}</h2>

          <div className="mt-6 flex flex-col gap-3">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index)
              let buttonStyle = "border-border bg-card text-foreground hover:bg-accent"

              if (answered) {
                if (index === question.correct) {
                  buttonStyle = "border-[#008751] bg-[#008751]/10 text-[#008751]"
                } else if (index === selected && !isCorrect) {
                  buttonStyle = "border-[#B71C1C] bg-[#B71C1C]/10 text-[#B71C1C]"
                } else {
                  buttonStyle = "border-border bg-card text-muted-foreground opacity-50"
                }
              } else if (index === selected) {
                buttonStyle = "border-[#008751] bg-[#008751]/5 text-foreground"
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={answered}
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors ${buttonStyle}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {letter}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className={`mt-4 rounded-lg p-4 ${isCorrect ? "bg-[#008751]/5" : "bg-[#B71C1C]/5"}`}>
              <p className={`text-sm font-medium ${isCorrect ? "text-[#008751]" : "text-[#B71C1C]"}`}>
                {isCorrect ? "Correct!" : "Incorrect!"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {answered && (
            <Button
              onClick={handleNext}
              className="mt-4 w-full bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90"
            >
              {currentQ < quizQuestions.length - 1 ? "Next Question →" : "See Results"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
