import { NextResponse } from 'next/server';
import { fetchMarketData } from '@/lib/yahoo';
import { calculateActivityScore, getTrendDirection } from '@/lib/scoring';
import { assessRisk } from '@/lib/risk';
import { MarketAnalysis } from '@/types/market';

export const dynamic = 'force-dynamic'; // Prevent caching to ensure real-time data
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        const rawQuotes = await fetchMarketData();

        if (!rawQuotes || rawQuotes.length === 0) {
            return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
        }

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

        return NextResponse.json(analyzedData);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
