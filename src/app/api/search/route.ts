import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        if (!FINNHUB_API_KEY) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Use Finnhub symbol lookup
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status}`);
        }

        const data = await response.json();

        // Map Finnhub results to our format
        const suggestions = (data.result || []).slice(0, 10).map((item: any) => ({
            symbol: item.symbol,
            name: item.description || item.symbol,
            type: item.type || 'Common Stock',
            exchange: item.displaySymbol || item.symbol
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
