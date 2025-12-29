import { MarketQuote } from '@/types/market';

export function calculateActivityScore(quote: MarketQuote): number {
    let score = 5; // Base score

    const absChange = Math.abs(quote.changePercent);
    const volRatio = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 1;

    // Price impact
    if (absChange > 10) score += 3;
    else if (absChange > 5) score += 2;
    else if (absChange > 2) score += 1;

    // Volume impact
    if (volRatio > 2.0) score += 2;
    else if (volRatio > 1.5) score += 1;
    else if (volRatio < 0.5) score -= 1;

    // Clamp 1-10
    return Math.min(Math.max(score, 1), 10);
}

export function getTrendDirection(change: number): 'UP' | 'DOWN' | 'FLAT' {
    if (change > 0.05) return 'UP';
    if (change < -0.05) return 'DOWN';
    return 'FLAT';
}
