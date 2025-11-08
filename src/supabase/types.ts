export type OnboardingQuestionType = "SINGLE_SELECT" | "MULTI_SELECT" | "FREE_TEXT";
export type SubscriptionTier = "COMMUNITY" | "PRO" | "ULTIMATE";
export type AccountStatus = "ACTIVE" | "STOPPED_OUT";

export interface ProfileRow {
  id: string;
  username: string;
  email: string;
  onboarding_complete: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreferenceRow {
  id: string;
  profile_id: string;
  starting_balance: string;
  current_balance: string;
  base_currency: string;
  auto_reset_on_stop_out: boolean;
  notifications_enabled: boolean;
  subscription_tier: SubscriptionTier;
  account_status: AccountStatus;
  stop_out_threshold: string;
  last_stop_out_at: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingQuestionRow {
  id: string;
  prompt: string;
  description: string | null;
  type: OnboardingQuestionType;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingOptionRow {
  id: string;
  question_id: string;
  label: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponseRow {
  id: string;
  profile_id: string;
  question_id: string;
  option_id: string | null;
  free_text: string | null;
  created_at: string;
  updated_at: string;
}

export type StrategyMode = "GUI" | "SCRIPTING";

export interface StrategyRow {
  id: string;
  profile_id: string;
  name: string;
  mode: StrategyMode;
  code: string;
  autosave_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategyMessageRow {
  id: string;
  strategy_id: string;
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

// Orders and Trades types
export type Side = "LONG" | "SHORT";
export type OrderType = "MARKET" | "LIMIT" | "STOP";
export type OrderStatus = "OPEN" | "FILLED" | "CANCELLED";
export type SizingMode = "UNITS" | "LOTS";
export type CloseReason = "MANUAL" | "TAKE_PROFIT" | "STOP_LOSS";

export interface OrderRow {
  id: string;
  profile_id: string;
  order_id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: string;
  display_qty: string | null;
  sizing_mode: SizingMode;
  category: string | null;
  base_currency: string | null;
  quote_currency: string | null;
  pip_precision: string | null;
  contract_size: string | null;
  limit_price: string | null;
  stop_price: string | null;
  take_profit: string | null;
  stop_loss: string | null;
  status: OrderStatus;
  strategy: string | null;
  venue: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeRow {
  id: string;
  profile_id: string;
  order_id: string | null;
  trade_id: string;
  symbol: string;
  side: Side;
  qty: string;
  display_qty: string | null;
  sizing_mode: SizingMode;
  category: string | null;
  base_currency: string | null;
  quote_currency: string | null;
  pip_precision: string | null;
  contract_size: string | null;
  lot_size: string | null;
  avg_price: string;
  pnl: string;
  opened_at: string;
  closed_at: string | null;
  close_reason: CloseReason | null;
  take_profit: string | null;
  stop_loss: string | null;
  strategy: string | null;
  venue: string | null;
  created_at: string;
  updated_at: string;
}

// View types
export interface TradeHistoryRow {
  id: string;
  profile_id: string;
  trade_id: string;
  symbol: string;
  side: Side;
  qty: string;
  display_qty: string | null;
  sizing_mode: SizingMode;
  category: string | null;
  base_currency: string | null;
  quote_currency: string | null;
  pip_precision: string | null;
  contract_size: string | null;
  lot_size: string | null;
  avg_price: string;
  pnl: string;
  opened_at: string;
  closed_at: string;
  close_reason: CloseReason | null;
  take_profit: string | null;
  stop_loss: string | null;
  strategy: string | null;
  venue: string | null;
  created_at: string;
  updated_at: string;
  order_reference: string | null;
  notional_value: string;
  estimated_fee: string;
}

export interface AnalyticsSnapshotRow {
  profile_id: string;
  strategy: string | null;
  venue: string | null;
  market: string | null;
  snapshot_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  long_trades: number;
  short_trades: number;
  realized_pnl: string;
  open_pnl: string;
  net_pnl: string;
  avg_trade: string | null;
  avg_winning_trade: string | null;
  avg_losing_trade: string | null;
  largest_win: string | null;
  largest_loss: string | null;
  win_rate: string;
  profit_factor: string;
  volume: string;
  commission_paid: string;
  open_trade_count: number;
}
