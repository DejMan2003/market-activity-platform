"use client"

import { useState, useEffect, useMemo } from "react"
import { MarketCard } from "./market-card"
import { TrendingUp, Activity, Globe, Zap, RefreshCw, AlertTriangle, GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MarketAnalysis } from "@/types/market"
import { TutorialOverlay } from "./tutorial-overlay"
import { SearchBar } from "./search-bar"

export function Dashboard() {
  const [marketData, setMarketData] = useState<MarketAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>("All")
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("All")
  const [sortOption, setSortOption] = useState<string>("Most Active")
  const [showTutorial, setShowTutorial] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchedQuotes, setSearchedQuotes] = useState<MarketAnalysis[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/market', { cache: 'no-store' })

      if (!res.ok) throw new Error('API fetch failed')

      const json = await res.json() as MarketAnalysis[]
      setMarketData(json)
    } catch (err) {
      console.error(err)
      setError('Market data currently unavailable. Please check back later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSelect = async (symbol: string) => {
    // Add to history
    const newHistory = [symbol, ...searchHistory.filter(h => h !== symbol)].slice(0, 5)
    setSearchHistory(newHistory)
    sessionStorage.setItem("search-history", JSON.stringify(newHistory))

    try {
      setLoading(true)
      const res = await fetch(`/api/market?symbols=${symbol}`)
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setSearchedQuotes(prev => {
            const list = [data[0], ...prev.filter(q => q.symbol !== symbol)]
            return list.slice(0, 3) // Keep last 3 searched items
          })
        }
      }
    } catch (err) {
      console.error("Search fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
    sessionStorage.removeItem("search-history")
  }

  const checkTutorial = () => {
    const hasSeenTutorial = localStorage.getItem("bazaar-tutorial-skip")
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }

    // Load history
    const savedHistory = sessionStorage.getItem("search-history")
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory))
    }
  }

  useEffect(() => {
    fetchData()
    checkTutorial()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredData = useMemo(() => {
    let result = marketData

    // Region Filter
    if (selectedRegion !== "All") {
      result = result.filter((item) => item.region === selectedRegion)
    }

    // Asset Type Filter
    if (assetTypeFilter !== "All") {
      result = result.filter((item) => item.assetType === assetTypeFilter)
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case "Most Active":
          return b.score - a.score
        case "Least Active":
          return a.score - b.score
        case "Highest Price":
          return b.price - a.price
        case "Lowest Price":
          return a.price - b.price
        case "Top Gainers":
          return b.changePercent - a.changePercent
        case "Top Losers":
          return a.changePercent - b.changePercent
        default:
          return 0
      }
    })

    return result
  }, [marketData, selectedRegion, assetTypeFilter, sortOption])

  const regions = useMemo(() => {
    const allRegions = new Set(marketData.map(m => m.region || 'Global'))
    return ["All", ...Array.from(allRegions).sort()]
  }, [marketData])

  const assetTypes = useMemo(() => {
    const allTypes = new Set(marketData.map(m => m.assetType || 'Stock'))
    return ["All", ...Array.from(allTypes).sort()]
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
              <h1 className="text-4xl font-black tracking-tighter text-balance uppercase">
                The <span className="text-primary">Bazaar</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed italic font-medium">
              Explore the global exchange of financial intelligence. Advanced analytics for stocks, indices, and crypto.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-widest text-muted-foreground bg-secondary/10 border border-border/50 rounded-lg hover:bg-secondary/20 hover:text-foreground transition-all"
            >
              <GraduationCap size={16} />
              Tutorial
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar
            onSelect={handleSearchSelect}
            history={searchHistory}
            onClearHistory={clearHistory}
          />
        </div>

        {/* Search Results (Specific Section) */}
        {searchedQuotes.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-foreground">
                Recent Trackers
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchedQuotes.map((quote) => (
                <MarketCard key={quote.symbol} quote={quote} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-primary/40 bg-card/50 backdrop-blur-sm p-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 h-16 w-16 rotate-12 border border-primary/20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Active Stocks</p>
              </div>
              <p className="text-3xl font-bold text-primary">
                {marketData.filter(m => m.assetType === 'Stock').length}
              </p>
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

        {/* Filters & Sorting */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/30 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
          <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Geographic Focus</span>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all relative overflow-hidden border ${selectedRegion === region
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 text-muted-foreground hover:bg-card border-border/50"
                      }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Asset Class</span>
              <div className="flex flex-wrap gap-2">
                {assetTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setAssetTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all relative overflow-hidden border ${assetTypeFilter === type
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card/50 text-muted-foreground hover:bg-card border-border/50"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-48">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Priority Sort</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option>Most Active</option>
              <option>Least Active</option>
              <option>Highest Price</option>
              <option>Lowest Price</option>
              <option>Top Gainers</option>
              <option>Top Losers</option>
            </select>
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
              <Card key={i} className="h-64 animate-pulse bg-card/50 border-border/20" />
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
        <Card className="mt-12 border-muted/20 bg-card/30 backdrop-blur-sm p-6">
          <p className="text-[10px] font-bold text-muted-foreground text-center leading-relaxed uppercase tracking-widest">
            <span className="text-foreground">Risk Disclosure:</span> The Bazaar provides
            informational intelligence for analysis. This is not financial advice. Always conduct your own research and
            consult with financial professionals before making investment decisions.
          </p>
        </Card>
      </div>

      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}
