import { NextRequest, NextResponse } from 'next/server';
import { NewsItem } from '@/types/market';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

function analyzeNews(title: string, symbol: string): {
    importance: NewsItem['importance'],
    sentiment: NewsItem['sentiment'],
    aiInsight: string
} {
    const t = title.toLowerCase();
    let importance: NewsItem['importance'] = 2;
    let sentiment: NewsItem['sentiment'] = 'NEUTRAL';
    let impact = "";

    const criticalKeywords = ['earnings', 'buyback', 'acquisition', 'merged', 'lawsuit', 'sec', 'fda', 'bankruptcy', 'ceo', 'resigns', 'dividend'];
    const bullishKeywords = ['beat', 'exceeds', 'upgraded', 'outperform', 'buy', 'growth', 'profit', 'expansion', 'partnership', 'bullish', 'up', 'gain', 'surge'];
    const bearishKeywords = ['miss', 'below', 'downgraded', 'underperform', 'sell', 'loss', 'slump', 'decline', 'investigation', 'bearish', 'down', 'fall', 'drop'];

    const matchesCritical = criticalKeywords.filter(k => t.includes(k));
    if (matchesCritical.length > 1) importance = 5;
    else if (matchesCritical.length === 1) importance = 4;
    else if (t.length > 80) importance = 3;

    const bullCount = bullishKeywords.filter(k => t.includes(k)).length;
    const bearCount = bearishKeywords.filter(k => t.includes(k)).length;

    if (bullCount > bearCount) sentiment = 'BULLISH';
    else if (bearCount > bullCount) sentiment = 'BEARISH';

    if (importance >= 4) {
        if (sentiment === 'BULLISH') {
            impact = `High-impact positive news. Expect significant upward pressure on ${symbol} with potential for momentum-driven rallies.`;
        } else if (sentiment === 'BEARISH') {
            impact = `Critical negative catalyst. Possible sharp correction for ${symbol} as institutional sentiment shifts. Risk management advised.`;
        } else {
            impact = `Major development for ${symbol}. Volatility expected as the market digests the structural implications of this event.`;
        }
    } else if (importance === 3) {
        impact = sentiment === 'BULLISH'
            ? `Steady positive sentiment. Supports a gradual climb for ${symbol} without immediate parabolic risk.`
            : sentiment === 'BEARISH'
                ? `Minor headwinds detected. ${symbol} may face resistance in the short term, but fundamental damage is likely limited.`
                : `General market noise. ${symbol} price action likely to remain tied to broader sector trends.`;
    } else {
        impact = `Snapshot retrieved for ${symbol}. Market impact currently being assessed.`;
    }

    return { importance, sentiment, aiInsight: impact };
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await context.params;

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        if (!FINNHUB_API_KEY) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch company news from Finnhub
        const today = new Date();
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const fromDate = lastMonth.toISOString().split('T')[0];
        const toDate = today.toISOString().split('T')[0];

        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.status}`);
        }

        const rawNews = await response.json();

        if (!Array.isArray(rawNews)) {
            return NextResponse.json([]);
        }

        const enhancedNews: NewsItem[] = rawNews.map((item: any) => {
            const analysis = analyzeNews(item.headline, symbol);
            return {
                uuid: item.id?.toString() || Math.random().toString(),
                title: item.headline,
                publisher: item.source,
                link: item.url,
                providerPublishTime: item.datetime,
                type: 'STORY',
                thumbnail: item.image,
                relatedTickers: [symbol],
                ...analysis
            };
        });

        const sortedNews = enhancedNews.sort((a, b) => {
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            return new Date(b.providerPublishTime).getTime() - new Date(a.providerPublishTime).getTime();
        });

        return NextResponse.json(sortedNews);
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
