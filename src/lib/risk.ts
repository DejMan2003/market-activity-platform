import { MarketQuote, RiskLevel } from '@/types/market';

export function assessRisk(quote: MarketQuote): { level: RiskLevel; reason?: string } {
    const { changePercent, volume, avgVolume } = quote;
    const absChange = Math.abs(changePercent);

    // Volume spike detection (>50% above average)
    const isVolumeSpike = avgVolume > 0 && volume > avgVolume * 1.5;

    if (absChange > 10) {
        return { level: 'VOLATILE', reason: 'Extreme price movement (>10%)' };
    }

    if (absChange > 5) {
        return { level: 'HIGH', reason: 'Significant price movement (>5%)' };
    }

    if (isVolumeSpike) {
        return { level: 'HIGH', reason: 'Unusual high volume detected' };
    }

    if (absChange > 2) {
        return { level: 'MEDIUM', reason: 'Moderate price fluctuation' };
    }

    return { level: 'LOW' };
}
