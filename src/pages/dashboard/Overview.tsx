import { useMemo, useState } from "react";
import { formatDistanceStrict } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Target, TrendingUp } from "lucide-react";

import { AnalyticsChart } from "@/components/AnalyticsChart";
import { OrderModal } from "@/components/OrderModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { useRealTimeQuote } from "@/hooks/useRealTimeQuote";
import { useTradingStore, type Order, type Trade } from "@/store/tradingStore";
import { cn } from "@/lib/utils";

const chartUniverse = [
  { label: "BTC/USDT", key: "BTCUSD", tradingView: "CRYPTO:BTCUSD" },
  { label: "ETH/USDT", key: "ETHUSD", tradingView: "CRYPTO:ETHUSD" },
  { label: "AAPL", key: "AAPL", tradingView: "NASDAQ:AAPL" },
  { label: "SPX", key: "SPX", tradingView: "SP:SPX" }
];

const formatCurrency = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    ...options
  }).format(value);

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1 ? 2 : 4
  }).format(value);

const derivePlatform = (symbol: string) => {
  if (["BTCUSD", "ETHUSD", "SOLUSD"].includes(symbol)) {
    return "DEX";
  }
  if (["AAPL", "MSFT", "AMZN", "NVDA"].includes(symbol)) {
    return "NYSE";
  }
  return "CEX";
};

const dayMs = 1000 * 60 * 60 * 24;

const getPositionUnits = (trade: Trade) =>
  trade.sizingMode === "LOTS" ? (trade.lotSize ?? 0) * (trade.contractSize ?? 100_000) : trade.qty;

const getDisplayAmount = (trade: Trade) => (trade.sizingMode === "LOTS" ? trade.lotSize ?? 0 : trade.qty);

const computeStrategyRows = (orders: Order[], trades: Trade[], prices: Record<string, number>) => {
  const orderMap = new Map<string, Order>();
  orders.forEach((order) => orderMap.set(order.id, order));

  const rows = new Map<
    string,
    {
      symbol: string;
      platform: string;
      pnl: number;
      realizedVolume: number;
      lastTrade?: Trade;
      status: "Open" | "Closed";
      lastOrderType?: Order["type"];
    }
  >();

  trades.forEach((trade) => {
    const current = rows.get(trade.symbol) ?? {
      symbol: trade.symbol,
      platform: derivePlatform(trade.symbol),
      pnl: 0,
      realizedVolume: 0,
      status: "Closed" as const
    };

    if (trade.closedAt) {
      current.pnl += trade.pnl;
      current.realizedVolume += trade.avgPrice * getPositionUnits(trade);
    } else {
      current.status = "Open";
    }

    current.lastTrade = trade;
    const order = orderMap.get(trade.orderId);
    if (order) {
      current.lastOrderType = order.type;
    }

    rows.set(trade.symbol, current);
  });

  return Array.from(rows.values())
    .sort((a, b) => b.pnl - a.pnl)
    .map((row) => {
      const trade = row.lastTrade;
      const entry = trade?.avgPrice ?? 0;
      const exit =
        trade && trade.closedAt
          ? trade.takeProfit ?? trade.stopLoss ?? trade.avgPrice
          : prices[row.symbol] ?? entry;

      const gain = row.realizedVolume ? (row.pnl / row.realizedVolume) * 100 : 0;

      return {
        symbol: row.symbol,
        platform: row.platform,
        pnl: row.pnl,
        gain,
        fees: row.realizedVolume * 0.0005,
        entry,
        exit,
        status: row.status,
        orderType: row.lastOrderType ?? "MARKET"
      };
    });
};

