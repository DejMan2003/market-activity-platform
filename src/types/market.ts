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
