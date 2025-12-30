import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await context.params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1d';

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        let period1: Date;
        let interval: "15m" | "1h" | "1d" = "15m";

        switch (range) {
            case '5d':
                period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                interval = "1h";
                break;
            case '1y':
                period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                interval = "1d";
                break;
            case '1d':
            default:
                period1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
                interval = "15m";
        }

        const result = await yahooFinance.chart(symbol, {
            period1,
            interval
        });

        const prices = result.quotes
            .map(q => q.close)
            .filter((p): p is number => p !== null && p !== undefined);

        return NextResponse.json({
            symbol: result.meta.symbol,
            range,
            prices,
            previousClose: result.meta.previousClose || prices[0]
        });
    } catch (error) {
        console.error(`Error fetching ${range} chart for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
