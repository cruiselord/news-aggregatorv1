"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Bell, Star, Moon, Sun } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useTheme } from "next-themes"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: authData } = await supabase.auth.getUser()
      const current = authData?.user ?? null
      if (!mounted) return
      setUser(current)

      if (current) {
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("display_name, avatar_url, naira_points")
          .eq("id", current.id)
          .maybeSingle()

        if (mounted) setProfile(prof ?? null)
      } else {
        setProfile(null)
      }
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        // fetch profile for signed-in user
        supabase
          .from("user_profiles")
          .select("display_name, avatar_url, naira_points")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => setProfile(data ?? null))
      }
    })

    return () => {
      mounted = false
      listener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
          </Button>
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

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008751] text-xs font-bold text-[#ffffff]">
                  {profile?.display_name
                    ? String(profile.display_name)
                        .split(" ")
                        .map((s: string) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : (user.email || "").slice(0, 2).toUpperCase()}
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <Star className="h-3.5 w-3.5 text-[#FFD700]" /> {profile?.naira_points ?? 0} NP
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
