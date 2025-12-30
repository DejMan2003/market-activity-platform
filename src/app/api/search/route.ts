import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const results = await yahooFinance.search(query, {
            newsCount: 0,
            quotesCount: 10
        });

        // Map quotes to a simpler format for suggestion list
        const suggestions = results.quotes.map((q: any) => ({
            symbol: q.symbol,
            name: q.shortname || q.longname || q.symbol,
            type: q.quoteType,
            exchange: q.exchange
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
