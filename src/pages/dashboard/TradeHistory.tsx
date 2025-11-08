import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";

import {
  AnalyticsToolbar,
  type AnalyticsSegmentValue,
  type FilterOption,
  type SegmentOption
} from "@/components/dashboard/AnalyticsToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTradingStore, type Trade } from "@/store/tradingStore";

const formatCurrency = (value: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts }).format(
    value
  );

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: value >= 1 ? 2 : 4 }).format(value);

const formatSymbol = (symbol: string) => {
  if (symbol.length === 6) {
    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3);
    return `${base}/${quote}`;
  }
  if (symbol.endsWith("USD")) {
    return `${symbol.replace("USD", "")}/USD`;
  }
  return symbol;
};

const getDisplayQuantity = (trade: Trade) => {
  if (trade.sizingMode === "LOTS") {
    const lots = trade.lotSize ?? (trade.contractSize ? trade.qty / (trade.contractSize ?? 100_000) : 0);
    return lots;
  }
  return trade.displayQty ?? trade.qty;
};

const getNotionalValue = (trade: Trade) => {
  const qty =
    trade.sizingMode === "LOTS"
      ? (trade.lotSize ?? (trade.contractSize ? trade.qty / trade.contractSize : 0)) * (trade.contractSize ?? 100_000)
      : trade.qty;
  return Math.abs(qty * trade.avgPrice);
};

const estimateFee = (trade: Trade) => getNotionalValue(trade) * 0.0005;

