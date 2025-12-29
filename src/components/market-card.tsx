"use client"

import { Card } from "@/components/ui/card"
import { RiskBadge } from "./risk-badge"
import { VolumeIndicator } from "./volume-indicator"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { MarketAnalysis } from "@/types/market"

interface MarketCardProps {
  quote: MarketAnalysis
}

export function MarketCard({ quote }: MarketCardProps) {
  const isPositive = quote.changePercent > 0
  const priceColor = isPositive ? "text-primary" : "text-destructive"

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/70 backdrop-blur-sm p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Decorative corner elements */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rotate-45 border border-primary/10 transition-all group-hover:border-primary/30" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 -rotate-12 border border-accent/10 transition-all group-hover:border-accent/30" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-2xl font-bold tracking-tight">{quote.symbol}</h3>
              <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {quote.assetType || 'Stock'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{quote.name}</p>
          </div>
          <RiskBadge volume={quote.volume} assetType={quote.assetType} riskLevel={quote.riskLevel} />
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              $
              {quote.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${priceColor}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositive ? "+" : ""}
              {quote.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Volume Indicator */}
        <VolumeIndicator volume={quote.volume} />

        {/* Activity Score */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Activity Score</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i < quote.score
                        ? i < 3
                          ? "bg-primary"
                          : i < 7
                            ? "bg-accent"
                            : "bg-secondary"
                        : "bg-muted"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{quote.score}/10</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-primary transition-all hover:gap-2">
            Details
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Region Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-xs font-medium">
            {quote.region || 'Global'}
          </span>
        </div>
      </div>
    </Card>
  )
}
