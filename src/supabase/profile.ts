import type {
  OnboardingOptionRow,
  OnboardingQuestionRow,
  OnboardingResponseRow,
  PreferenceRow,
  ProfileRow
} from "./types";
import { supabase } from "./client";

import type {
  ActivateSubscriptionPayload,
  ApiOnboardingQuestion,
  ApiOnboardingResponse,
  ApiOnboardingOption,
  ApiUser,
  ApiUserPreference,
  LoginPayload,
  OnboardingSubmissionPayload,
  RegisterPayload,
  SubscriptionTier,
  UpdatePreferencesPayload,
  UpdateProfilePayload
} from "@/types/api";

const DEFAULT_BALANCE = 1_000;
const BALANCE_CAPS: Record<SubscriptionTier, number> = {
  COMMUNITY: 1_000,
  PRO: 25_000,
  ULTIMATE: 1_000_000
};
const DEFAULT_STOP_OUT_THRESHOLD = 200;

const getBalanceCap = (tier: SubscriptionTier): number => BALANCE_CAPS[tier] ?? BALANCE_CAPS.COMMUNITY;

const mapPreference = (profileId: string, preference?: PreferenceRow | null): ApiUserPreference | null => {
  if (!preference) {
    return {
      id: `${profileId}-preference`,
      userId: profileId,
      startingBalance: DEFAULT_BALANCE.toFixed(2),
      currentBalance: DEFAULT_BALANCE.toFixed(2),
      baseCurrency: "USD",
      autoResetOnStopOut: false,
      notificationsEnabled: true,
      subscriptionTier: "COMMUNITY",
      accountStatus: "ACTIVE",
      stopOutThreshold: DEFAULT_STOP_OUT_THRESHOLD.toFixed(2),
      lastStopOutAt: null,
      subscriptionExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    id: preference.id,
    userId: preference.profile_id,
    startingBalance: preference.starting_balance,
    currentBalance: preference.current_balance,
    baseCurrency: preference.base_currency,
    autoResetOnStopOut: preference.auto_reset_on_stop_out,
    notificationsEnabled: preference.notifications_enabled,
    subscriptionTier: preference.subscription_tier,
    accountStatus: preference.account_status,
    stopOutThreshold: preference.stop_out_threshold,
    lastStopOutAt: preference.last_stop_out_at,
    subscriptionExpiresAt: preference.subscription_expires_at,
    createdAt: preference.created_at,
    updatedAt: preference.updated_at
  };
};

const mapOption = (option?: OnboardingOptionRow | null): ApiOnboardingOption | null => {
  if (!option) {
    return null;
  }

  return {
    id: option.id,
    label: option.label,
    value: option.value,
    order: option.sort_order
  };
};

const mapQuestion = (question?: OnboardingQuestionRow | null): ApiOnboardingResponse["question"] => {
  if (!question) {
    return null;
  }

  return {
    id: question.id,
    prompt: question.prompt,
    type: question.type,
    order: question.sort_order
  };
};

const mapResponse = (
  response: OnboardingResponseRow & {
    onboarding_options: OnboardingOptionRow | null;
    onboarding_questions: OnboardingQuestionRow | null;
  }
): ApiOnboardingResponse => ({
  id: response.id,
  questionId: response.question_id,
  optionId: response.option_id,
  freeText: response.free_text,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  option: mapOption(response.onboarding_options),
  question: mapQuestion(response.onboarding_questions)
});

const mapProfile = (
  profile: ProfileRow & {
    preferences: PreferenceRow | null;
    onboarding_responses: Array<
      OnboardingResponseRow & {
        onboarding_options: OnboardingOptionRow | null;
        onboarding_questions: OnboardingQuestionRow | null;
      }
    >;
  }
): ApiUser => ({
  id: profile.id,
  username: profile.username,
  email: profile.email,
  isOnboardingComplete: profile.onboarding_complete,
  lastLoginAt: profile.last_login_at,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
  preference: mapPreference(profile.id, profile.preferences),
  onboardingResponses: profile.onboarding_responses?.map(mapResponse) ?? []
});

const loadProfileById = async (id: string): Promise<ApiUser | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        username,
        email,
        onboarding_complete,
        last_login_at,
        created_at,
        updated_at,
        preferences:preferences(*),
        onboarding_responses:onboarding_responses(
          *,
          onboarding_options:onboarding_options(*),
          onboarding_questions:onboarding_questions(*)
        )
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapProfile(data as Parameters<typeof mapProfile>[0]);
};

