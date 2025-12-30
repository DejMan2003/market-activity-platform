import { NextResponse } from 'next/server';
import { fetchMarketData } from '@/lib/yahoo';
import { calculateActivityScore, getTrendDirection } from '@/lib/scoring';
import { assessRisk } from '@/lib/risk';
import { MarketAnalysis } from '@/types/market';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbolsParam = searchParams.get('symbols');
        const symbols = symbolsParam ? symbolsParam.split(',') : undefined;

        const rawQuotes = await fetchMarketData(symbols);

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

        analyzedData.sort((a, b) => b.score - a.score);

        return NextResponse.json(analyzedData);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
