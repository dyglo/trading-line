import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import type { AnalyticsSnapshotRow } from "@/supabase/types";

export interface AnalyticsFilters {
  strategy?: string;
  timeframe?: string;
  venue?: string;
  market?: string;
}

export interface AnalyticsData {
  chart: Array<{
    label: string;
    pnl: number;
    drawdown: number;
  }>;
  realizedPnl: number;
  openPnl: number;
  netPnl: number;
  netPnlPercent: number;
  openPnlPercent: number;
  maxDrawdownValue: number;
  maxDrawdownPercent: number;
  closedTrades: number;
  openTrades: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  longTrades: number;
  shortTrades: number;
  winRate: number;
  profitFactor: number;
  avgTrade: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  largestWin: number;
  largestLoss: number;
  sortinoRatio: number;
  sharpeRatio: number;
  commissionPaid: number;
  runDuration: number;
  volume24h: number;
}

const INITIAL_BALANCE = 1000;
const DAY_MS = 86_400_000;

const timeframeWindows: Record<string, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365
};

const timeframeBuckets: Record<string, number> = {
  "1W": 7,
  "1M": 8,
  "3M": 12,
  "6M": 12,
  "1Y": 12
};

const formatChartLabel = (timestamp: number, timeframe: string) => {
  const date = new Date(timestamp);
  if (timeframe === "1W") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (timeframe === "1M") {
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short" });
};

const buildChartData = (
  snapshots: AnalyticsSnapshotRow[],
  timeframe: string,
  startingBalance: number = INITIAL_BALANCE
): AnalyticsData["chart"] => {
  const now = Date.now();
  const lookbackDays = timeframeWindows[timeframe] ?? 365;
  const startWindow = now - lookbackDays * DAY_MS;
  const bucketCount = timeframeBuckets[timeframe] ?? 12;
  const bucketDuration = Math.max(1, (now - startWindow) / bucketCount);

  // Group snapshots by bucket
  const buckets: Array<{ pnl: number; date: number }> = Array(bucketCount).fill(null).map((_, i) => ({
    pnl: 0,
    date: startWindow + bucketDuration * i
  }));

  snapshots.forEach((snapshot) => {
    const snapshotDate = new Date(snapshot.snapshot_date).getTime();
    const rawIndex = Math.floor((snapshotDate - startWindow) / bucketDuration);
    const bucketIndex = Math.min(bucketCount - 1, Math.max(0, rawIndex));
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].pnl += parseFloat(snapshot.realized_pnl || "0");
    }
  });

  let cumulative = 0;
  let peakEquity = startingBalance;
  let lowestEquity = startingBalance;
  const chart: AnalyticsData["chart"] = [];

  for (let i = 0; i < bucketCount; i += 1) {
    cumulative += buckets[i].pnl;
    const equity = startingBalance + cumulative;
    peakEquity = Math.max(peakEquity, equity);
    lowestEquity = Math.min(lowestEquity, equity);
    const pnlPercent = ((equity - startingBalance) / startingBalance) * 100;
    const drawdownPercent = peakEquity > 0 ? ((equity - peakEquity) / peakEquity) * 100 : 0;
    chart.push({
      label: formatChartLabel(buckets[i].date, timeframe),
      pnl: Number(pnlPercent.toFixed(2)),
      drawdown: Number(drawdownPercent.toFixed(2))
    });
  }

  return chart;
};

