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
        const data = await fetchChartData(symbol, range);

        if (!data.prices || data.prices.length === 0) {
            return NextResponse.json({ error: 'No chart data available' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching ${range} chart for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
