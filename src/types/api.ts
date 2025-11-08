export type OnboardingQuestionType = "SINGLE_SELECT" | "MULTI_SELECT" | "FREE_TEXT";

export type SubscriptionTier = "COMMUNITY" | "PRO" | "ULTIMATE";
export type AccountStatus = "ACTIVE" | "STOPPED_OUT";

export interface ApiOnboardingOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface ApiOnboardingQuestion {
  id: string;
  prompt: string;
  description?: string | null;
  type: OnboardingQuestionType;
  order: number;
  options: ApiOnboardingOption[];
}

export interface ApiUserPreference {
  id: string;
  userId: string;
  startingBalance: string;
  currentBalance: string;
  baseCurrency: string;
  autoResetOnStopOut: boolean;
  notificationsEnabled: boolean;
  subscriptionTier: SubscriptionTier;
  accountStatus: AccountStatus;
  stopOutThreshold: string;
  lastStopOutAt: string | null;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOnboardingResponse {
  id: string;
  questionId: string;
  optionId?: string | null;
  freeText?: string | null;
  createdAt: string;
  updatedAt: string;
  option: {
    id: string;
    label: string;
    value: string;
  } | null;
  question: {
    id: string;
    prompt: string;
    type: OnboardingQuestionType;
    order: number;
  } | null;
}

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  isOnboardingComplete: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  preference: ApiUserPreference | null;
  onboardingResponses: ApiOnboardingResponse[];
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

export interface UpdatePreferencesPayload {
  startingBalance?: number;
  currentBalance?: number;
  baseCurrency?: string;
  autoResetOnStopOut?: boolean;
  notificationsEnabled?: boolean;
}

export interface ActivateSubscriptionPayload {
  tier: Exclude<SubscriptionTier, "COMMUNITY">;
  durationDays?: number;
}

export interface OnboardingSubmissionPayload {
  responses: Array<{
    questionId: string;
    optionIds?: string[];
    freeText?: string;
  }>;
}

export type StrategyMode = "GUI" | "SCRIPTING";
export type StrategyMessageRole = "assistant" | "user";

export interface ApiStrategy {
  id: string;
  userId: string;
  name: string;
  mode: StrategyMode;
  code: string;
  autosaveEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStrategyMessage {
  id: string;
  strategyId: string;
  role: StrategyMessageRole;
  content: string;
  createdAt: string;
}
