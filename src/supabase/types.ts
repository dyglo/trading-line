export type OnboardingQuestionType = "SINGLE_SELECT" | "MULTI_SELECT" | "FREE_TEXT";

export interface ProfileRow {
  id: string;
  username: string;
  email: string;
  onboarding_complete: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreferenceRow {
  id: string;
  profile_id: string;
  starting_balance: string;
  current_balance: string;
  base_currency: string;
  auto_reset_on_stop_out: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingQuestionRow {
  id: string;
  prompt: string;
  description: string | null;
  type: OnboardingQuestionType;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingOptionRow {
  id: string;
  question_id: string;
  label: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponseRow {
  id: string;
  profile_id: string;
  question_id: string;
  option_id: string | null;
  free_text: string | null;
  created_at: string;
  updated_at: string;
}
