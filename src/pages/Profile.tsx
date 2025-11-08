import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Coins,
  Globe2,
  RotateCcw,
  Save,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCircle2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { ApiOnboardingResponse } from "@/types/api";

const profileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().email("Enter a valid email address.")
});

const preferencesSchema = z.object({
  startingBalance: z
    .number({ invalid_type_error: "Starting balance must be a number." })
    .positive("Balance must be positive.")
    .max(1_000_000, "Maximum supported balance is $1,000,000."),
  currentBalance: z
    .number({ invalid_type_error: "Current balance must be a number." })
    .positive("Balance must be positive.")
    .max(1_000_000, "Maximum supported balance is $1,000,000."),
  baseCurrency: z.string().trim().length(3, "Use a 3-letter code (e.g. USD).").transform((value) => value.toUpperCase()),
  autoResetOnStopOut: z.boolean(),
  notificationsEnabled: z.boolean()
});

const onboardingPrompts = {
  experience: "How many years have you been trading?",
  markets: "Which markets do you focus on?",
  style: "What best describes your trading style?",
  goal: "What is your primary goal on T-Line?"
};

const derivePersona = (responses?: ApiOnboardingResponse[]) => {
  if (!responses || responses.length === 0) {
    return {
      style: undefined,
      experience: undefined,
      goal: undefined,
      markets: [] as string[]
    };
  }

  const getFirstOption = (prompt: string) =>
    responses.find((response) => response.question?.prompt === prompt)?.option?.label ??
    responses.find((response) => response.question?.prompt === prompt)?.freeText ??
    undefined;

  const getManyOptions = (prompt: string) =>
    responses
      .filter((response) => response.question?.prompt === prompt)
      .map((response) => response.option?.label)
      .filter((value): value is string => Boolean(value));

  return {
    style: getFirstOption(onboardingPrompts.style),
    experience: getFirstOption(onboardingPrompts.experience),
    goal: getFirstOption(onboardingPrompts.goal),
    markets: getManyOptions(onboardingPrompts.markets)
  };
};

