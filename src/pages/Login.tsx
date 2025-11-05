import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LogInIcon, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Location } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { LoginPayload } from "@/types/api";

const loginSchema = z.object({
  emailOrUsername: z.string().trim().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password.")
});

const marketingBullets = [
  {
    title: "Institutional-grade tooling",
    description: "Access pro analytics, order flow and execution dashboards in seconds.",
    icon: ShieldCheck
  },
  {
    title: "AI-assisted coaching",
    description: "Personalised playbooks keep you accountable through every trade setup.",
    icon: Sparkles
  }
];

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectFallback = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
  const fallbackDestination = redirectFallback === "/onboarding" ? "/dashboard" : redirectFallback;

  const destination = useMemo(() => {
    if (!user) {
      return null;
    }

    if (!user.isOnboardingComplete) {
      return "/onboarding";
    }

    return fallbackDestination;
  }, [fallbackDestination, user]);

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: ""
    }
  });

  const handleSubmit = async (values: LoginPayload) => {
    try {
      setIsSubmitting(true);
      const userAccount = await login(values);
      toast({
        title: `Welcome back, ${userAccount.username}!`,
        description: "You're logged in - markets await."
      });
      const nextRoute = userAccount.isOnboardingComplete ? fallbackDestination : "/onboarding";
      navigate(nextRoute, { replace: true });
    } catch (error) {
      toast({
        title: "Unable to sign in",
        description:
          error instanceof Error ? error.message : "Double-check your credentials or try resetting your password.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (destination) {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-x-0 top-0 flex w-full justify-center px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          asChild
        >
          <Link to="/">Back to landing</Link>
        </Button>
      </div>
      <div className="container flex min-h-screen flex-col justify-center px-4 py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="mx-auto w-full max-w-md lg:max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 text-white"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              T-Line Terminal
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Unlock your pro trading cockpit in less than 60 seconds.
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Reconnect with your $10,000 practice balance, real-time charting suite, and structured training plans.
            </p>
            <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur">
              {marketingBullets.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 w-full max-w-md lg:mt-0"
        >
          <Card className="border border-border/70 bg-background/80 backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-semibold text-white">
                <LogInIcon className="h-6 w-6 text-primary" />
                Sign in to T-Line
              </CardTitle>
              <CardDescription className="text-sm text-white/60">
                We'll restore your open dashboards, preferences, and training streaks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="emailOrUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email or username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="you@tline.app"
                            className="border-border/70 bg-background/60 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="********"
                            className="border-border/70 bg-background/60 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Signing you in..." : "Access dashboard"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm text-white/60">
                New to T-Line?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create your account
                </Link>
              </div>
              <div className="mt-2 text-center text-sm text-white/40">
                or{" "}
                <Link to="/" className="font-medium text-primary hover:underline">
                  return to landing
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;



