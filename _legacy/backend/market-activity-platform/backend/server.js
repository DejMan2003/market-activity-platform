// ============================================================================
// FILE 1: backend/server.js
// ============================================================================

const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const app = express();

app.use(cors());
app.use(express.json());

// API Keys
const API_KEYS = {
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_KEY || 'demo',
  POLYGON: process.env.POLYGON_KEY || 'demo',
  COINGECKO: 'free',
  NEWSAPI: process.env.NEWSAPI_KEY || 'demo',
  FMP: process.env.FMP_KEY || 'demo'
};

const API_ENDPOINTS = {
  alphaVantage: 'https://www.alphavantage.co/query',
  polygon: 'https://api.polygon.io',
  coinGecko: 'https://api.coingecko.com/api/v3',
  newsApi: 'https://newsapi.org/v2',
  fmp: 'https://financialmodelingprep.com/api/v3'
};

// Market Tickers
const MARKET_TICKERS = {
  CA: {
    etfs: ['VFV.TO', 'XIC.TO', 'VCN.TO', 'VDY.TO', 'XIU.TO', 'ZEB.TO'],
    stocks: ['SHOP.TO', 'TD.TO', 'RY.TO', 'ENB.TO', 'CNR.TO', 'BAM.TO', 'CP.TO', 'SU.TO'],
    sectors: {
      'SHOP.TO': 'Technology', 'TD.TO': 'Financials', 'RY.TO': 'Financials',
      'ENB.TO': 'Energy', 'CNR.TO': 'Transportation', 'VFV.TO': 'Broad Market',
      'XIC.TO': 'Broad Market', 'BAM.TO': 'Financials', 'CP.TO': 'Transportation',
      'SU.TO': 'Energy', 'VCN.TO': 'Broad Market', 'VDY.TO': 'Dividend',
      'XIU.TO': 'Broad Market', 'ZEB.TO': 'Financials'
    }
  },
  US: {
    etfs: ['SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'EEM', 'AGG'],
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM', 
             'V', 'JNJ', 'WMT', 'PG', 'MA', 'HD', 'UNH', 'DIS'],
    sectors: {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
      'AMZN': 'Consumer', 'NVDA': 'Technology', 'TSLA': 'Automotive',
      'META': 'Technology', 'JPM': 'Financials', 'SPY': 'Broad Market',
      'QQQ': 'Technology', 'VOO': 'Broad Market', 'VTI': 'Broad Market',
      'V': 'Financials', 'JNJ': 'Healthcare', 'WMT': 'Consumer',
      'PG': 'Consumer', 'MA': 'Financials', 'HD': 'Consumer',
      'UNH': 'Healthcare', 'DIS': 'Entertainment', 'IWM': 'Small Cap',
      'DIA': 'Broad Market', 'EEM': 'Emerging Markets', 'AGG': 'Bonds'
    }
  },
  UK: {
    etfs: ['VUKE.L', 'ISF.L', 'IUKD.L'],
    stocks: ['SHEL.L', 'AZN.L', 'HSBA.L', 'BP.L', 'ULVR.L', 'GSK.L'],
    sectors: {
      'SHEL.L': 'Energy', 'AZN.L': 'Healthcare', 'HSBA.L': 'Financials',
      'BP.L': 'Energy', 'VUKE.L': 'Broad Market', 'ULVR.L': 'Consumer',
      'GSK.L': 'Healthcare', 'ISF.L': 'Broad Market', 'IUKD.L': 'Dividend'
    }
  }
};

const CRYPTO_TICKERS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' }
];

// Data Fetchers
async function fetchFMPData(ticker) {
  try {
    const cacheKey = `fmp_${ticker}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${API_ENDPOINTS.fmp}/quote/${ticker}`, {
      params: { apikey: API_KEYS.FMP },
      timeout: 5000
    });

    if (!response.data || response.data.length === 0) return null;

    const quote = response.data[0];
    const data = {
      ticker,
      name: quote.name,
      price: quote.price,
      priceChange: quote.change,
      priceChangePercent: quote.changesPercentage,
      volume: quote.volume,
      avgVolume: quote.avgVolume,
      timestamp: new Date().toISOString(),
      source: 'fmp'
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`FMP error for ${ticker}:`, error.message);
    return null;
  }
}

async function fetchCryptoData(cryptoId) {
  try {
    const cacheKey = `crypto_${cryptoId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${API_ENDPOINTS.coinGecko}/coins/${cryptoId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false
      },
      timeout: 5000
    });

    const market = response.data.market_data;
    const data = {
      ticker: response.data.symbol.toUpperCase(),
      name: response.data.name,
      price: market.current_price.usd,
      priceChange: market.price_change_24h,
      priceChangePercent: market.price_change_percentage_24h,
      volume: market.total_volume.usd,
      timestamp: new Date().toISOString(),
      source: 'coingecko'
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`CoinGecko error for ${cryptoId}:`, error.message);
    return null;
  }
}

async function fetchNewsForTicker(ticker, name) {
  try {
    const cacheKey = `news_${ticker}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const searchTerm = name || ticker.replace(/\.(TO|L)$/, '');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3);

    const response = await axios.get(`${API_ENDPOINTS.newsApi}/everything`, {
      params: {
        q: searchTerm,
        from: yesterday.toISOString().split('T')[0],
        sortBy: 'relevancy',
        language: 'en',
        pageSize: 5,
        apiKey: API_KEYS.NEWSAPI
      },
      timeout: 5000
    });

    const hasNews = response.data.articles && response.data.articles.length > 0;
    const newsData = {
      hasNews,
      count: response.data.articles ? response.data.articles.length : 0,
      topHeadline: hasNews ? response.data.articles[0].title : null
    };

    cache.set(cacheKey, newsData);
    return newsData;
  } catch (error) {
    return { hasNews: false, count: 0, topHeadline: null };
  }
}

