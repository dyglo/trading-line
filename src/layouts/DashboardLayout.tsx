import {
  Bell,
  Bot,
  Crown,
  History,
  LayoutDashboard,
  LineChart,
  Menu,
  Search,
  Settings,
  Wallet,
  Wallet2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { StopOutPaywall } from "@/components/dashboard/StopOutPaywall";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useStopOutMonitor } from "@/hooks/useStopOutMonitor";
import { useTradingStore } from "@/store/tradingStore";
import { TickerTape } from "@/components/TickerTape";

const sidebarNav = [
  { label: "Overview", path: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Analytics", path: "/dashboard/analytics", icon: LineChart },
  { label: "Trade History", path: "/dashboard/trade-history", icon: History },
  { label: "Strategy Builder", path: "/dashboard/strategy-builder", icon: Bot },
  { label: "Wallets", path: "/dashboard/wallets", icon: Wallet },
  { label: "Subscription", path: "/dashboard/subscription", icon: Crown }
];

const topTabs = [
  { label: "Dashboard", path: "/dashboard/overview" },
  { label: "Assets", path: "/dashboard/analytics" },
  { label: "Markets", path: "/dashboard/trade-history" },
  { label: "Education", path: "/dashboard/strategy-builder" },
  { label: "Support", path: "/dashboard/subscription" }
];

export const DashboardLayout = () => {
  const { user, updatePreferences } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const accountBalance = useTradingStore((state) => state.account.balance);
  const [lastSyncedBalance, setLastSyncedBalance] = useState<number | null>(null);

  useStopOutMonitor();

  useEffect(() => {
    if (!user?.preference) {
      return;
    }

    const balance = Number(user.preference.currentBalance);
    if (!Number.isFinite(balance)) {
      return;
    }

    useTradingStore.setState((state) => {
      if (Math.abs(state.account.balance - balance) < 0.5) {
        return {};
      }

      return {
        account: {
          ...state.account,
          balance,
          equity: balance
        }
      };
    });
  }, [user?.preference?.currentBalance]);

  useEffect(() => {
    if (!user?.preference) {
      return;
    }

    if (!Number.isFinite(accountBalance)) {
      return;
    }

    if (lastSyncedBalance !== null && Math.abs(accountBalance - lastSyncedBalance) < 0.5) {
      return;
    }

    const preferenceBalance = Number(user.preference.currentBalance);
    if (Math.abs(preferenceBalance - accountBalance) < 0.5) {
      return;
    }

    const timeout = setTimeout(() => {
      updatePreferences({ currentBalance: accountBalance })
        .then(() => setLastSyncedBalance(accountBalance))
        .catch(() => {
          /* silent */
        });
    }, 800);

    return () => clearTimeout(timeout);
  }, [accountBalance, updatePreferences, user?.preference, lastSyncedBalance]);

  const initials = useMemo(() => {
    if (!user?.username) {
      return "TN";
    }

    return user.username
      .split(" ")
      .map((chunk) => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.username]);

  const activeTopTab = useMemo(() => {
    return topTabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? "/dashboard/overview";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#020303] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.4),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-24 flex-col border-r border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex h-20 items-center justify-center text-xl font-semibold tracking-wide">
            <Wallet2 className="h-7 w-7 text-emerald-400" />
          </div>
          <nav className="flex-1 space-y-2 px-2">
            {sidebarNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl py-4 text-[11px] font-semibold uppercase tracking-wide transition-all gap-1",
                    isActive ? "bg-amber-400/10 text-white shadow shadow-amber-400/30" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-amber-300" : "text-zinc-500")} />
                  <span className="text-center leading-tight">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col bg-[#020202]">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4 px-4 py-4 lg:px-8">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground"
                onClick={() => setMobileNavOpen((prev) => !prev)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {topTabs.map((tab) => {
                    const isActive = activeTopTab === tab.path;
                    return (
                      <Button
                        key={tab.path}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-9 rounded-full px-4 text-xs font-medium uppercase tracking-wide",
                          isActive
                            ? "bg-white text-black"
                            : "bg-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => navigate(tab.path)}
                      >
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-10 rounded-full border-white/10 bg-white/5 pl-9 text-sm placeholder:text-muted-foreground/60"
                    placeholder="Search markets, assets..."
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                  <Bell className="h-4 w-4" />
                </Button>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-3 py-1 hover:border-amber-300 transition"
                >
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Profile</p>
                    <p className="text-sm font-semibold text-white">{user?.username ?? "Trader"}</p>
                  </div>
                  <Avatar className="h-10 w-10 border border-amber-200/40">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email ?? "anon"}`} alt={user?.username ?? "User"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>

              <div className="w-full md:hidden">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-10 rounded-full border-white/10 bg-white/5 pl-9 text-sm placeholder:text-muted-foreground/60"
                    placeholder="Search anything..."
                  />
                </div>
              </div>
            </div>

            {mobileNavOpen && (
              <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
                <div className="flex flex-col gap-2">
                  {sidebarNav.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          navigate(item.path);
                          setMobileNavOpen(false);
                        }}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
            <StopOutPaywall />
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

          <footer className="hidden border-t border-white/5 bg-black/30 lg:block">
            <TickerTape />
          </footer>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/90 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-around px-4 py-2">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                className="flex flex-col items-center gap-1 text-xs"
                onClick={() => navigate(item.path)}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-amber-300" : "text-muted-foreground"
                  )}
                />
                <span className={cn("text-[11px]", isActive ? "text-white" : "text-muted-foreground")}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
