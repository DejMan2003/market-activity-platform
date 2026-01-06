import { NextRequest, NextResponse } from 'next/server';
import { NewsItem } from '@/types/market';
import { fetchNewsData } from '@/lib/yahoo';

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
        const rawNews = await fetchNewsData(symbol);

        if (!Array.isArray(rawNews)) {
            return NextResponse.json([]);
        }

        const enhancedNews: NewsItem[] = rawNews.map((item: any) => {
            const analysis = analyzeNews(item.title, symbol);
            return {
                uuid: item.uuid || Math.random().toString(),
                title: item.title,
                publisher: item.publisher,
                link: item.link,
                providerPublishTime: item.providerPublishTime,
                type: 'STORY',
                thumbnail: item.thumbnail?.resolutions?.[0]?.url || null,
                relatedTickers: item.relatedTickers || [symbol],
                ...analysis
            };
        });

        const sortedNews = enhancedNews.sort((a, b) => {
            // Sort by importance, then by date descending (newest first)
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            // Ensure providerPublishTime is treated as a number/timestamp
            return (Number(b.providerPublishTime) || 0) - (Number(a.providerPublishTime) || 0);
        });

        return NextResponse.json(sortedNews);
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
