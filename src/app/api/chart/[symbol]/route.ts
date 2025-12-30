import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await context.params;

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Fetch last 24h of data in 15m intervals
        const period1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await yahooFinance.chart(symbol, {
            period1,
            interval: "15m"
        });

        const prices = result.quotes
            .map(q => q.close)
            .filter((p): p is number => p !== null && p !== undefined);

        return NextResponse.json({
            symbol: result.meta.symbol,
            prices,
            previousClose: result.meta.previousClose || prices[0]
        });
    } catch (error) {
        console.error(`Error fetching chart for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
