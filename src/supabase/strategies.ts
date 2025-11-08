import type { StrategyRow, StrategyMessageRow } from "./types";
import { supabase } from "./client";

import type { ApiStrategy, ApiStrategyMessage, StrategyMessageRole, StrategyMode } from "@/types/api";

const requireUser = async () => {
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

  return user;
};

const mapStrategy = (row: StrategyRow): ApiStrategy => ({
  id: row.id,
  userId: row.profile_id,
  name: row.name,
  mode: row.mode,
  code: row.code,
  autosaveEnabled: row.autosave_enabled,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapMessage = (row: StrategyMessageRow): ApiStrategyMessage => ({
  id: row.id,
  strategyId: row.strategy_id,
  role: row.role,
  content: row.content,
  createdAt: row.created_at
});

export const fetchStrategies = async (): Promise<ApiStrategy[]> => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("profile_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapStrategy);
};

interface CreateStrategyPayload {
  name: string;
  code?: string;
  autosaveEnabled?: boolean;
  mode?: StrategyMode;
}

export const createStrategy = async (payload: CreateStrategyPayload): Promise<ApiStrategy> => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("strategies")
    .insert({
      profile_id: user.id,
      name: payload.name,
      code: payload.code ?? "",
      autosave_enabled: payload.autosaveEnabled ?? true,
      mode: payload.mode ?? "SCRIPTING"
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create strategy.");
  }

  return mapStrategy(data);
};

interface UpdateStrategyPayload {
  name?: string;
  code?: string;
  autosaveEnabled?: boolean;
  mode?: StrategyMode;
}

export const updateStrategy = async (
  strategyId: string,
  updates: UpdateStrategyPayload
): Promise<ApiStrategy> => {
  const user = await requireUser();
  const payload: Record<string, unknown> = {};

  if (typeof updates.name !== "undefined") {
    payload.name = updates.name;
  }

  if (typeof updates.code !== "undefined") {
    payload.code = updates.code;
  }

  if (typeof updates.autosaveEnabled !== "undefined") {
    payload.autosave_enabled = updates.autosaveEnabled;
  }

  if (typeof updates.mode !== "undefined") {
    payload.mode = updates.mode;
  }

  if (Object.keys(payload).length === 0) {
    const strategies = await fetchStrategies();
    const existing = strategies.find((entry) => entry.id === strategyId);
    if (!existing) {
      throw new Error("Strategy not found.");
    }
    return existing;
  }

  const { data, error } = await supabase
    .from("strategies")
    .update(payload)
    .eq("profile_id", user.id)
    .eq("id", strategyId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update strategy.");
  }

  return mapStrategy(data);
};

export const fetchStrategyMessages = async (strategyId: string): Promise<ApiStrategyMessage[]> => {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("strategy_ai_messages")
    .select("*")
    .eq("strategy_id", strategyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMessage);
};

interface InsertMessagesPayload {
  strategyId: string;
  messages: Array<{ role: StrategyMessageRole; content: string }>;
}

export const insertStrategyMessages = async ({
  strategyId,
  messages
}: InsertMessagesPayload): Promise<ApiStrategyMessage[]> => {
  await requireUser();

  if (messages.length === 0) {
    return [];
  }

  const rows = messages.map((message) => ({
    strategy_id: strategyId,
    role: message.role,
    content: message.content
  }));

  const { data, error } = await supabase.from("strategy_ai_messages").insert(rows).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMessage);
};
