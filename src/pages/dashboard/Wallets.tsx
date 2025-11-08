import { useMemo, useState } from "react";
import { BookOpen, Link, MoreVertical, ShieldAlert, Wallet as WalletIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SegmentValue = "wallets" | "exchanges";

interface ConnectedEndpoint {
  id: string;
  name: string;
  subtitle: string;
  balance: number;
  currency: string;
  status: "synced" | "pending" | "offline";
  color: string;
}

interface ProviderCard {
  id: string;
  name: string;
  url: string;
  color: string;
}

const walletData: Record<
  SegmentValue,
  {
    label: string;
    badge: string;
    connected: ConnectedEndpoint[];
    available: ProviderCard[];
  }
> = {
  wallets: {
    label: "Wallet",
    badge: "12 Wallets",
    connected: [
      { id: "metamask", name: "MetaMask", subtitle: "A1s8ssf...ls22", balance: 120_849.84, currency: "USD", status: "synced", color: "#f97316" },
      { id: "phantom", name: "Phantom", subtitle: "A1s8ssf...ls22", balance: 47_591.21, currency: "USD", status: "synced", color: "#6366f1" },
      { id: "safepal", name: "Safepal", subtitle: "A1s8ssf...ls22", balance: 13_300.12, currency: "USD", status: "pending", color: "#22d3ee" },
      { id: "coinbase", name: "Coinbase", subtitle: "custody", balance: 1_300.12, currency: "USD", status: "synced", color: "#3b82f6" },
      { id: "bitget", name: "Bitget", subtitle: "custody", balance: 688.55, currency: "USD", status: "offline", color: "#22c55e" },
      { id: "okx", name: "OKX", subtitle: "custody", balance: 12_849.84, currency: "USD", status: "synced", color: "#0ea5e9" }
    ],
    available: [
      { id: "mathwallet", name: "MathWallet", url: "mathwallet.com", color: "#fb7185" },
      { id: "bitkeep", name: "BitKeep", url: "bitkeep.com", color: "#a855f7" },
      { id: "walletconnect", name: "WalletConnect", url: "walletconnect.com", color: "#3b82f6" },
      { id: "luno", name: "Luno", url: "luno.com", color: "#2563eb" },
      { id: "huobi", name: "Huobi", url: "htx.com", color: "#0ea5e9" },
      { id: "dydx", name: "dYdX", url: "dydx.exchange", color: "#c084fc" },
      { id: "binance", name: "Binance", url: "binance.com", color: "#facc15" },
      { id: "ethereum", name: "Ethereum", url: "ethereum.org", color: "#818cf8" }
    ]
  },
  exchanges: {
    label: "Exchanges",
    badge: "04 Exchanges",
    connected: [
      { id: "binance-ex", name: "Binance Pro", subtitle: "API-key ****9431", balance: 92_342.28, currency: "USD", status: "synced", color: "#facc15" },
      { id: "kraken", name: "Kraken", subtitle: "API-key ****1337", balance: 15_993.2, currency: "USD", status: "pending", color: "#22d3ee" },
      { id: "bitfinex", name: "Bitfinex", subtitle: "API-key ****5193", balance: 8_451.91, currency: "USD", status: "synced", color: "#f472b6" },
      { id: "bybit", name: "Bybit", subtitle: "API-key ****0087", balance: 23_010.0, currency: "USD", status: "offline", color: "#fb923c" }
    ],
    available: [
      { id: "coinbase-pro", name: "Coinbase Pro", url: "pro.coinbase.com", color: "#38bdf8" },
      { id: "okx-ex", name: "OKX Exchange", url: "okx.com", color: "#0ea5e9" },
      { id: "gemini", name: "Gemini", url: "gemini.com", color: "#f472b6" },
      { id: "bitstamp", name: "Bitstamp", url: "bitstamp.net", color: "#22c55e" },
      { id: "gate", name: "Gate.io", url: "gate.io", color: "#f97316" },
      { id: "kucoin", name: "KuCoin", url: "kucoin.com", color: "#22d3ee" }
    ]
  }
};

const statusBadge = {
  synced: { label: "Synced", className: "bg-emerald-500/15 text-emerald-300" },
  pending: { label: "Syncing", className: "bg-amber-500/15 text-amber-200" },
  offline: { label: "Offline", className: "bg-rose-500/15 text-rose-200" }
};

const Wallets = () => {
  const [segment, setSegment] = useState<SegmentValue>("wallets");
  const [connectionMap, setConnectionMap] = useState<Record<string, boolean>>({});

  const { label, badge, connected, available } = walletData[segment];

  const connectedState = useMemo(() => {
    const fallback: Record<string, boolean> = {};
    connected.forEach((item) => {
      fallback[item.id] = connectionMap[item.id] ?? true;
    });
    return fallback;
  }, [connected, connectionMap]);

  const toggleConnection = (id: string) => {
    setConnectionMap((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Wallet Summary</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-semibold">Secure Connections</span>
                <Badge variant="secondary" className="rounded-full bg-white/10 text-xs uppercase tracking-widest">
                  {badge}
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl border-white/20 bg-white/5 text-white/80">
              <WalletIcon className="mr-2 h-4 w-4" />
              New Connection
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {(Object.keys(walletData) as SegmentValue[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSegment(value)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition",
                  segment === value
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                )}
              >
                {walletData[value].label}
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full px-2 text-[11px]",
                    segment === value ? "bg-primary text-black" : "bg-white/10 text-white/60"
                  )}
                >
                  {walletData[value].badge.split(" ")[0]}
                </Badge>
              </button>
            ))}
          </div>

          <div className="space-y-6 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold">Connect {label}</p>
                <Badge variant="secondary" className="rounded-full bg-white/10 text-xs uppercase tracking-widest">
                  {badge}
                </Badge>
              </div>
              <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-4 text-xs uppercase tracking-[0.3em] text-white/70">
                Manage
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {connected.map((item) => {
                const state = statusBadge[item.status];
                const enabled = connectedState[item.id];
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_15px_45px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold"
                          style={{ backgroundColor: `${item.color}30`, color: item.color }}
                        >
                          {item.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-base font-semibold">{item.name}</p>
                          <p className="text-xs text-white/60">{item.subtitle}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Balance</p>
                        <p className="text-xl font-semibold">
                          {item.balance.toLocaleString("en-US", { style: "currency", currency: item.currency })}
                        </p>
                      </div>
                      <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px]", state.className)}>
                        {state.label}
                      </Badge>
                    </div>
                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/50">
                      <span>{enabled ? "Connected" : "Disabled"}</span>
                      <Switch checked={enabled} onCheckedChange={() => toggleConnection(item.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 rounded-[28px] border border-white/5 bg-black/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold">Available {segment === "wallets" ? "Wallets" : "Exchanges"}</p>
                <Badge variant="secondary" className="rounded-full bg-white/10 text-xs uppercase tracking-widest">
                  {available.length} Providers
                </Badge>
              </div>
              <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-4 text-xs uppercase tracking-[0.3em] text-white/70">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn how to connect
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {available.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-black"
                      style={{ backgroundColor: provider.color }}
                    >
                      {provider.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-xs text-white/60">{provider.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button className="rounded-full px-4 text-black">Connect</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-dashed border-white/15 bg-black/30 px-6 py-4 text-sm text-white/70">
              <ShieldAlert className="h-5 w-5 text-amber-300" />
              <p>
                Multi-factor approvals secure balance resets. Exchanges refresh every 90 seconds; manual resync is
                available from the overflow menu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallets;
