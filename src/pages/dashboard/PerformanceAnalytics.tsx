import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  Pie,
  PieChart,
  type TooltipProps,
  type Payload
} from "recharts";

import {
  AnalyticsToolbar,
  type AnalyticsSegmentValue,
  type FilterOption,
  type SegmentOption
} from "@/components/dashboard/AnalyticsToolbar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRealTimeQuote } from "@/hooks/useRealTimeQuote";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const DAY_MS = 86_400_000;

const strategyOptions: FilterOption[] = [
  { value: "moon_scalper", label: "MoonScalper", description: "High-frequency ETH scalp" },
  { value: "stellar_grid", label: "Stellar Grid", description: "Mean-reversion grid bot" },
  { value: "quant_fusion", label: "Quant Fusion", description: "Macro hedge overlay" }
];

const timeframeOptions: FilterOption[] = [
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "6M", label: "6 Months" },
  { value: "1Y", label: "1 Year" }
];

const venueOptions: FilterOption[] = [
  { value: "binance", label: "Binance", description: "Primary crypto venue" },
  { value: "coinbase", label: "Coinbase", description: "US-regulated" },
  { value: "nyse", label: "NYSE", description: "Equities desk" }
];

const marketOptions: FilterOption[] = [
  { value: "ETHUSD", label: "ETH / USDT", description: "Ethereum spot pair" },
  { value: "BTCUSD", label: "BTC / USDT", description: "Bitcoin spot pair" },
  { value: "AAPL", label: "AAPL", description: "Apple equity" },
  { value: "EURUSD", label: "EUR / USD", description: "Major FX pair" }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: value >= 1 ? 2 : 4 }).format(value);

const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const formatDuration = (ms: number) => {
  if (ms <= 0) return "—";
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const ChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const tooltipPayload = payload as Payload<number, string>[];
  const pnl = tooltipPayload.find((p) => p.dataKey === "pnl");
  const drawdown = tooltipPayload.find((p) => p.dataKey === "drawdown");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 px-4 py-3 shadow-2xl">
      {pnl ? (
        <p className="text-sm font-semibold text-white">
          PnL: <span className="text-long">{formatPercent(pnl.value)}</span>
        </p>
      ) : null}
      {drawdown ? (
        <p className="text-xs text-white/70">
          Drawdown: <span className="text-short">{formatPercent(drawdown.value)}</span>
        </p>
      ) : null}
    </div>
  );
};

const MetricCell = ({
  label,
  value,
  helper,
  tone
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "positive" | "negative" | "muted";
}) => (
  <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">{label}</p>
    <p
      className={cn(
        "text-xl font-semibold",
        tone === "positive" && "text-long",
        tone === "negative" && "text-short",
        !tone && "text-white"
      )}
    >
      {value}
    </p>
    {helper ? <p className="text-xs text-white/60">{helper}</p> : null}
  </div>
);

