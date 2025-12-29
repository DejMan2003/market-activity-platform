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
        // Use the search API which includes news articles
        const results = await yahooFinance.search(symbol);

        // Extract and sort news by publish time
        const news = (results.news || []).sort((a: any, b: any) =>
            new Date(b.providerPublishTime).getTime() - new Date(a.providerPublishTime).getTime()
        );

        return NextResponse.json(news);
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
