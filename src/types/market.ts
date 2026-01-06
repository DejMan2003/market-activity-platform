export interface MarketQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    avgVolume: number; // 3 month average
    marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST';
    currency: string;
    exchange: string;
    // Market Details
    marketCap?: number;
    trailingPE?: number;
    // Price Ranges
    dayHigh?: number;
    dayLow?: number;
    monthHigh?: number;
    monthLow?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    // Financial Metrics
    dividendYield?: number;
    eps?: number;
    peRatio?: number;
    beta?: number;
    // UI extensions
    region?: string;
    assetType?: string;
    exchangeName?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VOLATILE';

export interface MarketAnalysis extends MarketQuote {
    score: number; // activityScore
    riskLevel: RiskLevel;
    riskReason?: string; // e.g., "Volume spike detected"
    trendDirection: 'UP' | 'DOWN' | 'FLAT';
}

export interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: string;
    type: string;
    thumbnail?: string | null;
    relatedTickers?: string[];
    // AI Analysis Fields
    importance: 1 | 2 | 3 | 4 | 5; // 1 = Trivial, 5 = Critical
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    aiInsight: string;
}
