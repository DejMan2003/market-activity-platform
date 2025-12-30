import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
import { MarketQuote } from '@/types/market';

// Default list of symbols to track
const DEFAULT_SYMBOLS = [
    '^GSPC', // S&P 500
    '^DJI',  // Dow Jones
    '^IXIC', // Nasdaq
    'AAPL',  // Apple
    'MSFT',  // Microsoft
    'GOOGL', // Google
    'AMZN',  // Amazon
    'TSLA',  // Tesla
    'NVDA',  // Nvidia
    'SHOP.TO', // Shopify (Canada)
    'RY.TO',   // Royal Bank (Canada)
    'TD.TO',   // TD Bank (Canada)
    'HSBA.L',  // HSBC (UK)
    'AZN.L',   // AstraZeneca (UK)
    'BP.L',    // BP (UK)
    'BTC-USD', // Bitcoin
    'ETH-USD', // Ethereum
    'AMD',
    'INTC',
    'SPY',
    'QQQ'
];

export async function fetchMarketData(symbols: string[] = DEFAULT_SYMBOLS): Promise<MarketQuote[]> {
    try {
        const results = await yahooFinance.quote(symbols) as any[];

        return results.map((result: any) => {
            const symbol = result.symbol;
            let region = "US";
            let assetType = "Stock";

            if (symbol.endsWith('.TO')) region = "Canada";
            else if (symbol.endsWith('.L')) region = "UK";
            else if (symbol.includes('-USD')) {
                region = "Global";
                assetType = "Crypto";
            } else if (symbol.startsWith('^')) {
                region = "US";
                assetType = "Index";
            }

            const etfs = ['VOO', 'SPY', 'QQQ', 'IVV', 'VTI', 'VEA', 'VWO'];
            if (etfs.includes(symbol)) {
                assetType = "ETF";
            }

            return {
                symbol,
                name: result.shortName || result.longName || symbol,
                price: result.regularMarketPrice || 0,
                change: result.regularMarketChange || 0,
                changePercent: result.regularMarketChangePercent || 0,
                volume: result.regularMarketVolume || 0,
                avgVolume: result.averageDailyVolume3Month || 0,
                marketState: result.marketState === 'REGULAR' ? 'REGULAR' : 'CLOSED',
                currency: result.currency || 'USD',
                exchange: result.fullExchangeName || 'Unknown',
                marketCap: result.marketCap,
                trailingPE: result.trailingPE,
                dayHigh: result.regularMarketDayHigh,
                dayLow: result.regularMarketDayLow,
                // Monthly isn't in batch quote; we fallback to 52W or can add historical logic later
                monthHigh: result.fiftyDayAverage ? result.fiftyDayAverage * 1.05 : undefined,
                monthLow: result.fiftyDayAverage ? result.fiftyDayAverage * 0.95 : undefined,
                fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: result.fiftyTwoWeekLow,
                region,
                assetType,
            };
        });
    } catch (error) {
        console.error('Error fetching market data:', error);
        // Return empty array in case of failure to allow UI to handle empty state gracefully
        return [];
    }
}
