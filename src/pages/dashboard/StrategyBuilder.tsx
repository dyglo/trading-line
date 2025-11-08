import { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Bot,
  Code2,
  FilePlus,
  Loader2,
  Play,
  Save,
  Sparkles,
  TerminalSquare,
  Wand2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  createStrategy,
  fetchStrategies,
  fetchStrategyMessages,
  insertStrategyMessages,
  updateStrategy
} from "@/supabase/strategies";
import type { ApiStrategy, ApiStrategyMessage } from "@/types/api";

type BuilderMode = "gui" | "scripting";

const defaultCode = `// Imports
import { ema, rsi, bollingerBands } from "@/lib/indicators";

export const moonScalper = createStrategy({
  name: "MoonScalper",
  timeframe: "15m",
  markets: ["ETH/USDT"],
  risk: {
    maxPosition: 0.5,
    stopLoss: -0.018,
    takeProfit: 0.032,
  },
  entry({ candle, indicators }) {
    const trendUp = ema(21).isAbove(ema(55));
    const rsiReset = indicators.rsi.value < 35;
    const lowerBandTouch = candle.low <= bollingerBands().lower;

    return trendUp && rsiReset && lowerBandTouch;
  },
  exit({ candle, position }) {
    const momentumFade = rsi(9).value > 72;
    const trailingStop = candle.close < position.trailingStop;

    return momentumFade || trailingStop;
  },
});`;

