import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status}`);
        }

        const data = await response.json();
        const quotes = data.quotes || [];

        // Map Yahoo results to our format
        const suggestions = quotes
            .filter((item: any) => item.isYaConf) // Filter for confident matches if available, or just take all
            .slice(0, 10)
            .map((item: any) => ({
                symbol: item.symbol,
                name: item.shortname || item.longname || item.symbol,
                type: item.typeDisp || 'Stock',
                exchange: item.exchDisp || item.exchange || 'Unknown'
            }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
