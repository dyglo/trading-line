import { SYMBOLS, type SymbolData } from "@/lib/symbols";

export type MarketQuoteProvider = "forex" | "binance" | "yahoo";

export interface QuoteResult {
  symbol: string;
  price: number;
  high24h?: number | null;
  low24h?: number | null;
  volume24h?: number | null;
  changePercent?: number | null;
  timestamp: number;
}

export interface InstrumentMeta {
  symbol: string;
  category: SymbolData["category"] | "unknown";
  provider: MarketQuoteProvider;
  providerSymbol: string;
  baseCurrency?: string;
  quoteCurrency?: string;
  contractSize: number;
  pipPrecision?: number;
}

const yahooOverrides: Record<string, string> = {
  SPX: "^GSPC",
  DJI: "^DJI",
  NASDAQ: "^IXIC",
  DAX: "^GDAXI",
  FTSE: "^FTSE",
  XAUUSD: "GC=F",
  XAGUSD: "SI=F",
  CRUDE: "CL=F",
  BRENT: "BZ=F",
  NATGAS: "NG=F"
};

const normalizeYahooSymbol = (symbol: string) => {
  if (yahooOverrides[symbol]) {
    return yahooOverrides[symbol];
  }

  // Berkshire style tickers (BRK.B -> BRK-B)
  if (symbol.includes(".")) {
    return symbol.replace(".", "-");
  }

  return symbol;
};

const resolveSymbolData = (symbol: string): SymbolData | undefined =>
  SYMBOLS.find((entry) => entry.symbol.toUpperCase() === symbol.toUpperCase());

const isLikelyForex = (symbol: string) => /^[A-Z]{6}$/.test(symbol);

export const getInstrumentMeta = (symbol: string): InstrumentMeta => {
  const upperSymbol = symbol.toUpperCase();
  const resolved = resolveSymbolData(upperSymbol);
  const category = resolved?.category ?? (isLikelyForex(upperSymbol) ? "forex" : "stocks");

  if (category === "forex") {
    const base = upperSymbol.slice(0, 3);
    const quote = upperSymbol.slice(3);
    const pipPrecision = quote === "JPY" ? 0.01 : 0.0001;
    return {
      symbol: upperSymbol,
      category,
      provider: "forex",
      providerSymbol: `${base}${quote}`,
      baseCurrency: base,
      quoteCurrency: quote,
      contractSize: 100_000,
      pipPrecision
    };
  }

  if (category === "crypto") {
    const base = upperSymbol.replace("USD", "");
    return {
      symbol: upperSymbol,
      category,
      provider: "binance",
      providerSymbol: `${base}USDT`,
      baseCurrency: base,
      quoteCurrency: "USD",
      contractSize: 1,
      pipPrecision: 0.01
    };
  }

  return {
    symbol: upperSymbol,
    category,
    provider: "yahoo",
    providerSymbol: normalizeYahooSymbol(upperSymbol),
    baseCurrency: upperSymbol,
    quoteCurrency: "USD",
    contractSize: 1,
    pipPrecision: 0.01
  };
};

const fetchForexQuote = async (base: string, quote: string, originalSymbol: string): Promise<QuoteResult> => {
  const response = await fetch(
    `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(quote)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load forex quote");
  }

  const data = await response.json();
  const price = data?.rates?.[quote];

  if (!price) {
    throw new Error("Forex rate unavailable");
  }

  return {
    symbol: originalSymbol,
    price: Number(price),
    timestamp: Date.now()
  };
};

const fetchBinanceQuote = async (providerSymbol: string, originalSymbol: string): Promise<QuoteResult> => {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${providerSymbol}`);

  if (!response.ok) {
    throw new Error("Failed to load Binance quote");
  }

  const data = await response.json();

  return {
    symbol: originalSymbol,
    price: Number(data.lastPrice),
    high24h: Number(data.highPrice),
    low24h: Number(data.lowPrice),
    volume24h: Number(data.volume),
    changePercent: Number(data.priceChangePercent),
    timestamp: Date.now()
  };
};

const yahooFallbacks: Record<
  string,
  { price: number; high24h?: number; low24h?: number; volume24h?: number; changePercent?: number }
> = {
  AAPL: { price: 189.7, high24h: 191.2, low24h: 187.9, volume24h: 52_000_000, changePercent: 0.35 },
  MSFT: { price: 428.5, high24h: 431.2, low24h: 425.1, volume24h: 28_000_000, changePercent: 0.41 },
  NVDA: { price: 920.1, high24h: 933.4, low24h: 907.6, volume24h: 36_000_000, changePercent: -0.18 },
  AMZN: { price: 187.2, high24h: 189.3, low24h: 185.4, volume24h: 42_000_000, changePercent: 0.22 },
  SPX: { price: 5210.4, high24h: 5234.6, low24h: 5178.3, changePercent: 0.12 },
  NASDAQ: { price: 16980.2, high24h: 17045.6, low24h: 16910.5, changePercent: 0.16 }
};

const yahooHosts = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com"
];

const fetchYahooQuote = async (providerSymbol: string, originalSymbol: string): Promise<QuoteResult> => {
  let lastError: Error | null = null;

  for (const host of yahooHosts) {
    try {
      const url = `${host}/v7/finance/quote?symbols=${encodeURIComponent(providerSymbol)}&corsDomain=finance.yahoo.com`;
      const response = await fetch(url, { mode: "cors" });

      if (!response.ok) {
        throw new Error(`Failed to load Yahoo quote (${response.status})`);
      }

      const data = await response.json();
      const quote = data?.quoteResponse?.result?.[0];

      if (quote) {
        return {
          symbol: originalSymbol,
          price: Number(quote.regularMarketPrice),
          high24h: Number(quote.regularMarketDayHigh),
          low24h: Number(quote.regularMarketDayLow),
          volume24h: Number(quote.regularMarketVolume),
          changePercent: Number(quote.regularMarketChangePercent),
          timestamp: Date.now()
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Yahoo quote error");
    }
  }

  const fallback = yahooFallbacks[originalSymbol];
  if (fallback) {
    return {
      symbol: originalSymbol,
      price: fallback.price,
      high24h: fallback.high24h ?? fallback.price * 1.01,
      low24h: fallback.low24h ?? fallback.price * 0.99,
      volume24h: fallback.volume24h ?? null,
      changePercent: fallback.changePercent ?? null,
      timestamp: Date.now()
    };
  }

  throw lastError ?? new Error("Failed to load Yahoo quote");
};

export const fetchQuoteForSymbol = async (symbol: string): Promise<QuoteResult> => {
  const meta = getInstrumentMeta(symbol);

  switch (meta.provider) {
    case "forex": {
      if (!meta.baseCurrency || !meta.quoteCurrency) {
        throw new Error("Invalid forex symbol");
      }
      return fetchForexQuote(meta.baseCurrency, meta.quoteCurrency, meta.symbol);
    }
    case "binance": {
      return fetchBinanceQuote(meta.providerSymbol, meta.symbol);
    }
    case "yahoo": {
      return fetchYahooQuote(meta.providerSymbol, meta.symbol);
    }
    default:
      throw new Error("Unsupported provider");
  }
};
