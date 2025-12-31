import { NextRequest, NextResponse } from 'next/server';
import { fetchChartData } from '@/lib/yahoo';

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
        let resolution: 'D' | '60' | '15' = '15';
        let from: number;
        const to = Math.floor(Date.now() / 1000);

        switch (range) {
            case '1mo':
                from = to - (30 * 24 * 60 * 60); // 30 days ago
                resolution = '60'; // 1 hour candles
                break;
            case '5d':
                from = to - (5 * 24 * 60 * 60); // 5 days ago
                resolution = '60'; // 1 hour candles
                break;
            case '1y':
                from = to - (365 * 24 * 60 * 60); // 1 year ago
                resolution = 'D'; // Daily candles
                break;
            case '1d':
            default:
                from = to - (24 * 60 * 60); // 24 hours ago
                resolution = '15'; // 15 minute candles
        }

        const prices = await fetchChartData(symbol, resolution, from, to);

        if (prices.length === 0) {
            return NextResponse.json({ error: 'No chart data available' }, { status: 404 });
        }

        return NextResponse.json({
            symbol,
            range,
            prices,
            previousClose: prices[0]
        });
    } catch (error) {
        console.error(`Error fetching ${range} chart for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
