"use client"

import { AlertTriangle, TrendingUp, Shield, Activity } from "lucide-react"
import { RiskLevel } from "@/types/market"

interface RiskBadgeProps {
  volume: number
  assetType?: string
  riskLevel?: RiskLevel
}

export function RiskBadge({ volume, assetType, riskLevel }: RiskBadgeProps) {
  const getRiskLevel = () => {
    if (riskLevel) {
      switch (riskLevel) {
        case 'VOLATILE': return { level: "Volatile", color: "bg-destructive/20 text-destructive border-destructive/40", icon: Activity }
        case 'HIGH': return { level: "High", color: "bg-orange-500/20 text-orange-500 border-orange-500/40", icon: AlertTriangle }
        case 'MEDIUM': return { level: "Medium", color: "bg-accent/20 text-accent border-accent/40", icon: TrendingUp }
        case 'LOW': return { level: "Low", color: "bg-primary/20 text-primary border-primary/40", icon: Shield }
      }
    }

    if (assetType === "Crypto" || assetType === "Options") {
      return { level: "High", color: "bg-destructive/20 text-destructive border-destructive/40", icon: AlertTriangle }
    }

    if (volume > 50000000) {
      return { level: "Low", color: "bg-primary/20 text-primary border-primary/40", icon: Shield }
    } else if (volume > 10000000) {
      return { level: "Medium", color: "bg-accent/20 text-accent border-accent/40", icon: TrendingUp }
    } else {
      return { level: "High", color: "bg-secondary/20 text-secondary border-secondary/40", icon: AlertTriangle }
    }
  }

  const risk = getRiskLevel()
  const Icon = risk.icon

  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${risk.color}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{risk.level}</span>
    </div>
  )
}
