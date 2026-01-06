import _YahooFinance from 'yahoo-finance2';
import { MarketQuote } from '@/types/market';

const yahooFinance = new (_YahooFinance as any)();

const DEFAULT_SYMBOLS = [
    // US Indices & Tech
    '^GSPC', '^DJI', '^IXIC',
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AVGO', 'NFLX', 'AMD', 'INTC',
    // US Blue Chips
    'BRK-B', 'V', 'MA', 'JPM', 'UNH', 'COST', 'DIS', 'WMT', 'PG', 'JNJ', 'XOM', 'HD', 'CVX', 'MRK', 'ABBV', 'PEP', 'KO',
    // UK (FTSE 100)
    'AZN.L', 'SHEL.L', 'HSBA.L', 'ULVR.L', 'BP.L', 'RIO.L', 'DGE.L', 'GSK.L', 'REL.L', 'LSEG.L',
    'BATS.L', 'NG.L', 'RKT.L', 'BARC.L', 'LLOY.L', 'VOD.L', 'PRU.L', 'EXPN.L', 'STAN.L', 'ABF.L',
    // Canada (S&P/TSX 60)
    'SHOP.TO', 'RY.TO', 'TD.TO', 'AEM.TO', 'ATD.TO', 'BMO.TO', 'BNS.TO', 'ABX.TO', 'BCE.TO', 'BAM.TO',
    'BN.TO', 'CM.TO', 'CVE.TO', 'CSU.TO', 'DOL.TO', 'ENB.TO', 'FTS.TO', 'CNR.TO', 'CP.TO', 'CNQ.TO',
    // Crypto & Popular ETFs
    'BTC-USD', 'ETH-USD', 'SOL-USD',
    'SPY', 'QQQ', 'VOO'
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
                exchangeName: result.fullExchangeName,
                marketCap: result.marketCap,
                peRatio: result.trailingPE,
                eps: result.epsTrailingTwelveMonths,
                dividendYield: result.trailingAnnualDividendYield ? result.trailingAnnualDividendYield * 100 : undefined,
                beta: result.beta,
                dayHigh: result.regularMarketDayHigh,
                dayLow: result.regularMarketDayLow,
                fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: result.fiftyTwoWeekLow,
                region,
                assetType,
            };
        });
    } catch (error) {
        console.error('Error fetching market data from Yahoo:', error);
        return [];
    }
}

export async function fetchChartData(symbol: string, range: string = '1d') {
    try {
        let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo" = "15m";
        // Map simplified range to interval
        switch (range) {
            case '1mo': interval = "60m"; break;
            case '5d': interval = "30m"; break; // or 1h
            case '1y': interval = "1d"; break;
            case '1d': default: interval = "5m"; // finer grain for 1d
        }

        // Calculate period1 based on range roughly if needed, purely for 'queryOptions' if range not supported?
        // simple-chart via yahoo-finance2 supports 'range' directly if using queryOptions properly or via 'chart' method?
        // The library 'chart' method signature: chart(symbol, queryOptions)
        // queryOptions: { period1, period2, interval, includePrePost, events }
        // It DOES NOT support 'range' string in the typed options directly in all versions, but let's check.
        // Actually it's safer to use period1/period2.

        const now = new Date();
        let period1 = new Date();

        switch (range) {
            case '1d': period1.setDate(now.getDate() - 1); break; // actually 2 days to be safe for weekends? 
            // Better: use library logic if possible. But manually:
            case '5d': period1.setDate(now.getDate() - 5); break;
            case '1mo': period1.setMonth(now.getMonth() - 1); break;
            case '1y': period1.setFullYear(now.getFullYear() - 1); break;
            default: period1.setDate(now.getDate() - 1);
        }

        // For 1d, we want the last trading day.
        // Yahoo chart API supports 'range' param. yahoo-finance2 allows passing unknown options.
        // Let's try passing 'range' directly if possible, or use dates.
        // Using `queryOptions` with `range` might work if the library passes it through.
        // Documentation says: queryOptions matches API parameters.
        const queryOptions = { range, interval, includePrePost: false };

        const result = await yahooFinance.chart(symbol, queryOptions as any) as any;

        // result is { meta, timestamp, indicators } usually, or the processed result.
        // In yahoo-finance2, 'chart' returns the raw struct usually.

        const meta = result.meta;
        const quotes = result.quotes; // Array of { date, open, high, low, close, volume }

        const prices = quotes
            .map((q: any) => q.close)
            .filter((p: any): p is number => typeof p === 'number');

        return {
            symbol: meta.symbol,
            range,
            prices,
            previousClose: meta.chartPreviousClose || meta.previousClose || prices[0]
        };
    } catch (error) {
        console.error(`Error fetching ${range} chart for ${symbol}:`, error);
        return {
            symbol,
            range,
            prices: [],
            previousClose: 0
        };
    }
}

export async function fetchNewsData(symbol: string) {
    try {
        const result = await yahooFinance.search(symbol, { newsCount: 10 }) as any;
        return result.news || [];
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return [];
    }
}