const coinColor = (symbol: string) => {
  const palette = ["#f97316", "#a855f7", "#22d3ee", "#facc15", "#38bdf8", "#f43f5e", "#14b8a6"];
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

const priceFilters = [
  { value: "all", label: "Filter by Price" },
  { value: "lt1k", label: "< $1K" },
  { value: "1to10k", label: "$1K - $10K" },
  { value: "10to50k", label: "$10K - $50K" },
  { value: "gt50k", label: "> $50K" }
];

const quantityFilters = [
  { value: "all", label: "Filter by Quantity" },
  { value: "lt1", label: "< 1" },
  { value: "1to10", label: "1 - 10" },
  { value: "10to100", label: "10 - 100" },
  { value: "gt100", label: "> 100" }
];

type TabValue = "all" | "buy" | "sell";

const TradeHistory = () => {
  const navigate = useNavigate();
  const trades = useTradingStore((state) => state.trades);
  const closedTrades = useMemo(
    () => trades.filter((trade) => Boolean(trade.closedAt)).sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0)),
    [trades]
  );

  const [segment, setSegment] = useState<AnalyticsSegmentValue>("trade-history");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [coinFilter, setCoinFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [quantityFilter, setQuantityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);

  const coinOptions: FilterOption[] = useMemo(() => {
    const unique = Array.from(new Set(closedTrades.map((trade) => trade.symbol)));
    return [
      { value: "all", label: "Filter by Coin" },
      ...unique.map((symbol) => ({ value: symbol, label: formatSymbol(symbol) }))
    ];
  }, [closedTrades]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateRange, coinFilter, priceFilter, quantityFilter, activeTab]);

  const filteredBase = useMemo(() => {
    return closedTrades.filter((trade) => {
      const needle = searchTerm.trim().toLowerCase();
      if (needle) {
        const haystack = `${trade.symbol} ${trade.orderId}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      if (dateRange?.from) {
        const comparisonDate = new Date(trade.closedAt ?? trade.openedAt);
        const from = new Date(dateRange.from);
        const to = dateRange.to ? new Date(dateRange.to) : from;
        to.setHours(23, 59, 59, 999);
        if (comparisonDate < from || comparisonDate > to) {
          return false;
        }
      }

      if (coinFilter !== "all" && trade.symbol !== coinFilter) {
        return false;
      }

      const price = trade.avgPrice;
      if (
        (priceFilter === "lt1k" && price >= 1_000) ||
        (priceFilter === "1to10k" && (price < 1_000 || price > 10_000)) ||
        (priceFilter === "10to50k" && (price < 10_000 || price > 50_000)) ||
        (priceFilter === "gt50k" && price <= 50_000)
      ) {
        return false;
      }

      const quantity = Math.abs(getDisplayQuantity(trade));
      if (
        (quantityFilter === "lt1" && quantity >= 1) ||
        (quantityFilter === "1to10" && (quantity < 1 || quantity > 10)) ||
        (quantityFilter === "10to100" && (quantity < 10 || quantity > 100)) ||
        (quantityFilter === "gt100" && quantity <= 100)
      ) {
        return false;
      }

      return true;
    });
  }, [closedTrades, searchTerm, dateRange, coinFilter, priceFilter, quantityFilter]);

  const tabCounts = useMemo(
    () => ({
      all: filteredBase.length,
      buy: filteredBase.filter((trade) => trade.side === "LONG").length,
      sell: filteredBase.filter((trade) => trade.side === "SHORT").length
    }),
    [filteredBase]
  );

  const filteredTrades = useMemo(() => {
    if (activeTab === "all") return filteredBase;
    return filteredBase.filter((trade) => (activeTab === "buy" ? trade.side === "LONG" : trade.side === "SHORT"));
  }, [filteredBase, activeTab]);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedTrades = filteredTrades.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const segments: SegmentOption[] = [
    { value: "statistics", label: "Statistics Dashboard" },
    { value: "trade-history", label: "Trade History", badge: closedTrades.length },
    { value: "custom-reports", label: "Custom Reports", icon: Sparkles }
  ];

  const handleSegmentChange = (next: AnalyticsSegmentValue) => {
    if (next === "statistics") {
      navigate("/dashboard/analytics");
      return;
    }

    if (next === "custom-reports") {
      navigate("/dashboard/reports");
      return;
    }

    setSegment("trade-history");
  };

  const resetFilters = () => {
    setDateRange(undefined);
    setCoinFilter("all");
    setPriceFilter("all");
    setQuantityFilter("all");
    setSearchTerm("");
    setActiveTab("all");
  };

  const renderDateLabel = () => {
    if (!dateRange?.from) {
      return "Select Date";
    }
    if (!dateRange.to) {
      return format(dateRange.from, "MMM d, yyyy");
    }
    const from = format(dateRange.from, "MMM d");
    const to = format(dateRange.to, "MMM d, yyyy");
    return `${from} - ${to}`;
  };

  const badgeCount = filteredTrades.length;

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <AnalyticsToolbar
            segments={segments}
            activeSegment={segment}
            onSegmentChange={handleSegmentChange}
            strategy="moon_scalper"
            timeframe="1M"
            venue="binance"
            market="ETHUSD"
            onStrategyChange={() => undefined}
            onTimeframeChange={() => undefined}
            onVenueChange={() => undefined}
            onMarketChange={() => undefined}
            strategyOptions={[{ value: "moon_scalper", label: "MoonScalper" }]}
            timeframeOptions={[{ value: "1M", label: "1 Month" }]}
            venueOptions={[{ value: "binance", label: "Binance" }]}
            marketOptions={[{ value: "ETHUSD", label: "ETH / USDT" }]}
            rightSlot={
              <div className="hidden lg:block">
                <Input
                  placeholder="Quick search"
                  className="h-12 w-[260px] rounded-full border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-white/50 focus-visible:border-primary focus-visible:ring-0"
                />
              </div>
            }
          />

          <div className="rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Trade History</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-2xl font-semibold">Transactions</span>
                  <Badge variant="secondary" className="rounded-full bg-white/10 text-xs uppercase tracking-widest">
                    {closedTrades.length} Total
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  className="rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-white/70 hover:border-white/30"
                  onClick={resetFilters}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search for trades"
                    className="h-12 min-w-[220px] rounded-full border-white/10 bg-white/5 pl-11 text-sm text-white placeholder:text-white/50 focus-visible:border-primary focus-visible:ring-0"
                  />
                  <Search className="pointer-events-none -ml-10 h-4 w-4 text-white/50" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-16 w-full justify-start rounded-2xl border-white/10 bg-white/5 text-left text-white hover:border-white/30"
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 text-white/60" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">Select Date</p>
                      <p className="text-sm font-semibold">{renderDateLabel()}</p>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-2xl border-white/10 bg-[#050505] p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                  <div className="flex items-center justify-between border-t border-white/10 p-3 text-xs text-white/60">
                    <span>{dateRange?.from ? "Custom range applied" : "No range selected"}</span>
                    <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={coinFilter} onValueChange={setCoinFilter}>
                <SelectTrigger className="h-16 w-full rounded-2xl border-white/10 bg-white/5 px-4 text-left text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#050505] text-white">
                  {coinOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-16 w-full rounded-2xl border-white/10 bg-white/5 px-4 text-left text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#050505] text-white">
                  {priceFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                <SelectTrigger className="h-16 w-full rounded-2xl border-white/10 bg-white/5 px-4 text-left text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-[#050505] text-white">
                  {quantityFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {([
                  { value: "all", label: "All Trades" },
                  { value: "buy", label: "Buy Side" },
                  { value: "sell", label: "Sell Side" }
                ] as const).map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition",
                      activeTab === tab.value
                        ? "border-primary bg-primary/10 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                    )}
                  >
                    {tab.label}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2 py-0 text-[11px]",
                        activeTab === tab.value ? "bg-primary text-black" : "bg-white/10 text-white/70"
                      )}
                    >
                      {tabCounts[tab.value]}
                    </Badge>
                  </button>
                ))}
              </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/5 bg-black/60">
              <div className="max-h-[520px] overflow-auto">
                <Table className="min-w-[720px]">
                  <TableHeader className="sticky top-0 z-10 bg-black/80 backdrop-blur">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-white/70">Date</TableHead>
                      <TableHead className="text-white/70">Coin</TableHead>
                      <TableHead className="text-white/70">Side</TableHead>
                      <TableHead className="text-right text-white/70">Price</TableHead>
                      <TableHead className="text-right text-white/70">Quantity</TableHead>
                      <TableHead className="text-right text-white/70">Fee</TableHead>
                      <TableHead className="text-right text-white/70">Realized Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTrades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center text-white/60">
                          No trades match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTrades.map((trade) => {
                        const timestamp = new Date(trade.closedAt ?? trade.openedAt).toLocaleString();
                        const qty = getDisplayQuantity(trade);
                        const fee = estimateFee(trade);
                        const realized = trade.pnl;
                        const positive = realized >= 0;

                        return (
                          <TableRow key={trade.id} className="border-white/5 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{timestamp}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-[#050505]"
                                  style={{ backgroundColor: coinColor(trade.symbol) }}
                                >
                                  {trade.symbol.slice(0, 3)}
                                </div>
                                <div>
                                  <p className="font-semibold">{formatSymbol(trade.symbol)}</p>
                                  <p className="text-xs text-white/60">#{trade.orderId.slice(-6)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border-none px-3 py-1 text-xs font-semibold",
                                  trade.side === "LONG"
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-rose-500/15 text-rose-300"
                                )}
                              >
                                {trade.side === "LONG" ? "Buy" : "Sell"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(trade.avgPrice, { maximumFractionDigits: 4 })}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatQuantity(Math.abs(qty))} {trade.sizingMode === "LOTS" ? "lot" : "units"}
                            </TableCell>
                            <TableCell className="text-right text-white/80">{formatCurrency(fee)}</TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-semibold",
                                positive ? "text-long" : "text-short"
                              )}
                            >
                              {positive ? "+" : ""}
                              {formatCurrency(realized)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-wrap items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-white/60">
                <p>
                  Showing {paginatedTrades.length} of {badgeCount} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full border border-white/10 bg-white/5"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    if (totalPages > 6) {
                      const isEdge = pageNumber === 1 || pageNumber === totalPages;
                      const isCurrent = pageNumber === safePage;
                      const isNearCurrent = Math.abs(pageNumber - safePage) <= 1;
                      if (!isEdge && !isCurrent && !isNearCurrent) {
                        if (pageNumber === 2 && safePage > 3) {
                          return (
                            <span key="start-ellipsis" className="px-2 text-white/40">
                              ...
                            </span>
                          );
                        }
                        if (pageNumber === totalPages - 1 && safePage < totalPages - 2) {
                          return (
                            <span key="end-ellipsis" className="px-2 text-white/40">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    }

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={cn(
                          "h-9 w-9 rounded-full text-sm font-semibold transition",
                          safePage === pageNumber
                            ? "bg-primary text-black shadow-[0_10px_35px_rgba(255,198,0,0.35)]"
                            : "bg-white/5 text-white/70 hover:text-white"
                        )}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full border border-white/10 bg-white/5"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safePage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeHistory;
