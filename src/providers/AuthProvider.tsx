import { createContext, useContext, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import type {
  ApiUser,
  AuthResponse,
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

  const ensureUser = (response: AuthResponse) => {
    if (!response.user) {
      throw new Error(response.message ?? "Unexpected empty response.");
    }
    return response.user;
  };

  const meQuery = useQuery<ApiUser | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        const response = await api.get<AuthResponse>("/auth/me");
        return response.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    initialData: null,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<AuthResponse>("/auth/login", payload);
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await api.post<AuthResponse>("/auth/register", payload);
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: async () => {
      await applyUser(null);
      queryClient.removeQueries({ queryKey: authQueryKey, exact: true });
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<AuthResponse>("/auth/refresh");
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await api.patch<AuthResponse>("/profile", payload);
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (payload: UpdatePreferencesPayload) => {
      const response = await api.patch<AuthResponse>("/profile/preferences", payload);
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const resetBalanceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<AuthResponse>("/profile/preferences/reset");
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
    }
  });

  const onboardingMutation = useMutation({
    mutationFn: async (payload: OnboardingSubmissionPayload) => {
      const response = await api.post<AuthResponse>("/onboarding/submit", payload);
      return ensureUser(response);
    },
    onSuccess: async (user) => {
      await applyUser(user);
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
      isLoading: meQuery.isLoading || meQuery.isFetching,
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
