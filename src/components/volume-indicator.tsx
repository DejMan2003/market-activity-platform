"use client"

import { BarChart3 } from "lucide-react"

interface VolumeIndicatorProps {
  volume: number
}

export function VolumeIndicator({ volume }: VolumeIndicatorProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(2)}K`
    return vol.toString()
  }

  const getVolumeLevel = (vol: number) => {
    if (vol > 50000000) return { width: "w-full", color: "bg-primary shadow-[0_0_10px_var(--color-primary)]" }
    if (vol > 10000000) return { width: "w-3/4", color: "bg-accent shadow-[0_0_10px_var(--color-accent)]" }
    if (vol > 1000000) return { width: "w-1/2", color: "bg-secondary" }
    return { width: "w-1/4", color: "bg-muted" }
  }

  const volumeLevel = getVolumeLevel(volume)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
          <BarChart3 className="h-3 w-3" />
          <span>Volume</span>
        </div>
        <span className="text-xs font-black text-foreground">{formatVolume(volume)}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/20 border border-white/5">
        <div className={`h-full transition-all duration-700 ease-out ${volumeLevel.width} ${volumeLevel.color}`} />
      </div>
    </div>
  )
}