const StrategyBuilder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<BuilderMode>("scripting");
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [codeDraft, setCodeDraft] = useState(defaultCode);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [seededDefault, setSeededDefault] = useState(false);
  const [lastSyncedCode, setLastSyncedCode] = useState(defaultCode);
  const [lastSyncedAutosave, setLastSyncedAutosave] = useState(true);

  const { data: strategies = [], isLoading: strategiesLoading } = useQuery({
    queryKey: ["strategies", user?.id],
    queryFn: fetchStrategies,
    enabled: Boolean(user?.id)
  });

  const currentStrategy = useMemo<ApiStrategy | null>(
    () => strategies.find((entry) => entry.id === selectedStrategyId) ?? null,
    [strategies, selectedStrategyId]
  );

  const messagesQueryKey = useMemo(
    () => ["strategy-messages", selectedStrategyId],
    [selectedStrategyId]
  );

  const { data: aiMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () => fetchStrategyMessages(selectedStrategyId!),
    enabled: Boolean(selectedStrategyId)
  });

  const syncStrategyCache = useCallback(
    (next: ApiStrategy) => {
      queryClient.setQueryData<ApiStrategy[]>(["strategies", user?.id], (prev = []) => {
        const exists = prev.some((entry) => entry.id === next.id);
        if (exists) {
          return prev.map((entry) => (entry.id === next.id ? next : entry));
        }
        return [next, ...prev];
      });
      setLastSavedAt(new Date(next.updatedAt));
      setLastSyncedCode(next.code);
      setLastSyncedAutosave(next.autosaveEnabled);
    },
    [queryClient, user?.id]
  );

  const createStrategyMutation = useMutation({
    mutationFn: createStrategy,
    onSuccess: (strategy) => {
      syncStrategyCache(strategy);
      setSelectedStrategyId(strategy.id);
      setCodeDraft(strategy.code);
      setAutosaveEnabled(strategy.autosaveEnabled);
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to create strategy",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  type UpdateArgs = { strategyId: string; updates: Parameters<typeof updateStrategy>[1] };

  const autosaveMutation = useMutation({
    mutationFn: ({ strategyId, updates }: UpdateArgs) => updateStrategy(strategyId, updates),
    onSuccess: (strategy) => {
      syncStrategyCache(strategy);
    },
    onError: (error: Error) => {
      toast({
        title: "Autosave failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const manualSaveMutation = useMutation({
    mutationFn: ({ strategyId, updates }: UpdateArgs) => updateStrategy(strategyId, updates),
    onSuccess: (strategy) => {
      syncStrategyCache(strategy);
      toast({
        title: "Strategy saved",
        description: `${strategy.name} synced at ${new Date(strategy.updatedAt).toLocaleTimeString()}`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to save strategy",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const appendMessagesMutation = useMutation({
    mutationFn: (payload: { strategyId: string; prompt: string; response: string }) =>
      insertStrategyMessages({
        strategyId: payload.strategyId,
        messages: [
          { role: "user", content: payload.prompt },
          { role: "assistant", content: payload.response }
        ]
      }),
    onSuccess: (newMessages, variables) => {
      queryClient.setQueryData<ApiStrategyMessage[]>(
        ["strategy-messages", variables.strategyId],
        (prev = []) => [
          ...prev,
          ...newMessages
        ]
      );
      toast({
        title: "AI assist updated",
        description: `Conversation appended to ${currentStrategy?.name ?? "strategy"}.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Could not log AI message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (!strategiesLoading && strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategiesLoading, strategies, selectedStrategyId]);

  useEffect(() => {
    if (!strategiesLoading && strategies.length === 0 && user?.id && !seededDefault) {
      setSeededDefault(true);
      createStrategyMutation.mutate({
        name: "MoonScalper",
        code: defaultCode,
        mode: "SCRIPTING",
        autosaveEnabled: true
      });
    }
  }, [strategiesLoading, strategies.length, user?.id, seededDefault, createStrategyMutation]);

  useEffect(() => {
    if (!currentStrategy) {
      return;
    }

    setCodeDraft(currentStrategy.code);
    setAutosaveEnabled(currentStrategy.autosaveEnabled);
    setLastSavedAt(new Date(currentStrategy.updatedAt));
    setLastSyncedCode(currentStrategy.code);
    setLastSyncedAutosave(currentStrategy.autosaveEnabled);
  }, [currentStrategy?.id]);

  useEffect(() => {
    if (!currentStrategy) {
      return;
    }

    if (autosaveEnabled !== lastSyncedAutosave) {
      autosaveMutation.mutate({
        strategyId: currentStrategy.id,
        updates: { autosaveEnabled }
      });
    }
  }, [autosaveEnabled, lastSyncedAutosave, currentStrategy, autosaveMutation]);

  useEffect(() => {
    if (!currentStrategy || !autosaveEnabled) {
      return;
    }

    if (codeDraft === lastSyncedCode) {
      return;
    }

    const timeout = setTimeout(() => {
      autosaveMutation.mutate({
        strategyId: currentStrategy.id,
        updates: { code: codeDraft }
      });
    }, 900);

    return () => clearTimeout(timeout);
  }, [codeDraft, currentStrategy, autosaveEnabled, lastSyncedCode, autosaveMutation]);

  const handleSave = () => {
    if (!currentStrategy) {
      return;
    }

    manualSaveMutation.mutate({
      strategyId: currentStrategy.id,
      updates: { code: codeDraft, autosaveEnabled }
    });
  };

  const handlePromptSubmit = () => {
    if (!currentStrategy || !prompt.trim() || !aiAssistEnabled) {
      return;
    }

    const cleanPrompt = prompt.trim();
    const assistantResponse = `Incorporating "${cleanPrompt}" into ${currentStrategy.name}. We'll combine your signal with volatility filters and tighten stop-loss to protect downside.`;

    appendMessagesMutation.mutate({
      strategyId: currentStrategy.id,
      prompt: cleanPrompt,
      response: assistantResponse
    });

    setPrompt("");
  };

  const strategyOptions = useMemo(
    () =>
      strategies.map((entry) => ({
        value: entry.id,
        label: entry.name,
        description: entry.mode === "GUI" ? "GUI mode" : "Scripting mode"
      })),
    [strategies]
  );

  const renderGuiPlaceholder = () => (
    <div className="rounded-[28px] border border-white/10 bg-black/40 p-8 text-white/70">
      <div className="flex flex-col gap-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold text-white">GUI builder under construction</h2>
        <p className="text-base text-white/70">
          Drag-and-drop signal blocks, risk modules, and automation rules will live here. We&apos;re finishing the grid
          editor and visual routing — switch to the scripting view to keep iterating.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm">
          {["Signal Blocks", "Risk Controls", "Execution Paths", "Backtest Runs"].map((chip) => (
            <span key={chip} className="rounded-full border border-white/10 px-4 py-1 text-white/70">
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="rounded-full px-6 text-black" size="lg">
            Join waitlist
          </Button>
          <Button variant="outline" className="rounded-full border-white/30 px-6 text-white/80" size="lg">
            View design spec
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-white">
      <Card className="rounded-[32px] border border-white/10 bg-[#050505]/80 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-8 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3">
            {([
              { value: "gui", label: "GUI Strategy Builder", icon: Bot },
              { value: "scripting", label: "Scripting Strategy Builder", icon: Code2 }
            ] as const).map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-primary bg-primary/15 text-white shadow-[0_10px_35px_rgba(255,198,0,0.3)]"
                      : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {mode === "gui" ? (
            renderGuiPlaceholder()
          ) : (
            <div className="space-y-6 rounded-[28px] border border-white/5 bg-black/40 p-6">
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  value={selectedStrategyId ?? undefined}
                  onValueChange={setSelectedStrategyId}
                  disabled={strategiesLoading || strategyOptions.length === 0}
                >
                  <SelectTrigger className="h-14 min-w-[220px] rounded-2xl border-white/10 bg-white/5 px-5 text-left text-white">
                    <SelectValue placeholder={strategiesLoading ? "Loading strategies..." : "Create a strategy"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-[#050505] text-white">
                    {strategyOptions.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No strategies yet
                      </SelectItem>
                    ) : (
                      strategyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="flex flex-col gap-1">
                          <span className="font-semibold">{option.label}</span>
                          <span className="text-xs text-white/60">{option.description}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 text-white/80"
                  onClick={() =>
                    createStrategyMutation.mutate({
                      name: `Untitled Strategy ${strategies.length + 1}`,
                      code: defaultCode,
                      mode: "SCRIPTING",
                      autosaveEnabled: true
                    })
                  }
                  disabled={createStrategyMutation.isPending}
                >
                  {createStrategyMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FilePlus className="mr-2 h-4 w-4" />
                  )}
                  New Strategy
                </Button>

                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 text-white/80"
                  onClick={() => currentStrategy && setCodeDraft(currentStrategy.code)}
                  disabled={!currentStrategy}
                >
                  <TerminalSquare className="mr-2 h-4 w-4" />
                  Load Strategy
                </Button>

                <div className="flex flex-1 items-center justify-end gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/50">
                    Autosave
                    <Switch checked={autosaveEnabled} onCheckedChange={setAutosaveEnabled} />
                  </div>
                  <Button
                    className="rounded-2xl px-6 text-black shadow-[0_10px_35px_rgba(255,198,0,0.35)]"
                    onClick={handleSave}
                    disabled={!currentStrategy || manualSaveMutation.isPending}
                  >
                    {manualSaveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Strategy
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
                <div className="rounded-[28px] border border-white/5 bg-gradient-to-b from-[#0b0c11] to-[#050505] shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 text-xs uppercase tracking-[0.35em] text-white/50">
                    <span>{currentStrategy?.name ?? "Loading strategy..."}</span>
                    <span>
                      {lastSavedAt ? `Synced ${lastSavedAt.toLocaleTimeString()}` : "Not saved yet"}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <Editor
                      height="420px"
                      defaultLanguage="typescript"
                      theme="vs-dark"
                      value={codeDraft}
                      onChange={(value) => setCodeDraft(value ?? "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        lineNumbers: "on",
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">AI Assist</p>
                          <p className="text-xs text-white/60">Use the assistant to scaffold a new strategy.</p>
                        </div>
                      </div>
                      <Switch checked={aiAssistEnabled} onCheckedChange={setAiAssistEnabled} />
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
                      {aiAssistEnabled
                        ? "Assistant will monitor your prompts and suggest optimized entries, exits, and risk modules."
                        : "Enable the toggle to augment your prompts with AI-generated building blocks."}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-white/10 bg-black/50 p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src="https://api.dicebear.com/9.x/identicon/svg?seed=ai" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">Dexter, Strategy AI</p>
                        <p className="text-xs text-white/60">Realtime drafting mode</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {messagesLoading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                          Loading conversation...
                        </div>
                      ) : aiMessages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                          No AI history yet. Send a prompt to capture your first strategy discussion.
                        </div>
                      ) : (
                        aiMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-sm",
                              message.role === "assistant"
                                ? "border-white/10 bg-white/5 text-white/80"
                                : "border-primary/20 bg-primary/10 text-white"
                            )}
                          >
                            <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/40">
                              <span>{message.role === "assistant" ? "Assistant" : "You"}</span>
                              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p>{message.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/60 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/5 px-4 py-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <input
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Develop a mean reversion strategy for Ethereum with RSI + volume filters"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                    />
                  </div>
                  <Button
                    className="rounded-2xl px-6 text-black"
                    size="lg"
                    onClick={handlePromptSubmit}
                    disabled={
                      !currentStrategy ||
                      !prompt.trim() ||
                      !aiAssistEnabled ||
                      appendMessagesMutation.isPending
                    }
                  >
                    {appendMessagesMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Send Prompt
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyBuilder;
