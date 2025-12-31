import { MarketQuote } from '@/types/market';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Default list of symbols to track
const DEFAULT_SYMBOLS = [
    // US Tech Giants
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AVGO', 'NFLX', 'AMD', 'INTC',
    // US Blue Chips
    'BRK.B', 'V', 'MA', 'JPM', 'UNH', 'COST', 'DIS', 'WMT', 'PG', 'JNJ', 'XOM', 'HD', 'CVX', 'MRK', 'ABBV', 'PEP', 'KO',
];

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch quote data from Finnhub
async function fetchFinnhubQuote(symbol: string): Promise<any> {
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Fetch company profile from Finnhub
async function fetchFinnhubProfile(symbol: string): Promise<any> {
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Fetch basic financials from Finnhub
async function fetchFinnhubFinancials(symbol: string): Promise<any> {
    const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
        return null; // Financials might not be available for all symbols
    }

    return response.json();
}

export async function fetchMarketData(symbols: string[] = DEFAULT_SYMBOLS): Promise<MarketQuote[]> {
    try {
        if (!FINNHUB_API_KEY) {
            console.error('FINNHUB_API_KEY is not set in environment variables');
            return [];
        }

        const results: MarketQuote[] = [];

        // Finnhub free tier: 60 calls/minute
        // We need 3 calls per symbol (quote, profile, financials)
        // So we can safely fetch ~20 symbols per minute
        const BATCH_SIZE = 15;
        const DELAY_BETWEEN_SYMBOLS = 100; // 100ms delay between symbols
        const DELAY_BETWEEN_BATCHES = 1000; // 1s delay between batches

        for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
            const batch = symbols.slice(i, i + BATCH_SIZE);

            if (i > 0) {
                await delay(DELAY_BETWEEN_BATCHES);
            }

            for (const symbol of batch) {
                try {
                    // Fetch quote and profile in parallel
                    const [quoteData, profileData] = await Promise.all([
                        fetchFinnhubQuote(symbol),
                        fetchFinnhubProfile(symbol)
                    ]);

                    // Add small delay before next symbol
                    await delay(DELAY_BETWEEN_SYMBOLS);

                    // Fetch financials (optional, may not be available for all)
                    let financialsData = null;
                    try {
                        financialsData = await fetchFinnhubFinancials(symbol);
                        await delay(DELAY_BETWEEN_SYMBOLS);
                    } catch (err) {
                        // Financials not available, continue without them
                    }

                    // Map Finnhub data to our MarketQuote interface
                    const price = quoteData.c || 0; // current price
                    const previousClose = quoteData.pc || price;
                    const change = price - previousClose;
                    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

                    // Determine region and asset type
                    let region = "US";
                    let assetType = "Stock";

                    if (symbol.includes('USD')) {
                        region = "Global";
                        assetType = "Crypto";
                    }

                    const etfs = ['VOO', 'SPY', 'QQQ', 'IVV', 'VTI', 'VEA', 'VWO'];
                    if (etfs.includes(symbol)) {
                        assetType = "ETF";
                    }

                    const marketQuote: MarketQuote = {
                        symbol,
                        name: profileData?.name || symbol,
                        price,
                        change,
                        changePercent,
                        volume: financialsData?.metric?.['10DayAverageTradingVolume'] || 0,
                        avgVolume: financialsData?.metric?.['10DayAverageTradingVolume'] || 0,
                        marketState: 'REGULAR',
                        currency: profileData?.currency || 'USD',
                        exchange: profileData?.exchange || 'Unknown',
                        exchangeName: profileData?.exchange,
                        marketCap: profileData?.marketCapitalization ? profileData.marketCapitalization * 1000000 : undefined,
                        peRatio: financialsData?.metric?.peBasicExclExtraTTM,
                        eps: financialsData?.metric?.epsBasicExclExtraItemsTTM,
                        dividendYield: financialsData?.metric?.dividendYieldIndicatedAnnual,
                        beta: financialsData?.metric?.beta,
                        dayHigh: quoteData.h || price,
                        dayLow: quoteData.l || price,
                        monthHigh: financialsData?.metric?.['52WeekHigh'],
                        monthLow: financialsData?.metric?.['52WeekLow'],
                        fiftyTwoWeekHigh: financialsData?.metric?.['52WeekHigh'],
                        fiftyTwoWeekLow: financialsData?.metric?.['52WeekLow'],
                        region,
                        assetType,
                    };

                    results.push(marketQuote);
                    console.log(`Fetched ${symbol}: $${price.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);

                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    // Continue with other symbols
                }
            }
        }

        console.log(`Successfully fetched ${results.length}/${symbols.length} symbols from Finnhub`);
        return results;

    } catch (error) {
        console.error('Error fetching market data from Finnhub:', error);
        return [];
    }
}

// Fetch candle/chart data from Finnhub
export async function fetchChartData(
    symbol: string,
    resolution: 'D' | '60' | '15' = 'D',
    from?: number,
    to?: number
): Promise<number[]> {
    try {
        if (!FINNHUB_API_KEY) {
            console.error('FINNHUB_API_KEY is not set');
            return [];
        }

        const now = Math.floor(Date.now() / 1000);
        const fromTimestamp = from || (now - 365 * 24 * 60 * 60); // Default: 1 year ago
        const toTimestamp = to || now;

        const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}&token=${FINNHUB_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Finnhub chart API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.s === 'no_data' || !data.c) {
            return [];
        }

        return data.c; // Close prices
    } catch (error) {
        console.error(`Error fetching chart data for ${symbol}:`, error);
        return [];
    }
}
