"use client"

import { BarChart3 } from "lucide-react"

interface VolumeIndicatorProps {
  volume: number
}

export function VolumeIndicator({ volume }: VolumeIndicatorProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) {
      return `${(vol / 1000000000).toFixed(2)}B`
    } else if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(2)}M`
    } else if (vol >= 1000) {
      return `${(vol / 1000).toFixed(2)}K`
    }
    return vol.toString()
  }

  const getVolumeLevel = (vol: number) => {
    if (vol > 50000000) return { width: "w-full", color: "bg-primary" }
    if (vol > 10000000) return { width: "w-3/4", color: "bg-accent" }
    if (vol > 1000000) return { width: "w-1/2", color: "bg-secondary" }
    return { width: "w-1/4", color: "bg-muted" }
  }

  const volumeLevel = getVolumeLevel(volume)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Volume</span>
        </div>
        <span className="text-xs font-semibold">{formatVolume(volume)}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/30">
        <div className={`h-full transition-all ${volumeLevel.width} ${volumeLevel.color}`} />
      </div>
    </div>
  )
}
