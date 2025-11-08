import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { GuestRoute, OnboardingRoute, ProtectedRoute } from "@/components/auth/RouteGuards";
import { DashboardLayout } from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import PerformanceAnalytics from "./pages/dashboard/PerformanceAnalytics";
import TradeHistory from "./pages/dashboard/TradeHistory";
import StrategyBuilder from "./pages/dashboard/StrategyBuilder";
import Wallets from "./pages/dashboard/Wallets";
import Subscription from "./pages/dashboard/Subscription";
import CustomReports from "./pages/dashboard/CustomReports";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <div className="overflow-x-hidden w-full">
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<OnboardingRoute />}>
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>
              <Route element={<ProtectedRoute requireOnboarding />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="overview" element={<Overview />} />
                  <Route path="analytics" element={<PerformanceAnalytics />} />
                  <Route path="trade-history" element={<TradeHistory />} />
                  <Route path="reports" element={<CustomReports />} />
                  <Route path="strategy-builder" element={<StrategyBuilder />} />
                  <Route path="wallets" element={<Wallets />} />
                  <Route path="subscription" element={<Subscription />} />
                </Route>
                <Route path="/profile" element={<Profile />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
