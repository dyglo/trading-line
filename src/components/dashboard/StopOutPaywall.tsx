import { ShieldAlert, Zap } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
    typeof value === "string" ? Number(value) : value
  );

export const StopOutPaywall = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const preference = user?.preference;
  const isLocked = preference?.accountStatus === "STOPPED_OUT";

  const message = useMemo(() => {
    if (!preference) return "";
    const threshold = formatCurrency(preference.stopOutThreshold);
    return `Your Community balance fell below ${threshold}. Unlock a Pro or Ultimate subscription to instantly recharge and keep building your track record.`;
  }, [preference]);

  if (!preference || !isLocked) {
    return null;
  }

  return (
    <Dialog open>
      <DialogContent className="bg-gradient-to-b from-[#0b0b0f] to-[#050506] border border-emerald-500/30 text-white shadow-emerald-500/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
            Balance Protection Triggered
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Current Plan</span>
            <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
              {preference.subscriptionTier}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Available Balance</span>
            <span className="font-semibold text-white">{formatCurrency(preference.currentBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Recharge Limit</span>
            <span className="font-semibold text-white">{formatCurrency(preference.startingBalance)}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            className="h-11 bg-emerald-500 text-black hover:bg-emerald-400"
            onClick={() => navigate("/dashboard/subscription")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade & Recharge
          </Button>
          <Button
            variant="outline"
            className="h-11 border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate("/dashboard/trade-history")}
          >
            Review Trades
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
