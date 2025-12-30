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
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    // UI extensions
    region?: string;
    assetType?: string;
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
    thumbnail?: {
        resolutions: Array<{
            url: string;
            width: number;
            height: number;
            tag: string;
        }>;
    };
    relatedTickers?: string[];
    // AI Analysis Fields
    importance: 1 | 2 | 3 | 4 | 5; // 1 = Trivial, 5 = Critical
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    aiInsight: string;
}
