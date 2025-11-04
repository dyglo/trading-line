import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Side = 'LONG' | 'SHORT';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED';

export interface Order {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
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
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => void;
  cancelOrder: (orderId: string) => void;
  closeTrade: (tradeId: string, reason?: 'MANUAL' | 'TAKE_PROFIT' | 'STOP_LOSS') => void;
  updatePrices: () => void;
  recalcEquity: () => void;
  checkAndExecuteOrders: () => void;
  checkStopLossAndTakeProfit: () => void;
}

const SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'WMT',
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
  'BTCUSD', 'ETHUSD', 'SOLUSD',
  'XAUUSD', 'XAGUSD', 'CRUDE',
  'SPX', 'DJI', 'NASDAQ'
];

const initialPrices: PriceFeed = {
  AAPL: 178.50,
  MSFT: 410.20,
  GOOGL: 141.80,
  AMZN: 178.35,
  NVDA: 495.20,
  META: 485.50,
  TSLA: 242.80,
  JPM: 195.40,
  V: 275.90,
  WMT: 165.20,
  EURUSD: 1.0850,
  GBPUSD: 1.2720,
  USDJPY: 149.85,
  AUDUSD: 0.6520,
  USDCAD: 1.3580,
  BTCUSD: 43250.00,
  ETHUSD: 2280.50,
  SOLUSD: 98.75,
  XAUUSD: 2045.30,
  XAGUSD: 24.15,
  CRUDE: 78.50,
  SPX: 4783.50,
  DJI: 37440.20,
  NASDAQ: 14876.90,
};

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      account: {
        balance: 10000,
        equity: 10000,
      },
      orders: [],
      trades: [],
      prices: initialPrices,

      placeOrder: (orderData) => {
        const order: Order = {
          ...orderData,
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'OPEN',
          createdAt: Date.now(),
        };

        set((state) => ({ orders: [...state.orders, order] }));

        // Auto-fill market orders
        if (order.type === 'MARKET') {
          setTimeout(() => {
            const currentPrice = get().prices[order.symbol] || 100;
            const trade: Trade = {
              id: `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              orderId: order.id,
              symbol: order.symbol,
              side: order.side,
              qty: order.qty,
              avgPrice: currentPrice,
              pnl: 0,
              openedAt: Date.now(),
              takeProfit: order.takeProfit,
              stopLoss: order.stopLoss,
            };

            set((state) => ({
              orders: state.orders.map((o) =>
                o.id === order.id ? { ...o, status: 'FILLED' as OrderStatus } : o
              ),
              trades: [...state.trades, trade],
            }));

            get().recalcEquity();
          }, 500);
        }
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o
          ),
        }));
      },

      closeTrade: (tradeId, reason = 'MANUAL') => {
        const trade = get().trades.find((t) => t.id === tradeId);
        if (!trade || trade.closedAt) return;

        const currentPrice = get().prices[trade.symbol] || trade.avgPrice;
        const priceDiff = trade.side === 'LONG'
          ? currentPrice - trade.avgPrice
          : trade.avgPrice - currentPrice;
        const pnl = priceDiff * trade.qty;

        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === tradeId ? { ...t, pnl, closedAt: Date.now(), closeReason: reason } : t
          ),
          account: {
            ...state.account,
            balance: state.account.balance + pnl,
          },
        }));

        get().recalcEquity();
      },

      updatePrices: () => {
        set((state) => {
          const newPrices = { ...state.prices };
          SYMBOLS.forEach((symbol) => {
            const currentPrice = newPrices[symbol] || 100;
            const change = (Math.random() - 0.5) * currentPrice * 0.002;
            newPrices[symbol] = Math.max(0.01, currentPrice + change);
          });
          return { prices: newPrices };
        });

        // Check for order executions and TP/SL triggers
        get().checkAndExecuteOrders();
        get().checkStopLossAndTakeProfit();
        get().recalcEquity();
      },

      checkAndExecuteOrders: () => {
        const { orders, prices } = get();
        const openOrders = orders.filter((o) => o.status === 'OPEN');

        openOrders.forEach((order) => {
          const currentPrice = prices[order.symbol];
          if (!currentPrice) return;

          let shouldExecute = false;

          if (order.type === 'LIMIT' && order.limitPrice) {
            // LONG LIMIT: Execute when price drops to or below limit
            // SHORT LIMIT: Execute when price rises to or above limit
            if (order.side === 'LONG' && currentPrice <= order.limitPrice) {
              shouldExecute = true;
            } else if (order.side === 'SHORT' && currentPrice >= order.limitPrice) {
              shouldExecute = true;
            }
          } else if (order.type === 'STOP' && order.stopPrice) {
            // LONG STOP: Execute when price rises to or above stop (buy breakout)
            // SHORT STOP: Execute when price drops to or below stop (sell breakdown)
            if (order.side === 'LONG' && currentPrice >= order.stopPrice) {
              shouldExecute = true;
            } else if (order.side === 'SHORT' && currentPrice <= order.stopPrice) {
              shouldExecute = true;
            }
          }

          if (shouldExecute) {
            const trade: Trade = {
              id: `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              orderId: order.id,
              symbol: order.symbol,
              side: order.side,
              qty: order.qty,
              avgPrice: currentPrice,
              pnl: 0,
              openedAt: Date.now(),
              takeProfit: order.takeProfit,
              stopLoss: order.stopLoss,
            };

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
        const openTrades = trades.filter((t) => !t.closedAt);

        openTrades.forEach((trade) => {
          const currentPrice = prices[trade.symbol];
          if (!currentPrice) return;

          // Check Take Profit
          if (trade.takeProfit) {
            const tpHit = trade.side === 'LONG' 
              ? currentPrice >= trade.takeProfit 
              : currentPrice <= trade.takeProfit;
            
            if (tpHit) {
              get().closeTrade(trade.id, 'TAKE_PROFIT');
              return;
            }
          }

          // Check Stop Loss
          if (trade.stopLoss) {
            const slHit = trade.side === 'LONG' 
              ? currentPrice <= trade.stopLoss 
              : currentPrice >= trade.stopLoss;
            
            if (slHit) {
              get().closeTrade(trade.id, 'STOP_LOSS');
              return;
            }
          }
        });
      },

      recalcEquity: () => {
        const { account, trades, prices } = get();
        const openTrades = trades.filter((t) => !t.closedAt);
        
        const unrealizedPnL = openTrades.reduce((sum, trade) => {
          const currentPrice = prices[trade.symbol] || trade.avgPrice;
          const priceDiff = trade.side === 'LONG'
            ? currentPrice - trade.avgPrice
            : trade.avgPrice - currentPrice;
          return sum + (priceDiff * trade.qty);
        }, 0);

        set((state) => ({
          account: {
            ...state.account,
            equity: state.account.balance + unrealizedPnL,
          },
        }));
      },
    }),
    {
      name: 'tline-trading-store',
    }
  )
);

// Start price feed updates
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTradingStore.getState().updatePrices();
  }, 3000);
}
