// shared utilities used across both server and client components

export function classifyBias(
  label: string | null | undefined
): "pro-gov" | "independent" | "opposition" {
  if (!label) return "independent";
  const lower = label.toLowerCase();
  if (lower.includes("pro-federal") || lower.includes("pro-gov")) return "pro-gov";
  if (lower.includes("opposition")) return "opposition";
  return "independent";
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
