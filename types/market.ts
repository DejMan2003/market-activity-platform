export interface MarketQuote {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  regularMarketVolume: number
  activityScore: number
  region: string
  assetType: string
}

export interface MarketAPIResponse {
  quotes: MarketQuote[]
  timestamp: string
}

export type Region = "US" | "Canada" | "UK" | "Global"
export type AssetType = "Stock" | "ETF" | "Options" | "Crypto"
