import { useEffect, useState } from "react";

import { fetchQuoteForSymbol } from "@/lib/market-data";

interface QuoteState {
  price: number | null;
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  changePercent: number | null;
  lastUpdated: number | null;
  isLoading: boolean;
  error?: string;
}

const INITIAL_STATE: QuoteState = {
  price: null,
  high24h: null,
  low24h: null,
  volume24h: null,
  changePercent: null,
  lastUpdated: null,
  isLoading: true
};

export const useRealTimeQuote = (symbolKey: string): QuoteState => {
  const [state, setState] = useState<QuoteState>(INITIAL_STATE);

  useEffect(() => {
    let isMounted = true;
    let previousPrice: number | null = null;

    const fetchQuote = async () => {
      try {
        const quote = await fetchQuoteForSymbol(symbolKey);
        const changePercent =
          quote.changePercent ??
          (previousPrice != null ? ((quote.price - previousPrice) / previousPrice) * 100 : null);
        previousPrice = quote.price;

        if (isMounted) {
          setState({
            price: quote.price,
            high24h: quote.high24h ?? quote.price,
            low24h: quote.low24h ?? quote.price,
            volume24h: quote.volume24h ?? null,
            changePercent: changePercent ?? null,
            lastUpdated: quote.timestamp,
            isLoading: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to load quote"
          }));
        }
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbolKey]);

  return state;
};
