import { fetchMarketData } from '@/lib/yahoo-client';
import { calculateActivityScore, getTrendDirection } from '@/lib/scoring';
import { assessRisk } from '@/lib/risk';
import { MarketAnalysis } from '@/types/market';

export async function getAnalyzedMarketData(): Promise<MarketAnalysis[]> {
    try {
        const rawQuotes = await fetchMarketData();

        const analyzedData: MarketAnalysis[] = rawQuotes.map((quote) => {
            const risk = assessRisk(quote);
            const score = calculateActivityScore(quote);
            const trendDirection = getTrendDirection(quote.changePercent);

            return {
                ...quote,
                score,
                riskLevel: risk.level,
                riskReason: risk.reason,
                trendDirection,
            };
        });

        // Sort by activity score descending (hottest items first)
        analyzedData.sort((a, b) => b.score - a.score);

        return analyzedData;
    } catch (error) {
        console.error('Extraction Error:', error);
        throw error;
    }
}
