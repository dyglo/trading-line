import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import type { TradeHistoryRow } from "@/supabase/types";
import type { Trade } from "@/store/tradingStore";

export interface TradeHistoryFilters {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  coin?: string;
  priceFilter?: string;
  quantityFilter?: string;
  side?: "all" | "buy" | "sell";
  page?: number;
  itemsPerPage?: number;
}

export interface TradeHistoryData {
  rows: Trade[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const convertTradeHistoryRowToTrade = (row: TradeHistoryRow): Trade => {
  return {
    id: row.trade_id,
    orderId: row.order_reference || row.trade_id,
    symbol: row.symbol,
    side: row.side,
    qty: parseFloat(row.qty),
    displayQty: row.display_qty ? parseFloat(row.display_qty) : undefined,
    sizingMode: row.sizing_mode,
    category: row.category || undefined,
    baseCurrency: row.base_currency || undefined,
    quoteCurrency: row.quote_currency || undefined,
    pipPrecision: row.pip_precision ? parseFloat(row.pip_precision) : undefined,
    contractSize: row.contract_size ? parseFloat(row.contract_size) : undefined,
    lotSize: row.lot_size ? parseFloat(row.lot_size) : undefined,
    avgPrice: parseFloat(row.avg_price),
    pnl: parseFloat(row.pnl),
    openedAt: new Date(row.opened_at).getTime(),
    closedAt: row.closed_at ? new Date(row.closed_at).getTime() : undefined,
    closeReason: row.close_reason || undefined,
    takeProfit: row.take_profit ? parseFloat(row.take_profit) : undefined,
    stopLoss: row.stop_loss ? parseFloat(row.stop_loss) : undefined
  };
};

const applyPriceFilter = (price: number, filter: string): boolean => {
  switch (filter) {
    case "lt1k":
      return price < 1_000;
    case "1to10k":
      return price >= 1_000 && price <= 10_000;
    case "10to50k":
      return price >= 10_000 && price <= 50_000;
    case "gt50k":
      return price > 50_000;
    default:
      return true;
  }
};

const applyQuantityFilter = (quantity: number, filter: string): boolean => {
  switch (filter) {
    case "lt1":
      return quantity < 1;
    case "1to10":
      return quantity >= 1 && quantity <= 10;
    case "10to100":
      return quantity >= 10 && quantity <= 100;
    case "gt100":
      return quantity > 100;
    default:
      return true;
  }
};

const getDisplayQuantity = (trade: TradeHistoryRow): number => {
  if (trade.sizing_mode === "LOTS") {
    return parseFloat(trade.lot_size || trade.display_qty || "0");
  }
  return parseFloat(trade.display_qty || trade.qty);
};

export const useTradeHistoryData = (filters: TradeHistoryFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: [
      "trade-history",
      filters.search,
      filters.dateFrom?.toISOString(),
      filters.dateTo?.toISOString(),
      filters.coin,
      filters.priceFilter,
      filters.quantityFilter,
      filters.side,
      filters.page,
      filters.itemsPerPage
    ],
    queryFn: async (): Promise<TradeHistoryData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Build base query
      let query = supabase
        .from("trade_history_view")
        .select("*", { count: "exact" })
        .eq("profile_id", user.id)
        .order("closed_at", { ascending: false });

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte("closed_at", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("closed_at", endDate.toISOString());
      }
      if (filters.coin && filters.coin !== "all") {
        query = query.eq("symbol", filters.coin);
      }

      // Side filter (buy = LONG, sell = SHORT)
      if (filters.side === "buy") {
        query = query.eq("side", "LONG");
      } else if (filters.side === "sell") {
        query = query.eq("side", "SHORT");
      }

      const { data: allRows, error, count } = await query;

      if (error) {
        throw error;
      }

      if (!allRows || allRows.length === 0) {
        return {
          rows: [],
          totalCount: 0,
          page: filters.page || 1,
          totalPages: 1
        };
      }

      // Apply client-side filters that can't be done in SQL
      let filtered = allRows;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.trim().toLowerCase();
        filtered = filtered.filter(
          (row) =>
            row.symbol.toLowerCase().includes(searchLower) ||
            row.trade_id.toLowerCase().includes(searchLower) ||
            (row.order_reference && row.order_reference.toLowerCase().includes(searchLower))
        );
      }

      // Price filter
      if (filters.priceFilter && filters.priceFilter !== "all") {
        filtered = filtered.filter((row) => applyPriceFilter(parseFloat(row.avg_price), filters.priceFilter!));
      }

      // Quantity filter
      if (filters.quantityFilter && filters.quantityFilter !== "all") {
        filtered = filtered.filter((row) => {
          const qty = getDisplayQuantity(row);
          return applyQuantityFilter(Math.abs(qty), filters.quantityFilter!);
        });
      }

      const totalCount = filtered.length;
      const itemsPerPage = filters.itemsPerPage || 10;
      const page = filters.page || 1;
      const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginated = filtered.slice(startIndex, endIndex);

      return {
        rows: paginated.map(convertTradeHistoryRowToTrade),
        totalCount,
        page,
        totalPages
      };
    },
    enabled: enabled,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });
};
