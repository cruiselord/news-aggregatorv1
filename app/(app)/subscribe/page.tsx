"use client"

import { useState } from "react"
import { Check, Star, Zap, Shield, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Essential media bias tracking",
    current: true,
    features: [
      "5 stories per day",
      "Basic bias indicators",
      "Daily quiz",
      "Community leaderboard",
    ],
  },
  {
    name: "Pro",
    price: "2,500",
    period: "/month",
    description: "Full access to all NaijaPulse features",
    current: false,
    popular: true,
    features: [
      "Unlimited stories",
      "Full bias breakdowns",
      "Source ownership data",
      "Blindspot alerts",
      "My Bias Dashboard",
      "Story timelines",
      "Daily briefing email",
      "Priority support",
    ],
  },
  {
    name: "Newsroom",
    price: "15,000",
    period: "/month",
    description: "For media professionals and organizations",
    current: false,
    features: [
      "Everything in Pro",
      "API access",
      "Custom dashboards",
      "Team accounts (up to 10)",
      "Export data & reports",
      "White-label embed widgets",
      "Dedicated account manager",
    ],
  },
]

export default function SubscribePage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground text-balance">
          Upgrade Your Media Literacy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get deeper insights into Nigerian media bias and coverage patterns
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-[#008751]" : "bg-border"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#ffffff] transition-transform ${annual ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
            <Badge className="ml-2 bg-[#008751] text-[#ffffff] text-xs">Save 20%</Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl border-2 bg-card p-6 ${
              plan.popular
                ? "border-[#008751] shadow-lg"
                : plan.current
                ? "border-border"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#008751] text-[#ffffff] px-3 py-1 text-xs">
                Most Popular
              </Badge>
            )}
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-foreground">
                {plan.price === "0" ? "Free" : `N${annual ? Math.round(parseInt(plan.price.replace(",", "")) * 0.8).toLocaleString() : plan.price}`}
              </span>
              {plan.price !== "0" && (
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              )}
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#008751]" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`mt-6 w-full ${
                plan.popular
                  ? "bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90"
                  : plan.current
                  ? ""
                  : ""
              }`}
              variant={plan.popular ? "default" : "outline"}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : `Get ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mx-auto mt-12 max-w-4xl">
        <h2 className="mb-6 text-center text-xl font-bold text-foreground">
          Why Go Pro?
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD700]" />
            <div>
              <p className="font-semibold text-foreground">Blindspot Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when stories are only covered from one perspective
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#008751]" />
            <div>
              <p className="font-semibold text-foreground">Deep Analytics</p>
              <p className="text-sm text-muted-foreground">
                Track your reading habits and bias exposure over time
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#1565C0]" />
            <div>
              <p className="font-semibold text-foreground">Source Transparency</p>
              <p className="text-sm text-muted-foreground">
                See ownership, funding, and editorial stance for every outlet
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
            <Star className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6D00]" />
            <div>
              <p className="font-semibold text-foreground">Exclusive Content</p>
              <p className="text-sm text-muted-foreground">
                Access in-depth media analysis and weekly bias reports
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
