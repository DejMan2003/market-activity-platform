"use client"

import { useState, useEffect, useMemo } from "react"
import { MarketCard } from "./market-card"
import { TrendingUp, Activity, Globe, Zap, RefreshCw, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MarketAnalysis } from "@/types/market"

export function Dashboard() {
  const [marketData, setMarketData] = useState<MarketAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>("All")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Call the API route
      const res = await fetch('/api/market', { cache: 'no-store' })

      if (!res.ok) throw new Error('API fetch failed')

      const json = await res.json() as MarketAnalysis[]

      // Enhance data with inferred metadata (Region, AssetType)
      const enhancedData = json.map(item => {
        let region = "US"
        let assetType = "Stock"

        if (item.symbol.endsWith('.TO')) region = "Canada"
        else if (item.symbol.endsWith('.L')) region = "UK"
        else if (item.symbol.includes('-USD')) {
          region = "Global"
          assetType = "Crypto"
        }

        // Simple heuristic for ETFs
        if (['VOO', 'SPY', 'QQQ', 'IVV', 'VTI'].includes(item.symbol)) {
          assetType = "ETF"
        }

        return {
          ...item,
          region,
          assetType
        }
      })

      setMarketData(enhancedData)
    } catch (err) {
      console.error(err)
      setError('Market data currently unavailable. Please check back later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Poll every minute
    return () => clearInterval(interval)
  }, [])

  const filteredData = useMemo(() => {
    return selectedRegion === "All" ? marketData : marketData.filter((item) => item.region === selectedRegion)
  }, [marketData, selectedRegion])

  // Aggregate regions from data
  const regions = useMemo(() => {
    const allRegions = new Set(marketData.map(m => m.region || 'Global'))
    return ["All", ...Array.from(allRegions).sort()]
  }, [marketData])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative geometric elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-64 w-64 rotate-45 border-2 border-primary/20" />
        <div className="absolute -left-24 top-48 h-48 w-48 rotate-12 border-2 border-accent/20" />
        <div className="absolute bottom-32 right-48 h-56 w-56 -rotate-12 border-2 border-secondary/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 border border-primary/40">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-balance">
                Market Sense <span className="text-primary">AI</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Educational market analytics powered by AI. Explore trends across stocks, ETFs, options, and crypto.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start md:self-center flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? 'Updating...' : 'Refresh Data'}
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-primary/40 bg-card/50 backdrop-blur-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 h-16 w-16 rotate-12 border border-primary/20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Active Markets</p>
              </div>
              <p className="text-3xl font-bold text-primary">{marketData.length}</p>
            </div>
          </Card>

          <Card className="border-accent/40 bg-card/50 backdrop-blur-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 h-16 w-16 -rotate-12 border border-accent/20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-muted-foreground">High Activity</p>
              </div>
              <p className="text-3xl font-bold text-accent">{marketData.filter((m) => m.score >= 7).length}</p>
            </div>
          </Card>

          <Card className="border-secondary/40 bg-card/50 backdrop-blur-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 h-16 w-16 rotate-45 border border-secondary/20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-secondary" />
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
              </div>
              <p className="text-3xl font-bold text-secondary">
                {marketData.length > 0
                  ? (marketData.reduce((acc, m) => acc + m.score, 0) / marketData.length).toFixed(1)
                  : "0"}
              </p>
            </div>
          </Card>

          <Card className="border-primary/40 bg-card/50 backdrop-blur-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 h-16 w-16 -rotate-45 border border-primary/20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Regions</p>
              </div>
              <p className="text-3xl font-bold text-primary">{new Set(marketData.map((m) => m.region)).size}</p>
            </div>
          </Card>
        </div>

        {/* Region Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-lg font-medium transition-all relative overflow-hidden ${selectedRegion === region
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 text-foreground hover:bg-card border border-border"
                  }`}
              >
                {selectedRegion === region && (
                  <div className="absolute inset-0 -rotate-45 border-r border-primary-foreground/20" />
                )}
                <span className="relative">{region}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive">
            <AlertTriangle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Market Cards Grid */}
        {loading && marketData.length === 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-card/50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((quote) => (
              <MarketCard key={quote.symbol} quote={quote} />
            ))}
          </div>
        )}

        {/* Educational Disclaimer */}
        <Card className="mt-12 border-muted/40 bg-card/30 backdrop-blur-sm p-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            <span className="font-semibold text-foreground">Educational Purpose Only:</span> Market Sense AI provides
            informational content for learning. This is not financial advice. Always conduct your own research and
            consult with financial professionals before making investment decisions.
          </p>
        </Card>
      </div>
    </div>
  )
}