const Overview = () => {
  const { user } = useAuth();
  const preference = user?.preference;
  const account = useTradingStore((state) => state.account);
  const trades = useTradingStore((state) => state.trades);
  const orders = useTradingStore((state) => state.orders);
  const prices = useTradingStore((state) => state.prices);

  const [selectedSymbolKey, setSelectedSymbolKey] = useState(chartUniverse[0].key);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const selectedUniverse = chartUniverse.find((asset) => asset.key === selectedSymbolKey) ?? chartUniverse[0];
  const quote = useRealTimeQuote(selectedSymbolKey);
  const livePrice = quote.price ?? prices[selectedUniverse.key] ?? 0;

  const selectedTrades = trades.filter((trade) => trade.symbol === selectedSymbolKey);
  const now = Date.now();
  const last24h = now - dayMs;

  const symbolTrades24h = selectedTrades.filter(
    (trade) => trade.openedAt >= last24h || (trade.closedAt && trade.closedAt >= last24h)
  );
  const high24h =
    quote.high24h ?? (symbolTrades24h.length > 0 ? Math.max(...symbolTrades24h.map((trade) => trade.avgPrice)) : livePrice);
  const low24h =
    quote.low24h ?? (symbolTrades24h.length > 0 ? Math.min(...symbolTrades24h.map((trade) => trade.avgPrice)) : livePrice);
  const volume24hSymbol =
    quote.volume24h ?? symbolTrades24h.reduce((sum, trade) => sum + getDisplayAmount(trade), 0);

  const previousPrice = quote.price ?? selectedTrades[selectedTrades.length - 1]?.avgPrice ?? livePrice;
  const priceDelta = livePrice - previousPrice;
  const priceDeltaPct = quote.changePercent ?? (previousPrice ? (priceDelta / previousPrice) * 100 : 0);

  const startingBalance = Number(preference?.startingBalance ?? account.balance);
  const currentBalance = Number(preference?.currentBalance ?? account.balance);
  const netProfitLoss = currentBalance - startingBalance;
  const pnlDelta = startingBalance ? (netProfitLoss / startingBalance) * 100 : 0;
  const tradesTaken = trades.length;

  const buyHoldReference = selectedTrades[0]?.avgPrice ?? livePrice;
  const buyHoldReturn = livePrice - buyHoldReference;

  const uptime = trades.length
    ? formatDistanceStrict(new Date(trades[0].openedAt), new Date(), { roundingMethod: "floor" })
    : "N/A";

  const strategyRows = useMemo(() => computeStrategyRows(orders, trades, prices), [orders, trades, prices]);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#050505] p-4 text-white shadow-amber-500/10 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          {chartUniverse.map((asset) => (
            <Button
              key={asset.key}
              variant={asset.key === selectedSymbolKey ? "secondary" : "ghost"}
              className={cn(
                "rounded-full px-4 text-sm font-semibold",
                asset.key === selectedSymbolKey ? "bg-white text-black" : "text-muted-foreground hover:text-white"
              )}
              onClick={() => setSelectedSymbolKey(asset.key)}
            >
              {asset.label}
            </Button>
          ))}
          <div className="w-full sm:ml-auto sm:w-auto">
            <Button
              variant="outline"
              className="w-full rounded-full border-amber-400/60 text-white hover:bg-amber-400/10 sm:w-auto"
              onClick={() => setOrderModalOpen(true)}
              disabled={preference?.accountStatus === "STOPPED_OUT"}
            >
              <Target className="mr-2 h-4 w-4 text-amber-300" />
              New Trade
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/10 bg-black/50">
            <CardContent className="flex flex-col gap-1 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current Price</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">{formatCurrency(livePrice)}</p>
                <Badge
                  variant={priceDelta >= 0 ? "secondary" : "destructive"}
                  className="flex items-center gap-1 border-0 text-xs"
                >
                  {priceDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {priceDeltaPct.toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/50">
            <CardContent className="py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">24h High</p>
              <p className="text-2xl font-semibold">{formatCurrency(high24h)}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/50">
            <CardContent className="py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">24h Low</p>
              <p className="text-2xl font-semibold">{formatCurrency(low24h)}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/50">
            <CardContent className="py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-semibold">{formatQuantity(volume24hSymbol)} {selectedUniverse.label.split("/")[0]}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
            <p className="text-white">
              Net Profit/Loss:{" "}
              <span className={netProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"}>
                {formatCurrency(netProfitLoss)} ({pnlDelta.toFixed(2)}%)
              </span>
            </p>
            <p>Buy & Hold Return: {formatCurrency(buyHoldReturn)}</p>
            <p>Pair: {selectedUniverse.label}</p>
            <p>Uptime: {uptime}</p>
            <p>Trades Taken: {tradesTaken}</p>
            <p>Plan: {preference?.subscriptionTier ?? "COMMUNITY"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/5 bg-[#040506] p-4 text-white shadow-inner shadow-black/30 sm:p-5">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Pair overview</p>
            <h2 className="text-2xl font-semibold">{selectedUniverse.label}</h2>
            <p className="text-sm text-muted-foreground">Bitstamp · Indicators on · Show/Hide trades</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:justify-end">
            <span className="flex-1 sm:text-right">
              Last sync:{" "}
              {quote.lastUpdated
                ? formatDistanceStrict(new Date(quote.lastUpdated), new Date(), {
                    roundingMethod: "floor"
                  })
                : "N/A"}{" "}
              ago
            </span>
            <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
              Active
            </Badge>
          </div>
        </div>
        <div className="mt-4 h-[360px] rounded-[28px] border border-white/10 bg-black/60 p-2 sm:h-[420px] lg:h-[540px]">
          <AnalyticsChart symbol={selectedUniverse.tradingView} className="h-full w-full" />
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#050505] p-4 text-white shadow-amber-500/5 shadow-inner sm:p-6">
        <div className="flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Strategies</p>
            <h2 className="text-2xl font-semibold">Live trade history</h2>
          </div>
          <Badge variant="outline" className="border-white/20 text-white/80">
            {strategyRows.length} rows
          </Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 text-left font-medium">Strategy</th>
                <th className="py-2 text-left font-medium">Platform</th>
                <th className="py-2 text-right font-medium">Profit/Loss</th>
                <th className="py-2 text-right font-medium">% Gain/Loss</th>
                <th className="py-2 text-right font-medium">Fees/Slippage</th>
                <th className="py-2 text-right font-medium">Entry Price</th>
                <th className="py-2 text-right font-medium">Exit Price</th>
                <th className="py-2 text-center font-medium">Status</th>
                <th className="py-2 text-center font-medium">Order Type</th>
              </tr>
            </thead>
            <tbody>
              {strategyRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-muted-foreground">
                    No strategy executions yet. Place an order to populate the table.
                  </td>
                </tr>
              )}
              {strategyRows.map((row) => (
                <tr key={row.symbol} className="border-t border-white/5">
                  <td className="py-3 font-semibold">{row.symbol}</td>
                  <td className="py-3 text-muted-foreground">{row.platform}</td>
                  <td className={cn("py-3 text-right font-semibold", row.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {formatCurrency(row.pnl)}
                  </td>
                  <td className="py-3 text-right">{row.gain.toFixed(2)}%</td>
                  <td className="py-3 text-right">{formatCurrency(row.fees)}</td>
                  <td className="py-3 text-right">{formatCurrency(row.entry)}</td>
                  <td className="py-3 text-right">{formatCurrency(row.exit)}</td>
                  <td className="py-3 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border px-3",
                        row.status === "Open" ? "border-emerald-500/40 text-emerald-200" : "border-white/20 text-white/80"
                      )}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{row.orderType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <OrderModal open={orderModalOpen} onOpenChange={setOrderModalOpen} />
    </div>
  );
};

export default Overview;