const calculateRatios = (snapshots: AnalyticsSnapshotRow[]): { sortino: number; sharpe: number } => {
  if (snapshots.length === 0) {
    return { sortino: 0, sharpe: 0 };
  }

  const returns = snapshots
    .map((s) => {
      const notional = Math.max(1, parseFloat(s.volume || "0") * parseFloat(s.avg_trade || "0"));
      return notional > 0 ? parseFloat(s.realized_pnl || "0") / notional : 0;
    })
    .filter((r) => !isNaN(r));

  if (returns.length === 0) {
    return { sortino: 0, sharpe: 0 };
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.length > 1
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
      : 0.0001;
  const stdDev = Math.sqrt(Math.max(variance, 0.0001));

  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length
      : 0.0001;
  const downsideStdDev = Math.sqrt(downsideVariance);

  return {
    sharpe: avgReturn / stdDev,
    sortino: avgReturn / downsideStdDev
  };
};

export const useAnalyticsData = (filters: AnalyticsFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["analytics", filters.strategy, filters.timeframe, filters.venue, filters.market],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get user's starting balance from preferences
      const { data: preferences } = await supabase
        .from("preferences")
        .select("starting_balance")
        .eq("profile_id", user.id)
        .single();

      const startingBalance = preferences ? parseFloat(preferences.starting_balance || "1000") : INITIAL_BALANCE;

      // Build query for analytics_snapshots
      let query = supabase
        .from("analytics_snapshots")
        .select("*")
        .eq("profile_id", user.id)
        .order("snapshot_date", { ascending: true });

      if (filters.strategy) {
        query = query.eq("strategy", filters.strategy);
      }
      if (filters.venue) {
        query = query.eq("venue", filters.venue);
      }
      if (filters.market) {
        query = query.eq("market", filters.market);
      }

      // Apply timeframe filter
      if (filters.timeframe) {
        const lookbackDays = timeframeWindows[filters.timeframe] ?? 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - lookbackDays);
        query = query.gte("snapshot_date", startDate.toISOString());
      }

      const { data: snapshots, error } = await query;

      if (error) {
        throw error;
      }

      if (!snapshots || snapshots.length === 0) {
        // Return empty analytics data
        return {
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
      }

      // Aggregate data from snapshots
      const totalTrades = snapshots.reduce((sum, s) => sum + (s.total_trades || 0), 0);
      const winningTrades = snapshots.reduce((sum, s) => sum + (s.winning_trades || 0), 0);
      const losingTrades = snapshots.reduce((sum, s) => sum + (s.losing_trades || 0), 0);
      const longTrades = snapshots.reduce((sum, s) => sum + (s.long_trades || 0), 0);
      const shortTrades = snapshots.reduce((sum, s) => sum + (s.short_trades || 0), 0);
      const realizedPnl = snapshots.reduce((sum, s) => sum + parseFloat(s.realized_pnl || "0"), 0);
      const openPnl = snapshots.reduce((sum, s) => sum + parseFloat(s.open_pnl || "0"), 0);
      const netPnl = realizedPnl + openPnl;
      const commissionPaid = snapshots.reduce((sum, s) => sum + parseFloat(s.commission_paid || "0"), 0);
      const volume24h = snapshots.reduce((sum, s) => sum + parseFloat(s.volume || "0"), 0);

      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const avgWin = winningTrades > 0
        ? snapshots
            .filter((s) => s.avg_winning_trade)
            .reduce((sum, s) => sum + parseFloat(s.avg_winning_trade || "0"), 0) / winningTrades
        : 0;
      const avgLoss = losingTrades > 0
        ? snapshots
            .filter((s) => s.avg_losing_trade)
            .reduce((sum, s) => sum + parseFloat(s.avg_losing_trade || "0"), 0) / losingTrades
        : 0;
      const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? 3 : 1;

      const largestWin = Math.max(...snapshots.map((s) => parseFloat(s.largest_win || "0")), 0);
      const largestLoss = Math.min(...snapshots.map((s) => parseFloat(s.largest_loss || "0")), 0);

      const avgTrade = totalTrades > 0 ? realizedPnl / totalTrades : 0;

      // Calculate drawdown
      const chart = buildChartData(snapshots, filters.timeframe || "1Y", startingBalance);
      let peakEquity = startingBalance;
      let lowestEquity = startingBalance;
      chart.forEach((point) => {
        const equity = startingBalance * (1 + point.pnl / 100);
        peakEquity = Math.max(peakEquity, equity);
        lowestEquity = Math.min(lowestEquity, equity);
      });
      const maxDrawdownValue = peakEquity - lowestEquity;
      const maxDrawdownPercent = peakEquity > 0 ? (maxDrawdownValue / peakEquity) * 100 : 0;

      const { sortino, sharpe } = calculateRatios(snapshots);

      // Calculate run duration (time between first and last trade)
      const firstSnapshot = snapshots[0];
      const lastSnapshot = snapshots[snapshots.length - 1];
      const runDuration =
        firstSnapshot && lastSnapshot
          ? new Date(lastSnapshot.snapshot_date).getTime() - new Date(firstSnapshot.snapshot_date).getTime()
          : 0;

      const openTrades = snapshots.reduce((sum, s) => sum + (s.open_trade_count || 0), 0);

      return {
        chart,
        realizedPnl,
        openPnl,
        netPnl,
        netPnlPercent: ((netPnl / startingBalance) * 100),
        openPnlPercent: ((openPnl / startingBalance) * 100),
        maxDrawdownValue,
        maxDrawdownPercent,
        closedTrades: totalTrades,
        openTrades,
        totalTrades: totalTrades + openTrades,
        winningTrades,
        losingTrades,
        longTrades,
        shortTrades,
        winRate,
        profitFactor,
        avgTrade,
        avgWinningTrade: avgWin,
        avgLosingTrade: avgLoss,
        largestWin,
        largestLoss,
        sortinoRatio: sortino,
        sharpeRatio: sharpe,
        commissionPaid,
        runDuration,
        volume24h
      };
    },
    enabled: enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
