import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, LineChart } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { RegisterPayload } from "@/types/api";

const registerSchema = z
  .object({
    username: z.string().trim().min(3, "Usernames need at least 3 characters.").max(30),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Passwords need 8+ characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsSubmitting(true);
      const payload: RegisterPayload = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password
      };
      const user = await registerUser(payload);
      toast({
        title: "Account created",
        description: `Welcome aboard, ${user.username}. Let’s tailor your trading plan.`,
        duration: 5000
      });
      navigate("/onboarding", { replace: true });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please review your details and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_60%)]" />
      <div className="container relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto w-full max-w-xl space-y-8 text-white"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            Step 1 / 3
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Launch your $10,000 training account with guided onboarding.
          </h1>
          <p className="text-base text-white/70 sm:text-lg">
            Create an account to unlock the simulated trading floor, premium education library, and weekly strategy
            breakdowns from our institutional desk.
          </p>
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">$10K</span>
              <p className="text-sm text-white/60">Resettable paper account with real-time P&L tracking.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <LineChart className="h-4 w-4 text-primary" />
                Guided playbooks
              </div>
              <p className="text-sm text-white/60">Answer a few questions and we’ll personalise your trading plan.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 w-full max-w-md lg:mt-0"
        >
          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold text-white">Create your T-Line account</CardTitle>
              <CardDescription className="text-white/60">
                Set your credentials — you’ll define trading preferences on the next screen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                            placeholder="Strong & secure"
                            className="border-white/10 bg-black/40 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Repeat password"
                            className="border-white/10 bg-black/40 text-white placeholder:text-white/40 focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Setting things up…" : "Launch onboarding"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm text-white/60">
                Already trading with us?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign back in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
