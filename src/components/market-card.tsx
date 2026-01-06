"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RiskBadge } from "./risk-badge"
import { VolumeIndicator } from "./volume-indicator"
import { NewsModal } from "./news-modal"
import { Sparkline } from "./sparkline"
import { TrendingUp, TrendingDown, ArrowRight, Loader2, X } from "lucide-react"
import { MarketAnalysis } from "@/types/market"

interface MarketCardProps {
  quote: MarketAnalysis
  onRemove?: () => void
}

type ChartRange = '1d' | '1mo' | '1y'

export function MarketCard({ quote, onRemove }: MarketCardProps) {
  const [isNewsOpen, setIsNewsOpen] = useState(false)
  const [charts, setCharts] = useState<Record<ChartRange, number[] | null>>({
    '1d': null,
    '1mo': null,
    '1y': null
  })
  const [loadingRange, setLoadingRange] = useState<ChartRange | null>(null)

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

  const fetchChart = async (range: ChartRange) => {
    if (charts[range] || loadingRange) return
    try {
      setLoadingRange(range)
      const res = await fetch(`/api/chart/${quote.symbol}?range=${range}`)
      if (res.ok) {
        const data = await res.json()
        setCharts(prev => ({ ...prev, [range]: data.prices }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRange(null)
    }
  }

  return (
    <>
      <Card className="group relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-md p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
        {/* Decorative corner elements - Yellow themed */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rotate-45 border border-primary/20 transition-all group-hover:border-primary/50" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 -rotate-12 border border-primary/10 transition-all group-hover:border-primary/30" />

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-background/50 border border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all opacity-0 group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="relative">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase border-b-2 border-primary/40 group-hover:border-primary transition-all">
                  {quote.symbol}
                </h3>
                <span className="rounded bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground tracking-widest uppercase shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]">
                  {quote.assetType || 'Stock'}
                </span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground line-clamp-1 opacity-70 uppercase tracking-tight">{quote.name}</p>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5 shadow-inner">
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

          {/* Market Ranges Section - Request: Monthly Explorer with Sparklines */}
          <div className="mb-6 space-y-3">
            {/* Daily Range */}
            <div
              className="group/range relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 transition-all cursor-crosshair overflow-visible"
              onMouseEnter={() => fetchChart('1d')}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Intraday Tier</span>
                {loadingRange === '1d' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </div>
              <div className="flex justify-between items-center group-hover/range:opacity-10 transition-opacity">
                <span className="text-xs font-bold text-foreground">{formatPrice(quote.dayLow)}</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-white/10" />
                <span className="text-xs font-bold text-foreground">{formatPrice(quote.dayHigh)}</span>
              </div>
              {/* Trend Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0 group-hover/range:opacity-100 transition-opacity z-10">
                {charts['1d'] && <Sparkline data={charts['1d']} width={240} height={40} isPositive={isPositive} />}
              </div>
            </div>

            {/* Monthly Range */}
            <div
              className="group/range relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 transition-all cursor-crosshair overflow-visible"
              onMouseEnter={() => fetchChart('1mo')}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Monthly Explorer</span>
                {loadingRange === '1mo' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </div>
              <div className="flex justify-between items-center group-hover/range:opacity-10 transition-opacity">
                <span className="text-xs font-bold text-foreground/70 uppercase">30D Analysis</span>
                <div className="h-px flex-1 mx-3 bg-white/5" />
                <span className="text-xs font-bold text-foreground/70 uppercase">Market Flow</span>
              </div>
              {/* Trend Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0 group-hover/range:opacity-100 transition-opacity z-10">
                {charts['1mo'] && <Sparkline data={charts['1mo']} width={240} height={40} isPositive={(charts['1mo'][charts['1mo'].length - 1] > charts['1mo'][0])} />}
              </div>
            </div>

            {/* Yearly Range */}
            <div
              className="group/range relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/40 transition-all cursor-crosshair overflow-visible"
              onMouseEnter={() => fetchChart('1y')}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">52-Week Range</span>
                {loadingRange === '1y' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </div>
              <div className="flex justify-between items-center group-hover/range:opacity-10 transition-opacity">
                <span className="text-xs font-bold text-foreground/50">{formatPrice(quote.fiftyTwoWeekLow)}</span>
                <div className="h-1 flex-1 mx-3 rounded-full bg-white/5" />
                <span className="text-xs font-bold text-foreground/50">{formatPrice(quote.fiftyTwoWeekHigh)}</span>
              </div>
              {/* Trend Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-2 opacity-0 group-hover/range:opacity-100 transition-opacity z-10">
                {charts['1y'] && <Sparkline data={charts['1y']} width={240} height={40} isPositive={(charts['1y'][charts['1y'].length - 1] > charts['1y'][0])} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">Market Cap</span>
              <span className="text-sm font-black text-foreground">{formatMarketCap(quote.marketCap)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">P/E Ratio</span>
              <span className="text-sm font-black text-foreground">{quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A"}</span>
            </div>
          </div>

          {/* Volume Indicator */}
          <div className="mb-4">
            <VolumeIndicator volume={quote.volume} />
          </div>

          {/* Metrics & Activity Stack */}
          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Activity Index</p>
                <div className="flex items-center gap-1.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 w-1 rounded-sm transition-all duration-500 ${i < quote.score
                        ? "bg-primary shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]"
                        : "bg-white/5"
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-[10px] font-black text-primary">{quote.score}/10</span>
                </div>
              </div>
              <RiskBadge volume={quote.volume} assetType={quote.assetType} riskLevel={quote.riskLevel} />
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-white/[0.02] rounded-xl p-3 border border-white/5">
              {quote.peRatio !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">P/E Ratio</span>
                  <span className="text-xs font-bold text-foreground">{quote.peRatio.toFixed(2)}</span>
                </div>
              )}
              {quote.eps !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">EPS (TTM)</span>
                  <span className="text-xs font-bold text-foreground">{quote.eps.toFixed(2)}</span>
                </div>
              )}
              {quote.dividendYield !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Div Yield</span>
                  <span className="text-xs font-bold text-foreground">{(quote.dividendYield).toFixed(2)}%</span>
                </div>
              )}
              {quote.beta !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Beta (5Y)</span>
                  <span className="text-xs font-bold text-foreground">{quote.beta.toFixed(2)}</span>
                </div>
              )}
              {quote.exchangeName && (
                <div className="flex flex-col col-span-2 border-t border-white/5 pt-2 mt-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Exchange</span>
                  <span className="text-[10px] font-bold text-foreground/60 truncate uppercase tracking-tight">
                    {quote.exchangeName.replace('Toronto Stock Exchange', 'Toronto')}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-white/5 px-3 py-1 text-[9px] font-black text-muted-foreground border border-white/5 uppercase tracking-tighter">
                {quote.region || 'Global'}
              </span>
              <button
                onClick={() => setIsNewsOpen(true)}
                className="flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary/80 transition-all uppercase tracking-[0.1em]"
              >
                News Analytics
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
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
