import { MarketQuote } from '@/types/market';

export function calculateActivityScore(quote: MarketQuote): number {
    let score = 5; // Base score

    // Avoid division by zero
    const avgVolume = quote.avgVolume || 1;
    const absChange = Math.abs(quote.changePercent);
    const volRatio = quote.volume / avgVolume;
    const isCrypto = quote.assetType === 'Crypto';
    const isIndex = quote.assetType === 'Index';

    // Price Change Impact (40% weight)
    let changeScore = 0;
    if (isIndex) {
        if (absChange > 3.0) changeScore = 4;
        else if (absChange > 2.0) changeScore = 3;
        else if (absChange > 1.0) changeScore = 2;
        else if (absChange > 0.5) changeScore = 1;
    } else if (isCrypto) {
        if (absChange > 15.0) changeScore = 4;
        else if (absChange > 10.0) changeScore = 3;
        else if (absChange > 5.0) changeScore = 2;
        else if (absChange > 2.0) changeScore = 1;
    } else {
        // Regular Stocks/ETFs
        if (absChange > 15.0) changeScore = 4;
        else if (absChange > 8.0) changeScore = 3;
        else if (absChange > 3.0) changeScore = 2;
        else if (absChange > 1.0) changeScore = 1;
    }
    score += changeScore;

    // Volume Impact (30% weight) - Relative Volume (RVOL)
    let volScore = 0;
    // Cap ratio impact to avoid skewing by anomalies
    if (quote.avgVolume > 0) { // Only score volume if we have history
        if (volRatio > 5.0) volScore = 3;
        else if (volRatio > 2.5) volScore = 2;
        else if (volRatio > 1.2) volScore = 1;
        else if (volRatio < 0.2) volScore = -1;
    }
    score += volScore;

    // Market Cap Impact (Small caps can be more volatile/active)
    // Optional tweak: slight boost for very high volume on small caps could be "Hottest"

    // Proximity to High/Low (Activity usually higher near extremes)
    if (quote.fiftyTwoWeekHigh && quote.price) {
        const nearHigh = quote.price / quote.fiftyTwoWeekHigh > 0.95;
        if (nearHigh) score += 1;
    }

    // Clamp 1-10
    return Math.min(Math.max(Math.round(score), 1), 10);
}

export function getTrendDirection(change: number): 'UP' | 'DOWN' | 'FLAT' {
    if (change > 0.1) return 'UP';
    if (change < -0.1) return 'DOWN';
    return 'FLAT';
}
