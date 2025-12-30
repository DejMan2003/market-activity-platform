import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { NewsItem } from '@/types/market';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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
        const results = await yahooFinance.search(symbol);
        const rawNews = results.news || [];

        const enhancedNews: NewsItem[] = rawNews.map((item: any) => {
            const analysis = analyzeNews(item.title, symbol);
            return {
                uuid: item.uuid,
                title: item.title,
                publisher: item.publisher,
                link: item.link,
                providerPublishTime: item.providerPublishTime,
                type: item.type,
                thumbnail: item.thumbnail,
                relatedTickers: item.relatedTickers,
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
