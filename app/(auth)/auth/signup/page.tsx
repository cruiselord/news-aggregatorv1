"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")

  const usernameAvailable = username.length >= 3

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-[#008751]">NaijaPulse</Link>
          <p className="mt-2 text-sm text-muted-foreground">Create your media bias tracker account</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/onboarding" }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10"
                />
                {username.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailable ? (
                      <Check className="h-4 w-4 text-[#008751]" />
                    ) : (
                      <X className="h-4 w-4 text-[#B71C1C]" />
                    )}
                  </div>
                )}
              </div>
              {username.length > 0 && (
                <p className={`text-xs ${usernameAvailable ? "text-[#008751]" : "text-[#B71C1C]"}`}>
                  {usernameAvailable ? "Username available" : "Username too short (min 3 characters)"}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-[#B71C1C]">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#008751] text-[#ffffff] hover:bg-[#008751]/90"
            >
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-[#008751] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