const Profile = () => {
  const { user, updateProfile, updatePreferences, resetBalance } = useAuth();
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [preferencesSubmitting, setPreferencesSubmitting] = useState(false);

  const defaultPreference = useMemo(() => {
    const preference = user?.preference;
    return {
      startingBalance: preference ? Number(preference.startingBalance) : 1_000,
      currentBalance: preference ? Number(preference.currentBalance) : 1_000,
      baseCurrency: preference?.baseCurrency ?? "USD",
      autoResetOnStopOut: preference?.autoResetOnStopOut ?? false,
      notificationsEnabled: preference?.notificationsEnabled ?? true
    };
  }, [user?.preference]);

  const persona = useMemo(() => derivePersona(user?.onboardingResponses), [user?.onboardingResponses]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? "",
      email: user?.email ?? ""
    }
  });

  const preferencesForm = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreference
  });

  const watchedCurrentBalance = preferencesForm.watch("currentBalance");
  const watchedStartingBalance = preferencesForm.watch("startingBalance");
  const watchedCurrency = preferencesForm.watch("baseCurrency");
  const notificationsEnabled = preferencesForm.watch("notificationsEnabled");
  const autoResetOnStopOut = preferencesForm.watch("autoResetOnStopOut");

  const safeCurrentBalance =
    typeof watchedCurrentBalance === "number" && !Number.isNaN(watchedCurrentBalance)
      ? watchedCurrentBalance
      : defaultPreference.currentBalance;
  const safeStartingBalance =
    typeof watchedStartingBalance === "number" && !Number.isNaN(watchedStartingBalance)
      ? watchedStartingBalance
      : defaultPreference.startingBalance;
  const currencyCode = (watchedCurrency || defaultPreference.baseCurrency || "USD").toUpperCase();

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(value);
    } catch {
      return `${currencyCode} ${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  };

  const balanceDelta = safeCurrentBalance - safeStartingBalance;
  const deltaLabel =
    balanceDelta === 0 ? formatCurrency(0) : `${balanceDelta > 0 ? "+" : "-"}${formatCurrency(Math.abs(balanceDelta))}`;
  const deltaPercentLabel =
    safeStartingBalance > 0
      ? `${balanceDelta >= 0 ? "+" : ""}${((balanceDelta / safeStartingBalance) * 100).toFixed(2)}%`
      : "0.00%";
  const deltaColour = balanceDelta >= 0 ? "text-emerald-400" : "text-rose-400";

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        email: user.email
      });
    }
  }, [profileForm, user]);

  useEffect(() => {
    preferencesForm.reset(defaultPreference);
  }, [preferencesForm, defaultPreference]);

  const handleProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setProfileSubmitting(true);
      await updateProfile(values);
      toast({
        title: "Profile updated",
        description: "We've saved your account details."
      });
    } catch (error) {
      toast({
        title: "Could not update profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePreferencesSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    try {
      setPreferencesSubmitting(true);
      await updatePreferences(values);
      toast({
        title: "Preferences saved",
        description: "Your simulated account has been updated."
      });
    } catch (error) {
      toast({
        title: "Could not save preferences",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setPreferencesSubmitting(false);
    }
  };

  const handleBalanceReset = async () => {
    try {
      setPreferencesSubmitting(true);
      await resetBalance();
      toast({
        title: "Balance reset",
        description: "Your account has been reset to the starting balance."
      });
    } catch (error) {
      toast({
        title: "Unable to reset balance",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setPreferencesSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 translate-y-1/3 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="container relative mx-auto px-4 py-12 lg:py-16">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 text-white">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/10 text-xs uppercase tracking-[0.3em] text-primary"
              >
                Profile & preferences
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Fine-tune your trading environment</h1>
                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                  Update your login details, monitor your practice balance, and shape the way T-Line supports your daily
                  workflow.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Current balance</p>
                <p className="text-xl font-semibold">{formatCurrency(safeCurrentBalance)}</p>
                <p className={`text-xs font-medium ${deltaColour}`}>
                  {balanceDelta === 0 ? "No change" : `${deltaLabel} (${deltaPercentLabel})`}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <Alert className="mt-6 border-emerald-500/30 bg-emerald-500/10 text-white">
          <AlertTitle>Community plan policy</AlertTitle>
          <AlertDescription className="text-white/80">
            New traders receive a $1,000 practice balance. If equity falls below{" "}
            {formatCurrency(Number(user?.preference?.stopOutThreshold ?? 200))}, the account is stopped out and recharges require a
            Pro or Ultimate subscription. Upgrade anytime to unlock higher balance caps and unlimited resets.
          </AlertDescription>
        </Alert>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-8 grid gap-5 lg:grid-cols-3"
        >
          <Card className="border-white/10 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Trader persona
              </CardTitle>
              <CardDescription className="text-white/60">
                We tailor playbooks and dashboards around these signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              <div>
                <p className="text-sm text-white/60">Style</p>
                <p className="text-lg font-semibold">{persona.style ?? "Adaptive trader"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Experience</p>
                  <p className="text-sm text-white/70">{persona.experience ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">Primary goal</p>
                  <p className="text-sm text-white/70">{persona.goal ?? "Grow consistency"}</p>
                </div>
              </div>
              {persona.markets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {persona.markets.map((market) => (
                    <Badge key={market} variant="secondary" className="border-white/10 bg-white/10 text-white">
                      <Globe2 className="mr-1 h-3.5 w-3.5" />
                      {market}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/50">Add the markets you trade during onboarding.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-primary" />
                Account pulse
              </CardTitle>
              <CardDescription className="text-white/60">
                Live balance updates from your simulated trading account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-white">
              <p className="text-3xl font-semibold">{formatCurrency(safeCurrentBalance)}</p>
              <div className={`flex items-center gap-2 text-sm font-medium ${deltaColour}`}>
                {balanceDelta === 0 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    No change today
                  </>
                ) : (
                  <>
                    {balanceDelta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {deltaLabel} ({deltaPercentLabel})
                  </>
                )}
              </div>
              <p className="text-xs text-white/60">Base currency {currencyCode}</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-primary" />
                Automation
              </CardTitle>
              <CardDescription className="text-white/60">
                Keep your practice account aligned with your guardrails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-white">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Auto reset</p>
                <p className="text-sm font-semibold">{autoResetOnStopOut ? "Enabled" : "Disabled"}</p>
                <p className="mt-1 text-xs text-white/60">
                  {autoResetOnStopOut
                    ? "We will restore your balance after a simulated stop out."
                    : "Keep this on to automatically restore your balance after large drawdowns."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Notifications</p>
                <p className="text-sm font-semibold">{notificationsEnabled ? "Enabled" : "Muted"}</p>
                <p className="mt-1 text-xs text-white/60">
                  {notificationsEnabled
                    ? "We will send risk prompts, playbook reminders, and streak updates."
                    : "Turn notifications back on to stay in sync with your trading plan."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
        >
          <Card className="border-white/10 bg-black/45 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UserCircle2 className="h-5 w-5 text-primary" />
                Account details
              </CardTitle>
              <CardDescription className="text-white/60">
                Update your public username and login email. Changes apply instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-5">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="pro.trader"
                            className="border-white/10 bg-black/40 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@tline.app"
                            className="border-white/10 bg-black/40 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="gap-2" disabled={profileSubmitting}>
                    <Save className="h-4 w-4" />
                    {profileSubmitting ? "Saving..." : "Save profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/45 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Coins className="h-5 w-5 text-primary" />
                Simulated balance
              </CardTitle>
              <CardDescription className="text-white/60">
                Adjust the account you use across practice trades and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={preferencesForm.control}
                      name="startingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Starting balance</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="100"
                              min="1000"
                              inputMode="decimal"
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(event.target.value === "" ? 0 : Number(event.target.value))
                              }
                              className="border-white/10 bg-black/40 text-white focus-visible:ring-primary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="currentBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Current balance</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="100"
                              min="100"
                              inputMode="decimal"
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(event.target.value === "" ? 0 : Number(event.target.value))
                              }
                              className="border-white/10 bg-black/40 text-white focus-visible:ring-primary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="baseCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Base currency</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={3}
                              className="uppercase border-white/10 bg-black/40 text-white focus-visible:ring-primary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <FormField
                      control={preferencesForm.control}
                      name="autoResetOnStopOut"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                          <div className="pr-6">
                            <FormLabel className="text-white">Auto-reset on stop out</FormLabel>
                            <p className="text-xs text-white/60">
                              Return to your starting balance after a simulated stop out.
                            </p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={preferencesSubmitting} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="notificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                          <div className="pr-6">
                            <FormLabel className="text-white">Performance notifications</FormLabel>
                            <p className="text-xs text-white/60">
                              Stay on top of trade results, streaks, and upcoming playbooks.
                            </p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={preferencesSubmitting} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBalanceReset}
                      disabled={preferencesSubmitting}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to starting balance
                    </Button>
                    <Button type="submit" className="gap-2" disabled={preferencesSubmitting}>
                      <Save className="h-4 w-4" />
                      {preferencesSubmitting ? "Saving..." : "Save preferences"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Profile;
