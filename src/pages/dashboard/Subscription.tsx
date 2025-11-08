import { useState } from "react";
import { BadgeCheck, Crown, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  suffix: string;
  features: string[];
  highlight?: string;
  isCurrent?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Best for personal use.",
    price: 98,
    suffix: "per month",
    features: [
      "Automate one strategy on one pair at a time.",
      "Support dYdX exchange.",
      "Basic trade history.",
      "Access to the Algo.",
      "Maximum account balance: $25,000."
    ],
    isCurrent: true
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    description: "Best for business owners.",
    price: 160,
    suffix: "per month",
    features: [
      "Automate unlimited strategies simultaneously.",
      "Supports dYdX, Uniswap, Coinbase, Binance, Bybit and more!",
      "In-depth live strategy performance reports and statistics.",
      "DexBot PRO Ultimate Discord channels + Bonus Strategies.",
      "Turn simple text to code with A.I coding assistance!",
      "Maximum account value: Unlimited."
    ],
    highlight: "Most Popular"
  }
];

const navTabs = ["Your Account", "Security", "Platform", "Subscription"];

const Subscription = () => {
  const [activeTab, setActiveTab] = useState("Subscription");

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">General Settings</p>
              <h1 className="mt-2 text-2xl font-semibold">Subscription</h1>
              <p className="text-sm text-white/60">Unlock your edge with DexBot Pro.</p>
            </div>
            <Button variant="outline" className="rounded-full border-white/30 bg-white/5 text-white/80">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Billing Portal
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {navTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-semibold transition",
                  activeTab === tab
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-[28px] border border-white/10 bg-black/35 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                  plan.id === "ultimate" && "border-primary/30 bg-gradient-to-b from-white/10 to-black/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold">{plan.name}</h2>
                      {plan.highlight ? (
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-xs uppercase tracking-widest">
                          {plan.highlight}
                        </Badge>
                      ) : null}
                      {plan.isCurrent ? (
                        <Badge className="rounded-full bg-white/10 text-xs uppercase tracking-widest text-white">
                          Current Plan
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-white/70">{plan.description}</p>
                  </div>
                  <Crown className="h-6 w-6 text-primary" />
                </div>

                <div className="mt-6">
                  <p className="text-4xl font-semibold tracking-tight">
                    ${plan.price.toFixed(2)}
                    <span className="ml-2 text-base font-normal text-white/70">/{plan.suffix}</span>
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {plan.isCurrent ? (
                    <Button variant="secondary" className="rounded-full px-8 text-sm font-semibold text-white" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button className="rounded-full px-8 text-black shadow-[0_10px_35px_rgba(255,198,0,0.35)]">
                      Get Started
                    </Button>
                  )}
                  <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-5 text-white/70">
                    Compare Features
                  </Button>
                </div>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-white/80">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
