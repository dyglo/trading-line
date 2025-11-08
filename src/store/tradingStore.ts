import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchQuoteForSymbol, getInstrumentMeta, type InstrumentMeta } from '@/lib/market-data';

export type Side = 'LONG' | 'SHORT';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED';

type SizingMode = 'UNITS' | 'LOTS';

export interface Order {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
  displayQty?: number;
  sizingMode: SizingMode;
  category?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
  pipPrecision?: number;
  contractSize?: number;
  limitPrice?: number;
  stopPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  status: OrderStatus;
  createdAt: number;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: Side;
  qty: number;
  displayQty?: number;
  sizingMode: SizingMode;
  category?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
  pipPrecision?: number;
  contractSize?: number;
  lotSize?: number;
  avgPrice: number;
  pnl: number;
  openedAt: number;
  closedAt?: number;
  closeReason?: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS';
  takeProfit?: number;
  stopLoss?: number;
}

export interface Account {
  balance: number;
  equity: number;
}

interface PriceFeed {
  [symbol: string]: number;
}

interface TradingState {
  account: Account;
  orders: Order[];
  trades: Trade[];
  prices: PriceFeed;
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt' | 'qty' | 'displayQty' | 'sizingMode'> & { qty: number }) => Promise<void>;
  cancelOrder: (orderId: string) => void;
  closeTrade: (tradeId: string, reason?: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS') => Promise<void>;
  updatePrices: () => Promise<void>;
  recalcEquity: () => void;
  checkAndExecuteOrders: () => void;
  checkStopLossAndTakeProfit: () => void;
}

const trackedSymbols = new Set<string>();
const POLL_INTERVAL_MS = 8000;
let pollingHandle: ReturnType<typeof setInterval> | null = null;

const normalizeQuantity = (qty: number, meta: InstrumentMeta) => {
  if (meta.category === 'forex') {
    return qty * (meta.contractSize ?? 100_000);
  }
  return qty;
};

const deriveSizingMode = (meta: InstrumentMeta): SizingMode => (meta.category === 'forex' ? 'LOTS' : 'UNITS');

const getConversionRateToUsd = (currency: string | undefined, prices: PriceFeed) => {
  if (!currency || currency === 'USD') {
    return 1;
  }

  const upper = currency.toUpperCase();
  const directPair = `${upper}USD`;
  const inversePair = `USD${upper}`;

  if (prices[directPair]) {
    return prices[directPair];
  }

  if (prices[inversePair]) {
    return 1 / prices[inversePair];
  }

  return 1;
};

const computeForexPipValueUsd = (trade: Trade, currentPrice: number, prices: PriceFeed) => {
  const pipSize = trade.pipPrecision ?? 0.0001;
  const contractSize = trade.contractSize ?? 100_000;

  if (trade.quoteCurrency === 'USD') {
    return contractSize * pipSize;
  }

  if (trade.baseCurrency === 'USD') {
    return (contractSize * pipSize) / currentPrice;
  }

  const conversion = getConversionRateToUsd(trade.quoteCurrency, prices);
  return contractSize * pipSize * conversion;
};

const computeTradePnl = (trade: Trade, currentPrice: number, prices: PriceFeed) => {
  const direction = trade.side === 'LONG' ? 1 : -1;

  if (trade.category === 'forex') {
    const pipSize = trade.pipPrecision ?? 0.0001;
    const pipDiff = (currentPrice - trade.avgPrice) / pipSize;
    const pipValueUsd = computeForexPipValueUsd(trade, currentPrice, prices);
    const lotSize = trade.lotSize ?? (trade.contractSize ? trade.qty / trade.contractSize : trade.displayQty ?? 0);
    return pipDiff * pipValueUsd * lotSize * direction;
  }

  const priceDiff = (currentPrice - trade.avgPrice) * direction;
  return priceDiff * trade.qty;
};

const startPollingPrices = () => {
  if (typeof window === 'undefined' || pollingHandle) {
    return;
  }

  pollingHandle = window.setInterval(() => {
    void useTradingStore.getState().updatePrices();
  }, POLL_INTERVAL_MS);

  void useTradingStore.getState().updatePrices();
};

const ensureSymbolTracked = (symbol: string) => {
  trackedSymbols.add(symbol.toUpperCase());
  startPollingPrices();
};

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => {
      const syncPriceForSymbol = async (rawSymbol: string) => {
        const symbol = rawSymbol.toUpperCase();
        const existing = get().prices[symbol];
        if (typeof existing === 'number') {
          return existing;
        }

        try {
          const quote = await fetchQuoteForSymbol(symbol);
          set((state) => ({
            prices: {
              ...state.prices,
              [symbol]: quote.price,
            },
          }));
          return quote.price;
        } catch (error) {
          console.warn('[market] falling back for', symbol, error);
          const meta = getInstrumentMeta(symbol);
          const fallback =
            meta.category === 'forex'
              ? 1
              : meta.category === 'crypto'
                ? 30_000
                : meta.category === 'indices'
                  ? 4_000
                  : 150;

          set((state) => ({
            prices: {
              ...state.prices,
              [symbol]: fallback,
            },
          }));
          return fallback;
        }
      };

      const registerSymbol = (symbol: string) => {
        const meta = getInstrumentMeta(symbol);
        ensureSymbolTracked(symbol);

        if (meta.quoteCurrency && meta.quoteCurrency !== 'USD') {
          ensureSymbolTracked(`${meta.quoteCurrency}USD`);
        }

        return meta;
      };

      const buildOrder = (
        orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'qty' | 'displayQty' | 'sizingMode'>
      ): Order => {
        const meta = registerSymbol(orderData.symbol);
        const sizingMode = deriveSizingMode(meta);
        const normalizedQty = normalizeQuantity(orderData.qty, meta);

        return {
          ...orderData,
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          qty: normalizedQty,
          displayQty: orderData.qty,
          sizingMode,
          category: meta.category,
          baseCurrency: meta.baseCurrency,
          quoteCurrency: meta.quoteCurrency,
          pipPrecision: meta.pipPrecision,
          contractSize: meta.contractSize,
          status: 'OPEN',
          createdAt: Date.now(),
        };
      };

      const buildTradeFromOrder = (order: Order, price: number): Trade => ({
        id: `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: order.qty,
        displayQty: order.displayQty,
        sizingMode: order.sizingMode,
        category: order.category,
        baseCurrency: order.baseCurrency,
        quoteCurrency: order.quoteCurrency,
        pipPrecision: order.pipPrecision,
        contractSize: order.contractSize,
        lotSize: order.sizingMode === 'LOTS' ? order.displayQty : undefined,
        avgPrice: price,
        pnl: 0,
        openedAt: Date.now(),
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
      });

      return {
        account: {
          balance: 1000,
          equity: 1000,
        },
        orders: [],
        trades: [],
        prices: {},

        placeOrder: async (orderInput) => {
          const order = buildOrder(orderInput);

          if (order.quoteCurrency && order.quoteCurrency !== 'USD' && order.baseCurrency !== 'USD') {
            await syncPriceForSymbol(`${order.quoteCurrency}USD`);
          }

          set((state) => ({
            orders: [...state.orders, order],
          }));

          const executionPrice = await syncPriceForSymbol(order.symbol);

          if (order.type === 'MARKET') {
            const trade = buildTradeFromOrder(order, executionPrice);
            set((state) => ({
              orders: state.orders.map((o) =>
                o.id === order.id ? { ...o, status: 'FILLED' as OrderStatus } : o
              ),
              trades: [...state.trades, trade],
            }));
            get().recalcEquity();
          }
        },

        cancelOrder: (orderId) => {
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, status: 'CANCELLED' as OrderStatus } : order
            ),
          }));
        },

        closeTrade: async (tradeId, reason = 'MANUAL') => {
          const trade = get().trades.find((t) => t.id === tradeId);
          if (!trade || trade.closedAt) {
            return;
          }

          const price = get().prices[trade.symbol] ?? (await syncPriceForSymbol(trade.symbol));
          const pnl = computeTradePnl(trade, price, get().prices);

          set((state) => ({
            trades: state.trades.map((t) =>
              t.id === tradeId ? { ...t, pnl, closedAt: Date.now(), closeReason: reason } : t
            ),
            account: {
              balance: state.account.balance + pnl,
              equity: state.account.balance + pnl,
            },
          }));

          get().recalcEquity();
        },

        updatePrices: async () => {
          const symbols = new Set<string>(trackedSymbols);
          get()
            .orders.filter((o) => o.status === 'OPEN')
            .forEach((order) => symbols.add(order.symbol));
          get()
            .trades.filter((t) => !t.closedAt)
            .forEach((trade) => symbols.add(trade.symbol));

          if (symbols.size === 0) {
            return;
          }

          const quotes = await Promise.all(
            Array.from(symbols).map(async (symbol) => {
              try {
                return await fetchQuoteForSymbol(symbol);
              } catch {
                return null;
              }
            })
          );

          set((state) => {
            const nextPrices = { ...state.prices };
            quotes.forEach((quote) => {
              if (!quote) return;
              nextPrices[quote.symbol] = quote.price;
            });
            return { prices: nextPrices };
          });

          get().checkAndExecuteOrders();
          get().checkStopLossAndTakeProfit();
          get().recalcEquity();
        },

        recalcEquity: () => {
          const { account, trades, prices } = get();
          const openTrades = trades.filter((trade) => !trade.closedAt);

          const unrealized = openTrades.reduce((sum, trade) => {
            const currentPrice = prices[trade.symbol] ?? trade.avgPrice;
            return sum + computeTradePnl(trade, currentPrice, prices);
          }, 0);

          set(() => ({
            account: {
              ...account,
              equity: account.balance + unrealized,
            },
          }));
        },

        checkAndExecuteOrders: () => {
          const { orders, prices } = get();
          const openOrders = orders.filter((order) => order.status === 'OPEN');

          openOrders.forEach((order) => {
            const currentPrice = prices[order.symbol];
            if (!currentPrice) return;

            let shouldExecute = false;

            if (order.type === 'LIMIT' && order.limitPrice) {
              if (order.side === 'LONG' && currentPrice <= order.limitPrice) {
                shouldExecute = true;
              } else if (order.side === 'SHORT' && currentPrice >= order.limitPrice) {
                shouldExecute = true;
              }
            } else if (order.type === 'STOP' && order.stopPrice) {
              if (order.side === 'LONG' && currentPrice >= order.stopPrice) {
                shouldExecute = true;
              } else if (order.side === 'SHORT' && currentPrice <= order.stopPrice) {
                shouldExecute = true;
              }
            }

            if (shouldExecute) {
              const trade = buildTradeFromOrder(order, currentPrice);
              set((state) => ({
                orders: state.orders.map((o) =>
                  o.id === order.id ? { ...o, status: 'FILLED' as OrderStatus } : o
                ),
                trades: [...state.trades, trade],
              }));
            }
          });
        },

        checkStopLossAndTakeProfit: () => {
          const { trades, prices } = get();
          const openTrades = trades.filter((trade) => !trade.closedAt);

          openTrades.forEach((trade) => {
            const currentPrice = prices[trade.symbol];
            if (!currentPrice) return;

            if (trade.takeProfit) {
              const tpHit = trade.side === 'LONG' ? currentPrice >= trade.takeProfit : currentPrice <= trade.takeProfit;
              if (tpHit) {
                void get().closeTrade(trade.id, 'TAKE_PROFIT');
                return;
              }
            }

            if (trade.stopLoss) {
              const slHit = trade.side === 'LONG' ? currentPrice <= trade.stopLoss : currentPrice >= trade.stopLoss;
              if (slHit) {
                void get().closeTrade(trade.id, 'STOP_LOSS');
              }
            }
          });
        },
      };
    },
    {
      name: 'tline-trading-store',
    }
  )
);