function calculateVolumeRatio(currentVolume, avgVolume) {
  if (avgVolume) return currentVolume / avgVolume;
  const simulatedAvg = currentVolume * (0.7 + Math.random() * 0.6);
  return currentVolume / simulatedAvg;
}

function calculateActivityScore(asset) {
  let score = 0;
  let signals = 0;
  
  const volumeRatio = asset.volumeRatio || 1;
  if (volumeRatio > 2.0) {
    score += 4;
    signals++;
  } else if (volumeRatio > 1.5) {
    score += 3;
    signals++;
  } else if (volumeRatio > 1.2) {
    score += 1;
  }
  
  const absChange = Math.abs(asset.priceChangePercent || 0);
  if (absChange > 5) {
    score += 4;
    signals++;
  } else if (absChange > 3) {
    score += 3;
    signals++;
  } else if (absChange > 1.5) {
    score += 1;
  }
  
  if (asset.hasNews) {
    score += 2;
    signals++;
  }
  
  if (signals < 2) return Math.min(score, 3);
  return Math.min(Math.round(score), 10);
}

function classifyRisk(assetType, ticker) {
  if (assetType === 'Options') return 'Very High';
  if (assetType === 'Crypto') return 'High';
  if (assetType === 'ETF' && /[23]X|INVERSE|ULTRA/i.test(ticker)) return 'High';
  if (assetType === 'ETF') return 'Low';
  return 'Medium';
}

async function fetchAssetData(ticker, region, assetType) {
  try {
    let marketData = null;
    let newsData = { hasNews: false };

    if (assetType === 'Crypto') {
      const crypto = CRYPTO_TICKERS.find(c => c.symbol === ticker);
      if (crypto) marketData = await fetchCryptoData(crypto.id);
    } else {
      marketData = await fetchFMPData(ticker);
    }

    if (!marketData) return null;

    if (assetType !== 'Crypto') {
      newsData = await fetchNewsForTicker(ticker, marketData.name);
    }

    const volumeRatio = calculateVolumeRatio(marketData.volume, marketData.avgVolume);

    const asset = {
      ticker,
      name: marketData.name || ticker,
      region,
      assetType,
      sector: MARKET_TICKERS[region]?.sectors?.[ticker] || 'Unknown',
      price: marketData.price,
      priceChange: marketData.priceChange,
      priceChangePercent: marketData.priceChangePercent,
      volume: marketData.volume,
      volumeRatio,
      hasNews: newsData.hasNews,
      newsHeadline: newsData.topHeadline,
      timestamp: marketData.timestamp,
      source: marketData.source
    };

    asset.risk = classifyRisk(assetType, ticker);
    asset.activityScore = calculateActivityScore(asset);

    return asset;
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    return null;
  }
}

async function fetchMarketData(region = 'US', assetType = 'All') {
  const promises = [];

  if (assetType === 'Crypto') {
    CRYPTO_TICKERS.forEach(crypto => {
      promises.push(fetchAssetData(crypto.symbol, 'US', 'Crypto'));
    });
  } else if (region !== 'All') {
    const regionData = MARKET_TICKERS[region];
    
    if (assetType === 'All' || assetType === 'ETF') {
      regionData.etfs.forEach(ticker => {
        promises.push(fetchAssetData(ticker, region, 'ETF'));
      });
    }
    
    if (assetType === 'All' || assetType === 'Stock') {
      regionData.stocks.forEach(ticker => {
        promises.push(fetchAssetData(ticker, region, 'Stock'));
      });
    }
  }

  const results = await Promise.allSettled(promises);
  const assets = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  return assets.sort((a, b) => b.activityScore - a.activityScore);
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cache_stats: cache.getStats()
  });
});

app.get('/api/market-data', async (req, res) => {
  try {
    const { region = 'US', assetType = 'All' } = req.query;
    const data = await fetchMarketData(region, assetType);
    
    res.json({
      success: true,
      count: data.length,
      region,
      assetType,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      message: error.message
    });
  }
});

app.get('/api/asset/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { region = 'US', assetType = 'Stock' } = req.query;
    const data = await fetchAssetData(ticker, region, assetType);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Asset data unavailable'
      });
    }
    
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset data',
      message: error.message
    });
  }
});

app.get('/api/tickers', (req, res) => {
  res.json({
    success: true,
    tickers: MARKET_TICKERS,
    crypto: CRYPTO_TICKERS
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Market Activity API running on port ${PORT}`);
});

module.exports = { app };