const ensureProfileExists = async (userId: string, email: string, username: string) => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      email,
      username,
      onboarding_complete: false,
      last_login_at: now
    })
    .select("id")
    .maybeSingle();

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  const { error: prefError } = await supabase
    .from("preferences")
    .upsert({ profile_id: userId }, { onConflict: "profile_id" });

  if (prefError) {
    throw new Error(prefError.message);
  }
};

export const getCurrentUserProfile = async (): Promise<ApiUser | null> => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.user) {
    return null;
  }

  const profile = await loadProfileById(session.user.id);

  if (!profile) {
    await ensureProfileExists(session.user.id, session.user.email ?? "", session.user.user_metadata?.username ?? "");
    return await loadProfileById(session.user.id);
  }

  return profile;
};

export const registerWithSupabase = async ({ username, email, password }: RegisterPayload): Promise<ApiUser> => {
  const { data: existingUsername, error: usernameError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username.trim())
    .maybeSingle();

  if (usernameError) {
    throw new Error(usernameError.message);
  }

  if (existingUsername) {
    throw new Error("That username is already taken. Please choose another.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  // If email confirmation is enabled, Supabase returns no session here.
  // Avoid inserting into RLS-protected tables without auth — wait until user is authenticated.
  if (!data.session) {
    throw new Error("Registration successful. Please confirm your email to continue.");
  }

  const user = data.session.user;

  await ensureProfileExists(user.id, email, username);

  const profile = await loadProfileById(user.id);

  if (!profile) {
    throw new Error("Failed to load profile after registration.");
  }

  return profile;
};

export const loginWithSupabase = async ({ emailOrUsername, password }: LoginPayload): Promise<ApiUser> => {
  const identifier = emailOrUsername.trim();

  // Supabase auth only supports email/password by default. Try direct email first.
  let email = identifier;

  if (!identifier.includes("@")) {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .ilike("username", identifier)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.email) {
      throw new Error("No account found for that username.");
    }

    email = data.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  const user = data.user;

  if (!user) {
    throw new Error("Failed to retrieve session after login.");
  }

  // Speed up perceived login by doing non-critical update in parallel with profile fetch
  const [profileResult] = await Promise.all([
    loadProfileById(user.id),
    supabase.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", user.id)
  ]);

  if (!profileResult) {
    throw new Error("Failed to load profile.");
  }

  return profileResult;
};

export const logoutFromSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const updateProfileDetails = async (payload: UpdateProfilePayload): Promise<ApiUser> => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  if (payload.email && payload.email.trim().length > 0 && payload.email !== user.email) {
    const { error: updateError } = await supabase.auth.updateUser({ email: payload.email });
    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  if (payload.username) {
    const { error: usernameError } = await supabase
      .from("profiles")
      .update({ username: payload.username.trim() })
      .eq("id", user.id);

    if (usernameError) {
      throw new Error(usernameError.message);
    }
  }

  return (await loadProfileById(user.id))!;
};

export const updatePreferences = async (payload: UpdatePreferencesPayload): Promise<ApiUser> => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const profile = await loadProfileById(user.id);

  if (!profile?.preference) {
    throw new Error("Preference record not found.");
  }

  const activeTier = profile.preference.subscriptionTier;
  const tierCap = getBalanceCap(activeTier);

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (typeof payload.startingBalance === "number") {
    if (payload.startingBalance > tierCap) {
      throw new Error(
        `Your ${activeTier.toLowerCase()} plan caps the starting balance at $${tierCap.toLocaleString("en-US")}.`
      );
    }

    updatePayload.starting_balance = payload.startingBalance.toFixed(2);
  }

  if (typeof payload.currentBalance === "number") {
    if (payload.currentBalance > tierCap) {
      throw new Error(
        `Your ${activeTier.toLowerCase()} plan caps the account balance at $${tierCap.toLocaleString("en-US")}.`
      );
    }
    updatePayload.current_balance = payload.currentBalance.toFixed(2);
  }

  if (payload.baseCurrency) {
    updatePayload.base_currency = payload.baseCurrency;
  }

  if (typeof payload.autoResetOnStopOut === "boolean") {
    updatePayload.auto_reset_on_stop_out = payload.autoResetOnStopOut;
  }

  if (typeof payload.notificationsEnabled === "boolean") {
    updatePayload.notifications_enabled = payload.notificationsEnabled;
  }

  const { error: updateError } = await supabase.from("preferences").update(updatePayload).eq("profile_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return (await loadProfileById(user.id))!;
};

export const resetBalance = async (): Promise<ApiUser> => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: preference, error: fetchError } = await supabase
    .from("preferences")
    .select("starting_balance, subscription_tier, account_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!preference) {
    throw new Error("Preference record missing.");
  }

  if (preference.subscription_tier === "COMMUNITY") {
    throw new Error("Recharge requires an active Pro or Ultimate subscription.");
  }

  const balance = preference?.starting_balance ?? DEFAULT_BALANCE.toFixed(2);

  const { error: updateError } = await supabase
    .from("preferences")
    .update({
      current_balance: balance,
      account_status: "ACTIVE",
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return (await loadProfileById(user.id))!;
};

export const markStopOutStatus = async (currentBalance: number): Promise<ApiUser> => {
  const sanitizedBalance = Math.max(0, Number.isFinite(currentBalance) ? currentBalance : 0);

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { error: updateError } = await supabase
    .from("preferences")
    .update({
      current_balance: sanitizedBalance.toFixed(2),
      account_status: "STOPPED_OUT",
      last_stop_out_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return (await loadProfileById(user.id))!;
};

export const activateSubscription = async ({ tier, durationDays = 30 }: ActivateSubscriptionPayload): Promise<ApiUser> => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const profile = await loadProfileById(user.id);

  if (!profile?.preference) {
    throw new Error("Preference record missing.");
  }

  const tierCap = getBalanceCap(tier);
  const desiredStartingBalance = tierCap;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("preferences")
    .update({
      subscription_tier: tier,
      subscription_expires_at: expiresAt,
      account_status: "ACTIVE",
      starting_balance: desiredStartingBalance.toFixed(2),
      current_balance: desiredStartingBalance.toFixed(2),
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return (await loadProfileById(user.id))!;
};

const upsertResponses = async (profileId: string, payload: OnboardingSubmissionPayload) => {
  for (const response of payload.responses) {
    const { error: deleteError } = await supabase
      .from("onboarding_responses")
      .delete()
      .eq("profile_id", profileId)
      .eq("question_id", response.questionId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const rows: Partial<OnboardingResponseRow>[] = [];

    if (response.optionIds && response.optionIds.length > 0) {
      rows.push(
        ...response.optionIds.map((optionId) => ({
          profile_id: profileId,
          question_id: response.questionId,
          option_id: optionId
        }))
      );
    }

    if (response.freeText && response.freeText.trim().length > 0) {
      rows.push({
        profile_id: profileId,
        question_id: response.questionId,
        free_text: response.freeText.trim()
      });
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("onboarding_responses").insert(rows);
      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  }
};

export const submitOnboardingResponses = async (payload: OnboardingSubmissionPayload): Promise<ApiUser> => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Not authenticated.");
  }

  await upsertResponses(user.id, payload);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return (await loadProfileById(user.id))!;
};

export const fetchOnboardingQuestions = async (): Promise<ApiOnboardingQuestion[]> => {
  const { data, error } = await supabase
    .from("onboarding_questions")
    .select(
      `
        *,
        onboarding_options:onboarding_options(*)
      `
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      description: question.description,
      type: question.type,
      order: question.sort_order,
      options:
        question.onboarding_options
          ?.map((option: OnboardingOptionRow) => ({
            id: option.id,
            label: option.label,
            value: option.value,
            order: option.sort_order
          }))
          .sort((a: ApiOnboardingOption, b: ApiOnboardingOption) => a.order - b.order) ?? []
    })) ?? []
  );
};
