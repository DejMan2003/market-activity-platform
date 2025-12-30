import { MarketQuote } from '@/types/market';

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
        // Use a CORS proxy or fetch directly if the API allows
        // Since yahoo-finance2 is Node-only, we use a public API or mirror
        const query = symbols.join(',');
        const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${query}`);
        const data = await response.json();
        const results = data.quoteResponse.result;

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
                fiftyTwoWeekHigh: result.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: result.fiftyTwoWeekLow,
                region,
                assetType,
            };
        });
    } catch (error) {
        console.error('Error fetching market data client-side:', error);
        return [];
    }
}

export async function fetchChartData(symbol: string, range: string = '1d') {
    try {
        let interval = "15m";
        switch (range) {
            case '1mo': interval = "1h"; break;
            case '5d': interval = "1h"; break;
            case '1y': interval = "1d"; break;
            case '1d': default: interval = "15m";
        }

        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`);
        const data = await response.json();
        const result = data.chart.result[0];

        const prices = result.indicators.quote[0].close
            .filter((p: any): p is number => p !== null && p !== undefined);

        return {
            symbol: result.meta.symbol,
            range,
            prices,
            previousClose: result.meta.previousClose || prices[0]
        };
    } catch (error) {
        console.error(`Error fetching ${range} chart for ${symbol}:`, error);
        throw error;
    }
}

export async function fetchNewsData(symbol: string) {
    try {
        // Yahoo Finance v1 search API for news
        const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}`);
        const data = await response.json();
        return data.news || [];
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return [];
    }
}
