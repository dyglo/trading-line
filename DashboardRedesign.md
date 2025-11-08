# Dashboard Redesign Tracker

This document tracks the phased implementation of the new dashboard experience using the mockups stored in public/images.

---

## Phase 0 - Discovery & Alignment (Completed)
- [x] Review existing dashboard route structure (src/pages/Dashboard.tsx) and supporting components (AnalyticsChart, OrdersPanel, PortfolioDashboard, etc.).
  - Notes: Current layout is a two-column responsive grid without the required left sidebar or top command bar.
- [x] Inspect Supabase schema (supabase/schema.sql) and front-end stores (src/store/tradingStore.ts) to locate the $10,000 demo balance constant.
  - Notes: starting_balance and current_balance default to 10000; onboarding and trading store mirror the same constant.
- [x] Analyze the provided mockups (Dash.webp, Dashboard-Overview.webp, Statistic-Dashboard.webp, Subscription.webp, Trade-History.webp, scripting-strategy-builder.webp, wallets.webp) to define feature parity.
  - Notes: All screens share a unified shell (left icon rail + top nav) and use dark glassmorphism styling with neon green/red indicators.

## Phase 1 - Business Logic Foundation (Completed)
Goal: enforce the new $1,000 starter balance, detect stop-outs, and gate recharges behind paid subscriptions.

Steps:
- [x] Lower Supabase defaults to 1000 and propagate the constant through onboarding/profile stores.
- [x] Introduce `subscription_tier` and `account_status` fields plus Supabase policies to guard balance reset operations.
- [x] Detect stop-out thresholds in client state (equity <= maintenance margin) and surface a paywall modal.
- [x] Implement a balance recharge workflow that requires an active paid plan before invoking the reset RPC.
- [x] Update onboarding/help copy to explain the $1,000 community balance, stop-out rules, and upgrade path.

## Phase 2 - Dashboard Shell & Navigation (Completed)
Goal: replace the existing dashboard layout with the shared shell from the mockups.

Steps:
- [ ] Build a DashboardLayout component with the left icon rail (Dashboard, Analytics, Bots, Wallets, Settings) and the top nav (search, quick controls, notifications, user menu).
- [x] Implement the gradient background plus raised card wrappers that mimic the mockup lighting.
- [ ] Convert /dashboard into nested routes/tabs (Overview, Performance Analytics, Trade History, Strategy Builder, Wallets, Subscription) handled through React Router.
- [x] Ensure the layout remains usable down to 1280px by collapsing the rail and stacking cards where necessary.

## Phase 3 - Overview Screen (Completed)
Goal: recreate Dashboard-Overview.webp.

Steps:
- [x] Build KPI cards (Profit/Loss, Volume, Order Fill Rate) with sparkline charts and delta badges.
- [x] Implement the strategy event timeline feed with bot badges and timestamps.
- [x] Rebuild the strategy performance table with status chips and action buttons (Open, Closed, Pending, Sell Limit, etc.).
- [x] Wire the cards, feed, and table to mock data hooks first, then Supabase queries.

## Phase 4 - Statistics Dashboard (Pending)
Goal: recreate Statistic-Dashboard.webp.

Steps:
- [ ] Add toolbar filters (strategy selector, timeframe, venue, pair) with the segmented control for Statistics/Trade History/Custom Reports.
- [ ] Implement the dual-axis performance chart (PnL vs. drawdown) with custom tooltips using Recharts.
- [ ] Build the stats summary grid, donut chart (Profit Factor), and metrics panel just below the chart.
- [ ] Connect everything to the analytics dataset (Supabase views or placeholder JSON) with React Query caching.

## Phase 5 - Trade History (Pending)
Goal: recreate Trade-History.webp.

Steps:
- [ ] Reuse the performance toolbar component from Phase 4 and add the search/filter row (Date, Coin, Price, Quantity inputs).
- [ ] Build a paginated trades table with coin avatars, side badges, fees, realized profit, and sticky headers.
- [ ] Add tabbed filters (All Trades, Buy Side, Sell Side) with badge counts.
- [ ] Integrate with Supabase `trades` data (or mock data) and implement pagination/infinite scroll.

## Phase 6 - Strategy Builder (Pending)
Goal: recreate scripting-strategy-builder.webp.

Steps:
- [ ] Add a toggle between GUI Strategy Builder and Scripting Strategy Builder with persistent user preference.
- [ ] Build the scripting workspace (AI assist card, strategy selector, Save/Load buttons, AutoSave toggle) and embed a Monaco/Prism editor.
- [ ] Include the AI prompt input bar and placeholder assistant responses to match the mockup.
- [ ] Persist scripts to Supabase (strategies table) or local storage as an interim solution.

## Phase 7 - Wallets (Pending)
Goal: recreate wallets.webp.

Steps:
- [ ] Implement the Wallet/Exchange segmented control with badge counts.
- [ ] Build the "Connect Wallet" card grid with toggles, status pills, and overflow menus.
- [ ] Build the "Available Wallets" grid with Connect buttons and the "Learn How to Connect" helper CTA.
- [ ] Hook the UI into the user's linked wallets dataset (Supabase) with optimistic updates.

## Phase 8 - Subscription Center & Recharge Workflow (Pending)
Goal: recreate Subscription.webp and define compelling paid benefits for balance recharges.

Steps:
- [ ] Model the plan data (Community, Pro, Ultimate) including pricing, balance caps, and perks.
- [ ] Surface upgrade CTAs when users hit stop-out or attempt restricted features (AI builder, analytics exports, etc.).
- [ ] Implement the subscription cards with feature checklists, "Current Plan" labeling, and Stripe integration placeholders.
- [ ] Recommended perks:
  - Community (Free): $1,000 max balance, 1 active strategy, delayed market data, limited analytics, community forum access.
  - Pro: Recharge access up to $25,000 balance, unlimited resets, AI strategy assistant, advanced analytics dashboards, Discord signals, fee rebates, priority support.
  - Ultimate: Unlimited balance, multi-account management, exclusive strategy marketplace, custom risk coaching, early feature access, dedicated success manager.

## Phase 9 - QA, Documentation & Release (Pending)
Steps:
- [ ] Update onboarding copy, FAQs, and README with the new balance/subscription policies.
- [ ] Add automated UI smoke tests (Playwright/Cypress) that cover navigation, paywall flows, and table interactions.
- [ ] Perform cross-browser and responsive QA (Chrome, Edge, Safari + 1280px breakpoint).
- [ ] Prepare release notes and a migration checklist for existing users.
