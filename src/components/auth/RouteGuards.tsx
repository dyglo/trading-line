import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";

import { useAuth } from "@/providers/AuthProvider";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Preparing your trading workspace…</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  requireOnboarding?: boolean;
  children?: ReactNode;
}

export const ProtectedRoute = ({ requireOnboarding = false, children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireOnboarding && !user.isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const GuestRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    if (!user.isOnboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export const OnboardingRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isOnboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
