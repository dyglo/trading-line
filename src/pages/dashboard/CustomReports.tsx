import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileBarChart, PieChart, Plus, RefreshCw, Share2 } from "lucide-react";

import {
  AnalyticsToolbar,
  type AnalyticsSegmentValue,
  type FilterOption,
  type SegmentOption
} from "@/components/dashboard/AnalyticsToolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const metricCards = [
  { label: "Saved Reports", value: "24", helper: "+4 this week" },
  { label: "Last Export", value: "Today, 09:12", helper: "PnL + Drawdown Report" },
  { label: "Most Used Format", value: "PDF", helper: "73% of exports" },
  { label: "Scheduled Runs", value: "3 Active", helper: "Next run in 2h" }
];

const templateCards = [
  {
    id: "pnl",
    title: "Performance & Drawdown",
    description: "Dual-axis equity curve with drawdown heatmap.",
    tags: ["PnL", "Drawdown", "Sharpe"],
    icon: PieChart
  },
  {
    id: "execution",
    title: "Execution Quality",
    description: "Fill rate, slippage bands, and venue routing.",
    tags: ["Fill Rate", "Slippage", "Venues"],
    icon: FileBarChart
  },
  {
    id: "allocation",
    title: "Capital Allocation",
    description: "Exposure per strategy, asset class, and venue.",
    tags: ["Allocation", "Risk", "Exposure"],
    icon: Share2
  }
];

const savedReports = [
  {
    id: "CR-204",
    name: "ETH Scalper Weekly",
    strategy: "MoonScalper",
    format: "PDF",
    lastRun: "Today 08:40",
    status: "Ready"
  },
  {
    id: "CR-167",
    name: "Multi-Venue Latency Audit",
    strategy: "Night Owl",
    format: "CSV",
    lastRun: "Yesterday 22:14",
    status: "Queued"
  },
  {
    id: "CR-149",
    name: "Risk & Exposure Snapshot",
    strategy: "Fusion Grid",
    format: "Notebook",
    lastRun: "Mon 11:25",
    status: "Ready"
  }
];

const CustomReports = () => {
  const navigate = useNavigate();
  const [segment, setSegment] = useState<AnalyticsSegmentValue>("custom-reports");
  const [strategy, setStrategy] = useState("moon_scalper");
  const [timeframe, setTimeframe] = useState("1M");
  const [venue, setVenue] = useState("binance");
  const [market, setMarket] = useState("ETHUSD");

  const strategyOptions: FilterOption[] = useMemo(
    () => [
      { value: "moon_scalper", label: "MoonScalper", description: "High-frequency ETH scalper" },
      { value: "night_owl", label: "Night Owl", description: "Asia session breakout" },
      { value: "fusion_grid", label: "Fusion Grid", description: "Mean-reversion grid" }
    ],
    []
  );

  const timeframeOptions: FilterOption[] = useMemo(
    () => [
      { value: "1W", label: "1 Week" },
      { value: "1M", label: "1 Month" },
      { value: "3M", label: "Quarter" },
      { value: "1Y", label: "1 Year" }
    ],
    []
  );

  const venueOptions: FilterOption[] = useMemo(
    () => [
      { value: "binance", label: "Binance" },
      { value: "dydx", label: "dYdX" },
      { value: "coinbase", label: "Coinbase" }
    ],
    []
  );

  const marketOptions: FilterOption[] = useMemo(
    () => [
      { value: "ETHUSD", label: "ETH / USDT" },
      { value: "BTCUSD", label: "BTC / USDT" },
      { value: "SOLUSD", label: "SOL / USDT" }
    ],
    []
  );

  const segments: SegmentOption[] = [
    { value: "statistics", label: "Statistics Dashboard" },
    { value: "trade-history", label: "Trade History" },
    { value: "custom-reports", label: "Custom Reports", badge: "New" }
  ];

  const handleSegmentChange = (next: AnalyticsSegmentValue) => {
    if (next === "statistics") {
      navigate("/dashboard/analytics");
      return;
    }
    if (next === "trade-history") {
      navigate("/dashboard/trade-history");
      return;
    }
    setSegment("custom-reports");
  };

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <AnalyticsToolbar
            segments={segments}
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
            rightSlot={
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white/80">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Data
                </Button>
                <Button className="rounded-full px-5 text-black">
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
              </div>
            }
          />

          <div className="space-y-5 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Report Builder</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{strategyOptions.find((opt) => opt.value === strategy)?.label ?? "Strategy"} Custom Report</h2>
                <p className="text-sm text-white/60">
                  Combine analytics snapshots, trade history, and risk metrics into a single export.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white/80">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button className="rounded-full px-6 text-black shadow-[0_10px_35px_rgba(255,198,0,0.35)]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/5 bg-black/30 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">{metric.label}</p>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                  <p className="text-xs text-white/60">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Templates</p>
                <p className="text-lg font-semibold text-white">Start from a curated layout</p>
              </div>
              <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-5 text-xs uppercase tracking-[0.3em] text-white/70">
                Browse Library
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {templateCards.map((template) => {
                const Icon = template.icon;
                return (
                  <div key={template.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{template.title}</p>
                        <p className="text-xs text-white/60">{template.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-black/30 text-xs text-white/70">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="mt-4 w-full rounded-2xl text-black">Use Template</Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Saved Reports</p>
                <p className="text-lg font-semibold text-white">Ready for export</p>
              </div>
              <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-5 text-xs uppercase tracking-[0.3em] text-white/70">
                Manage Schedules
              </Button>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/60">
              <table className="min-w-full text-sm">
                <thead className="bg-black/70 text-left text-xs uppercase tracking-[0.3em] text-white/50">
                  <tr>
                    <th className="px-5 py-3">Report</th>
                    <th className="px-5 py-3">Strategy</th>
                    <th className="px-5 py-3">Format</th>
                    <th className="px-5 py-3">Last Run</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {savedReports.map((report) => (
                    <tr key={report.id} className="border-t border-white/5">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{report.name}</p>
                        <p className="text-xs text-white/60">#{report.id}</p>
                      </td>
                      <td className="px-5 py-4 text-white/80">{report.strategy}</td>
                      <td className="px-5 py-4 text-white/80">{report.format}</td>
                      <td className="px-5 py-4 text-white/60">{report.lastRun}</td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            report.status === "Ready"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-200"
                          )}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReports;
