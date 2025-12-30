"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RiskBadge } from "./risk-badge"
import { VolumeIndicator } from "./volume-indicator"
import { NewsModal } from "./news-modal"
import { Sparkline } from "./sparkline"
import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react"
import { MarketAnalysis } from "@/types/market"

interface MarketCardProps {
  quote: MarketAnalysis
}

export function MarketCard({ quote }: MarketCardProps) {
  const [isNewsOpen, setIsNewsOpen] = useState(false)
  const [chartData, setChartData] = useState<number[] | null>(null)
  const [loadingChart, setLoadingChart] = useState(false)

  const isPositive = quote.changePercent > 0
  const trendColor = isPositive ? "text-primary font-bold shadow-sm" : "text-destructive font-bold shadow-sm"
  const currencySymbol = quote.currency === 'GBP' ? '£' : '$'

  const formatMarketCap = (cap?: number) => {
    if (!cap) return "N/A"
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`
    return cap.toLocaleString()
  }

  const formatPrice = (val?: number) => val ? `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"

  const fetchChart = async () => {
    if (chartData || loadingChart) return
    try {
      setLoadingChart(true)
      const res = await fetch(`/api/chart/${quote.symbol}`)
      if (res.ok) {
        const data = await res.json()
        setChartData(data.prices)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingChart(false)
    }
  }

  return (
    <>
      <Card className="group relative overflow-hidden border-border/50 bg-card/60 backdrop-blur-md p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
        {/* Decorative corner elements */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rotate-45 border border-primary/10 transition-all group-hover:border-primary/30" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 -rotate-12 border border-accent/10 transition-all group-hover:border-accent/30" />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="relative">
              <div
                className="mb-1 flex items-center gap-2 group/symbol cursor-pointer"
                onMouseEnter={fetchChart}
              >
                <h3 className="text-2xl font-black tracking-tight text-foreground uppercase hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4">
                  {quote.symbol}
                </h3>

                {/* Sparkline Tooltip */}
                <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-48 scale-95 opacity-0 transition-all group-hover/symbol:scale-100 group-hover/symbol:opacity-100">
                  <div className="rounded-xl border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Daily Trend</span>
                      {loadingChart && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    </div>
                    {chartData ? (
                      <Sparkline data={chartData} width={160} height={60} isPositive={isPositive} />
                    ) : !loadingChart && (
                      <div className="flex h-[60px] items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Hover to Load</span>
                      </div>
                    )}
                  </div>
                </div>

                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground tracking-widest uppercase">
                  {quote.assetType || 'Stock'}
                </span>
              </div>
              <p className="text-xs font-medium text-muted-foreground line-clamp-1 opacity-80">{quote.name}</p>
            </div>
            <RiskBadge volume={quote.volume} assetType={quote.assetType} riskLevel={quote.riskLevel} />
          </div>

          {/* Price Section */}
          <div className="mb-6 p-4 rounded-xl bg-background/40 border border-border/20 shadow-inner">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tabular-nums">
                {formatPrice(quote.price)}
              </span>
            </div>
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="tracking-tight">
                {isPositive ? "+" : ""}
                {quote.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Market Ranges Section - Request: Start from Daily and show others below */}
          <div className="mb-6 space-y-4">
            {/* Daily Range */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Daily Range</span>
                <div className="flex gap-2 text-[10px] font-black uppercase">
                  <span className="text-destructive">Low</span>
                  <span className="text-emerald-500">High</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">{formatPrice(quote.dayLow)}</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-muted/30 relative">
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" style={{ left: '50%' }} />
                </div>
                <span className="text-sm font-bold text-foreground">{formatPrice(quote.dayHigh)}</span>
              </div>
            </div>

            {/* Monthly Range */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/10 opacity-80">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Monthly Explorer</span>
                <span className="text-[9px] font-bold text-primary/60 italic">AI Estimate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground/80">{formatPrice(quote.monthLow)}</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-muted/20" />
                <span className="text-sm font-bold text-foreground/80">{formatPrice(quote.monthHigh)}</span>
              </div>
            </div>

            {/* 52-Week Range */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/10 opacity-60">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-balance">52-Week Extremes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground/70">{formatPrice(quote.fiftyTwoWeekLow)}</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-muted/10" />
                <span className="text-sm font-bold text-foreground/70">{formatPrice(quote.fiftyTwoWeekHigh)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Market Cap</span>
              <span className="text-sm font-black text-foreground">{formatMarketCap(quote.marketCap)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">P/E Ratio</span>
              <span className="text-sm font-black text-foreground">{quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A"}</span>
            </div>
          </div>

          {/* Volume Indicator */}
          <div className="mb-4">
            <VolumeIndicator volume={quote.volume} />
          </div>

          {/* Activity Score */}
          <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Activity Score</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all ${i < quote.score
                        ? i < 3
                          ? "bg-primary shadow-[0_0_8px_var(--color-primary)]"
                          : i < 7
                            ? "bg-accent shadow-[0_0_8px_var(--color-accent)]"
                            : "bg-destructive shadow-[0_0_8px_var(--color-destructive)]"
                        : "bg-muted/40"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-foreground">{quote.score}/10</span>
              </div>
            </div>
          </div>

          {/* Region & Footer */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-background px-2 py-1 text-[10px] font-black text-muted-foreground border border-border/50 uppercase">
                {quote.region || 'Global'}
              </span>
            </div>
            <button
              onClick={() => setIsNewsOpen(true)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-tighter"
            >
              More Analytics
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </Card>

      <NewsModal
        symbol={quote.symbol}
        name={quote.name}
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
      />
    </>
  )
}
