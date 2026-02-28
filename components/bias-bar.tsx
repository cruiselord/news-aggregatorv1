interface BiasBarProps {
  proGov: number
  independent: number
  opposition: number
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

export function BiasBar({ proGov, independent, opposition, size = "sm", showLabels = false }: BiasBarProps) {
  const height = size === "lg" ? "h-6" : size === "md" ? "h-4" : "h-2"

  return (
    <div>
      <div className={`flex w-full overflow-hidden rounded-full ${height}`}>
        {proGov > 0 && (
          <div
            className="bg-[#1565C0] transition-all"
            style={{ width: `${proGov}%` }}
          />
        )}
        {independent > 0 && (
          <div
            className="bg-[#2E7D32] transition-all"
            style={{ width: `${independent}%` }}
          />
        )}
        {opposition > 0 && (
          <div
            className="bg-[#B71C1C] transition-all"
            style={{ width: `${opposition}%` }}
          />
        )}
      </div>
      {showLabels && (
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#1565C0]" />
            Pro-Gov {proGov}%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2E7D32]" />
            Independent {independent}%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#B71C1C]" />
            Opposition {opposition}%
          </span>
        </div>
      )}
    </div>
  )
}
