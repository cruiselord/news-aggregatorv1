"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="shrink-0 text-xl font-bold text-[#008751]">
          NaijaPulse
        </Link>

        <div className="mx-8 flex max-w-md flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Nigerian news..."
              className="h-9 w-full rounded-full bg-secondary pl-9 text-sm"
              onClick={() => {
                if (pathname !== "/search") {
                  window.location.href = "/search"
                }
              }}
              readOnly={pathname !== "/search"}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/quiz">
            <Button
              size="sm"
              className="rounded-full bg-[#FFD700] px-4 text-sm font-semibold text-[#171717] hover:bg-[#FFD700]/90"
            >
              Daily Quiz
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/daily-briefing">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#B71C1C]" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
          <Link href="/profile" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008751] text-xs font-bold text-[#ffffff]">
              AO
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <Star className="h-3.5 w-3.5 text-[#FFD700]" /> 240 NP
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
