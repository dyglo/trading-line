import { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCurrentUserProfile,
  loginWithSupabase,
  logoutFromSupabase,
  registerWithSupabase,
  resetBalance as resetBalanceRequest,
  submitOnboardingResponses,
  updatePreferences as updatePreferencesRequest,
  updateProfileDetails
} from "@/supabase/profile";
import { supabase } from "@/supabase/client";
import type {
  ApiUser,
  LoginPayload,
  OnboardingSubmissionPayload,
  RegisterPayload,
  UpdatePreferencesPayload,
  UpdateProfilePayload
} from "@/types/api";

interface AuthContextValue {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<ApiUser>;
  register: (payload: RegisterPayload) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<ApiUser>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ApiUser>;
  updatePreferences: (payload: UpdatePreferencesPayload) => Promise<ApiUser>;
  resetBalance: () => Promise<ApiUser>;
  submitOnboarding: (payload: OnboardingSubmissionPayload) => Promise<ApiUser>;
  refetch: () => Promise<ApiUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const authQueryKey = ["auth", "me"] as const;
const onboardingQueryKey = ["onboarding", "questions"] as const;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const setUser = useCallback(
    (user: ApiUser | null) => {
      queryClient.setQueryData<ApiUser | null>(authQueryKey, user);
    },
    [queryClient]
  );

  const applyUser = useCallback(
    async (user: ApiUser | null) => {
      await queryClient.cancelQueries({ queryKey: authQueryKey, exact: true });
      setUser(user);
    },
    [queryClient, setUser]
  );

  const meQuery = useQuery<ApiUser | null>({
    queryKey: authQueryKey,
    queryFn: getCurrentUserProfile,
    initialData: null,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60
  });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event) => {
      // Only invalidate on meaningful session-changing events to avoid refetch loops
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        await queryClient.invalidateQueries({ queryKey: authQueryKey });
        await queryClient.invalidateQueries({ queryKey: onboardingQueryKey });
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: loginWithSupabase,
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const registerMutation = useMutation({
    mutationFn: registerWithSupabase,
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFromSupabase,
    onSuccess: async () => {
      await applyUser(null);
      queryClient.removeQueries({ queryKey: authQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: onboardingQueryKey });
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.refreshSession();

      if (error) {
        throw new Error(error.message);
      }

      if (!session?.user) {
        throw new Error("Session refresh failed.");
      }

      return (await getCurrentUserProfile())!;
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileDetails,
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: updatePreferencesRequest,
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const resetBalanceMutation = useMutation({
    mutationFn: resetBalanceRequest,
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const onboardingMutation = useMutation({
    mutationFn: submitOnboardingResponses,
    onSuccess: async (user) => {
      await applyUser(user);
      queryClient.invalidateQueries({ queryKey: onboardingQueryKey });
    }
  });

  const refetch = useCallback(async () => {
    const result = await meQuery.refetch();
    return result.data ?? null;
  }, [meQuery]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isAuthenticated: Boolean(meQuery.data),
      isLoading: meQuery.isLoading,
      login: loginMutation.mutateAsync,
      register: registerMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      refresh: refreshMutation.mutateAsync,
      updateProfile: updateProfileMutation.mutateAsync,
      updatePreferences: updatePreferencesMutation.mutateAsync,
      resetBalance: resetBalanceMutation.mutateAsync,
      submitOnboarding: onboardingMutation.mutateAsync,
      refetch
    }),
    [
      meQuery.data,
      meQuery.isFetching,
      meQuery.isLoading,
      refetch,
      loginMutation.mutateAsync,
      registerMutation.mutateAsync,
      logoutMutation.mutateAsync,
      refreshMutation.mutateAsync,
      updateProfileMutation.mutateAsync,
      updatePreferencesMutation.mutateAsync,
      resetBalanceMutation.mutateAsync,
      onboardingMutation.mutateAsync
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