const PerformanceAnalytics = () => {
  const navigate = useNavigate();
  const [segment, setSegment] = useState<AnalyticsSegmentValue>("statistics");
  const [strategy, setStrategy] = useState(strategyOptions[0].value);
  const [timeframe, setTimeframe] = useState(timeframeOptions[4].value);
  const [venue, setVenue] = useState(venueOptions[0].value);
  const [market, setMarket] = useState(marketOptions[0].value);

  const quote = useRealTimeQuote(market);

  const {
    data,
    isLoading,
    error
  } = useAnalyticsData(
    {
      strategy: strategy || undefined,
      timeframe: timeframe || undefined,
      venue: venue || undefined,
      market: market || undefined
    },
    true
  );

  // Provide fallback data while loading
  const analytics = data || {
    chart: [],
    realizedPnl: 0,
    openPnl: 0,
    netPnl: 0,
    netPnlPercent: 0,
    openPnlPercent: 0,
    maxDrawdownValue: 0,
    maxDrawdownPercent: 0,
    closedTrades: 0,
    openTrades: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    longTrades: 0,
    shortTrades: 0,
    winRate: 0,
    profitFactor: 0,
    avgTrade: 0,
    avgWinningTrade: 0,
    avgLosingTrade: 0,
    largestWin: 0,
    largestLoss: 0,
    sortinoRatio: 0,
    sharpeRatio: 0,
    commissionPaid: 0,
    runDuration: 0,
    volume24h: 0
  };

  const selectedMarket = marketOptions.find((option) => option.value === market);
  const baseSymbol = selectedMarket?.label.split("/")[0] ?? selectedMarket?.label ?? "Asset";

  const summaryCards = [
    {
      label: "Trade Number",
      value: `#${Math.max(analytics.totalTrades, 1).toString().padStart(2, "0")}`,
      helper: "Sequence number"
    },
    {
      label: "Net Profit/Loss",
      value: formatCurrency(analytics.netPnl),
      helper: formatPercent(analytics.netPnlPercent),
      tone: analytics.netPnl >= 0 ? "positive" : "negative"
    },
    {
      label: "Buy & Hold Return",
      value: formatCurrency(analytics.openPnl),
      helper: formatPercent(analytics.openPnlPercent),
      tone: analytics.openPnl >= 0 ? "positive" : "negative"
    },
    {
      label: "24h Low",
        value: quote.low24h ? `${formatNumber(quote.low24h)} ${baseSymbol}` : "-",
      helper: `${baseSymbol} 24h low`
    },
    {
      label: "24h Volume",
      value: quote.volume24h ? `${formatNumber(quote.volume24h)} ${baseSymbol}` : formatNumber(analytics.volume24h),
      helper: `${baseSymbol} volume window`
    },
    {
      label: "Maximum Drawdown",
      value: formatCurrency(analytics.maxDrawdownValue),
      helper: formatPercent(-analytics.maxDrawdownPercent),
      tone: "negative"
    }
  ];

  const segmentOptions: SegmentOption[] = [
    { value: "statistics", label: "Statistics Dashboard" },
    { value: "trade-history", label: "Trade History", badge: analytics.closedTrades },
    { value: "custom-reports", label: "Custom Reports" }
  ];

  const handleSegmentChange = (next: AnalyticsSegmentValue) => {
    if (next === "trade-history") {
      navigate("/dashboard/trade-history");
      return;
    }

    if (next === "custom-reports") {
      navigate("/dashboard/reports");
      return;
    }

    setSegment("statistics");
  };

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <AnalyticsToolbar
            segments={segmentOptions}
            activeSegment={segment}
            onSegmentChange={handleSegmentChange}
            strategy={strategy}
            timeframe={timeframe}
            venue={venue}
            market={market}
            onStrategyChange={setStrategy}
            onTimeframeChange={setTimeframe}
            onVenueChange={setVenue}
            onMarketChange={setMarket}
            strategyOptions={strategyOptions}
            timeframeOptions={timeframeOptions}
            venueOptions={venueOptions}
            marketOptions={marketOptions}
          />

          <div className="space-y-6 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[12px] uppercase tracking-[0.4em] text-white/50">Statistics Dashboard</p>
                <p className="text-2xl font-semibold text-white">{selectedMarket?.label ?? "Markets"}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p>Strategy: {strategyOptions.find((opt) => opt.value === strategy)?.label}</p>
                <p>Updated {quote.lastUpdated ? new Date(quote.lastUpdated).toLocaleTimeString() : "just now"}</p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.chart} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} axisLine={false} />
                  <YAxis
                    yAxisId="pnl"
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                    axisLine={false}
                    stroke="transparent"
                  />
                  <YAxis
                    yAxisId="drawdown"
                    orientation="right"
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                    axisLine={false}
                    stroke="transparent"
                  />
                  <ReferenceLine yAxisId="pnl" y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    yAxisId="pnl"
                    stroke="#22c55e"
                    strokeWidth={2.4}
                    fillOpacity={1}
                    fill="url(#pnlGradient)"
                    activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="drawdown"
                    yAxisId="drawdown"
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "#f87171", fill: "#050505" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">{card.label}</p>
                  <p
                    className={cn(
                      "text-xl font-semibold",
                      card.tone === "positive" && "text-long",
                      card.tone === "negative" && "text-short"
                    )}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs text-white/60">{card.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
            <div className="rounded-[28px] border border-white/5 bg-black/40 p-6">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Profit Factor</p>
              <div className="relative mt-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Won", value: analytics.winningTrades },
                        { name: "Lost", value: analytics.losingTrades }
                      ]}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="transparent"
                      dataKey="value"
                    >
                      <Cell key="won" fill="#22c55e" />
                      <Cell key="lost" fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-4xl font-semibold">{analytics.profitFactor.toFixed(2)}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Factor</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MetricCell
                  label="Won"
                  value={`${analytics.winningTrades} / ${formatPercent(analytics.winRate)}`}
                  helper="Winning trades"
                  tone="positive"
                />
                <MetricCell
                  label="Lost"
                  value={`${analytics.losingTrades} / ${formatPercent(100 - analytics.winRate)}`}
                  helper="Losing trades"
                  tone="negative"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-black/40 p-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Session Metrics</p>
              <div className="grid gap-3">
                <MetricCell label="Closed Trades" value={`${analytics.closedTrades}`} helper="Settled positions" />
                <MetricCell label="Time Run" value={formatDuration(analytics.runDuration)} helper="Strategy runtime" />
                <MetricCell
                  label="Sortino Ratio"
                  value={analytics.sortinoRatio.toFixed(3)}
                  helper="Downside-adjusted returns"
                />
                <MetricCell
                  label="Sharpe Ratio"
                  value={analytics.sharpeRatio.toFixed(3)}
                  helper="Volatility-adjusted"
                />
                <MetricCell
                  label="Commission Paid"
                  value={formatCurrency(analytics.commissionPaid)}
                  helper="Assumes 5 bps per fill"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-black/40 p-6 space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Trade Quality</p>
              <div className="grid gap-3">
                <MetricCell label="Avg Trade" value={formatCurrency(analytics.avgTrade)} helper="Per closed trade" />
                <MetricCell
                  label="Avg Winning Trade"
                  value={formatCurrency(analytics.avgWinningTrade)}
                  helper="Closed winners"
                  tone="positive"
                />
                <MetricCell
                  label="Avg Losing Trade"
                  value={formatCurrency(analytics.avgLosingTrade)}
                  helper="Closed losers"
                  tone="negative"
                />
                <MetricCell label="Largest Win" value={formatCurrency(analytics.largestWin)} tone="positive" />
                <MetricCell label="Largest Loss" value={formatCurrency(analytics.largestLoss)} tone="negative" />
                <div className="grid grid-cols-2 gap-3">
                  <MetricCell label="Long Trades" value={`${analytics.longTrades}`} />
                  <MetricCell label="Short Trades" value={`${analytics.shortTrades}`} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
