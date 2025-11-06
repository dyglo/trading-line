import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Loader2, Sparkles, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { ApiOnboardingQuestion, OnboardingSubmissionPayload } from "@/types/api";
import { fetchOnboardingQuestions } from "@/supabase/profile";

interface ResponseDraft {
  optionIds: string[];
  freeText?: string;
}

const panelHighlights = [
  {
    icon: Compass,
    title: "Tailored playbooks",
    description: "We'll tune your training modules to match your experience and risk appetite."
  },
  {
    icon: Target,
    title: "Personalised trade journal",
    description: "Track performance and accountability metrics that align with your trading style."
  },
  {
    icon: Sparkles,
    title: "Real-time guidance",
    description: "Surface the right risk prompts and execution checklists when you sit down to trade."
  }
];

const formatQuestionType = (type: ApiOnboardingQuestion["type"]) => {
  switch (type) {
    case "SINGLE_SELECT":
      return "Single select";
    case "MULTI_SELECT":
      return "Multi select";
    case "FREE_TEXT":
      return "Free response";
    default:
      return "Question";
  }
};

const isQuestionComplete = (question: ApiOnboardingQuestion, drafts: Record<string, ResponseDraft>) => {
  const entry = drafts[question.id];

  if (!entry) {
    return false;
  }

  if (question.type === "FREE_TEXT") {
    return Boolean(entry.freeText && entry.freeText.trim().length > 0);
  }

  if (question.type === "SINGLE_SELECT") {
    return entry.optionIds.length === 1;
  }

  return entry.optionIds.length > 0;
};

const Onboarding = () => {
  const { user, submitOnboarding } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasAnchoredStep, setHasAnchoredStep] = useState(false);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["onboarding", "questions"],
    queryFn: fetchOnboardingQuestions
  });

  const [responses, setResponses] = useState<Record<string, ResponseDraft>>(() => {
    if (!user?.onboardingResponses) {
      return {};
    }

    const draft: Record<string, ResponseDraft> = {};

    for (const response of user.onboardingResponses) {
      if (!draft[response.questionId]) {
        draft[response.questionId] = { optionIds: [], freeText: undefined };
      }

      if (response.optionId) {
        draft[response.questionId].optionIds.push(response.optionId);
      }

      if (response.freeText) {
        draft[response.questionId].freeText = response.freeText;
      }
    }

    return draft;
  });

  useEffect(() => {
    if (!hasAnchoredStep && questions && questions.length > 0) {
      const firstIncomplete = questions.findIndex((question) => !isQuestionComplete(question, responses));
      setActiveIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      setHasAnchoredStep(true);
    }
  }, [questions, responses, hasAnchoredStep]);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      return;
    }

    if (activeIndex > questions.length - 1) {
      setActiveIndex(questions.length - 1);
    }
  }, [activeIndex, questions]);

  const totalQuestions = questions?.length ?? 0;

  const answeredCount = useMemo(() => {
    if (!questions) {
      return 0;
    }

    return questions.filter((question) => isQuestionComplete(question, responses)).length;
  }, [questions, responses]);

  const progress = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  const currentQuestion = questions && totalQuestions > 0 ? questions[activeIndex] : undefined;
  const currentDraft = currentQuestion ? responses[currentQuestion.id] ?? { optionIds: [], freeText: "" } : null;
  const isLastStep = activeIndex === totalQuestions - 1;

  const handleSingleSelect = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        optionIds: value ? [value] : [],
        freeText: prev[questionId]?.freeText
      }
    }));
  };

  const handleToggleOption = (questionId: string, optionId: string, checked: boolean) => {
    setResponses((prev) => {
      const existing = prev[questionId] ?? { optionIds: [], freeText: undefined };
      const optionIds = new Set(existing.optionIds);

      if (checked) {
        optionIds.add(optionId);
      } else {
        optionIds.delete(optionId);
      }

      return {
        ...prev,
        [questionId]: {
          optionIds: Array.from(optionIds),
          freeText: existing.freeText
        }
      };
    });
  };

  const handleFreeText = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        optionIds: prev[questionId]?.optionIds ?? [],
        freeText: value
      }
    }));
  };

  const submitResponses = async () => {
    if (!questions) {
      return;
    }

    const payload: OnboardingSubmissionPayload = {
      responses: questions.map((question) => {
        const entry = responses[question.id] ?? { optionIds: [], freeText: "" };
        return {
          questionId: question.id,
          optionIds: entry.optionIds,
          freeText: entry.freeText
        };
      })
    };

    try {
      setIsSubmitting(true);
      const updatedUser = await submitOnboarding(payload);
      toast({
        title: "Onboarding complete",
        description: "Your dashboard is calibrated - let's trade."
      });
      // Navigate regardless; route guards will keep users on onboarding if not fully complete
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not save your answers. Please try again.";
      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!currentQuestion || !questions) {
      return;
    }

    if (!isQuestionComplete(currentQuestion, responses)) {
      toast({
        title: "Complete this step",
        description: "Please answer the question before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (isLastStep) {
      if (!isSubmitting) {
        void submitResponses();
      }
      return;
    }

    setActiveIndex((index) => Math.min(index + 1, totalQuestions - 1));
  };

  const handlePrevious = () => {
    setActiveIndex((index) => Math.max(index - 1, 0));
  };

  const handleGoToStep = (index: number) => {
    if (!questions || index < 0 || index > questions.length - 1) {
      return;
    }

    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading personalised questionnaire...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-semibold text-white">All set!</h1>
        <Button onClick={() => navigate("/dashboard", { replace: true })}>Go to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="container relative mx-auto px-4 py-12 lg:py-16">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="space-y-4 text-white">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-xs uppercase tracking-[0.3em] text-primary"
            >
              Step {activeIndex + 1} of {totalQuestions}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tune your trading cockpit</h1>
              <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                Answer a few curated questions so we can surface the playbooks, dashboards, and guardrails that match
                the way you trade.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-white/60">
                <span>Progress</span>
                <span>
                  {answeredCount}/{totalQuestions} answered
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Personalisation</p>
              <p className="text-sm text-white/70">
                {isLastStep ? "Final question" : `Next up: ${questions[activeIndex + 1]?.prompt ?? "Review"}`}
              </p>
            </div>
          </div>
        </motion.header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
          <Card className="border-white/10 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Journey</CardTitle>
              <CardDescription className="text-white/60">
                Navigate between questions and keep an eye on what is left.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {questions.map((question, index) => {
                  const isCompleted = isQuestionComplete(question, responses);
                  const isCurrent = index === activeIndex;
                  return (
                    <motion.li
                      key={question.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleGoToStep(index)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          isCurrent
                            ? "border-primary bg-primary/10 text-white"
                            : isCompleted
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/60"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                        }`}
                        disabled={isSubmitting}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-sm font-medium">{question.prompt}</p>
                          <p className="text-xs text-white/50">{formatQuestionType(question.type)}</p>
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {currentQuestion && currentDraft && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35 }}
                >
                  <Card className="border-white/10 bg-black/50 backdrop-blur">
                    <CardHeader className="space-y-3">
                      <CardTitle className="flex items-start justify-between gap-4 text-white">
                        <span className="text-2xl font-semibold">{currentQuestion.prompt}</span>
                        <Badge
                          variant="secondary"
                          className="flex-shrink-0 rounded-full bg-white/10 text-xs uppercase tracking-widest text-white/70"
                        >
                          {formatQuestionType(currentQuestion.type)}
                        </Badge>
                      </CardTitle>
                      {currentQuestion.description ? (
                        <CardDescription className="max-w-2xl text-white/70">
                          {currentQuestion.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {currentQuestion.type === "SINGLE_SELECT" && (
                        <Select
                          value={currentDraft.optionIds[0] ?? ""}
                          onValueChange={(value) => handleSingleSelect(currentQuestion.id, value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="border-white/10 bg-black/40 text-white focus:ring-primary">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-900 text-white">
                            {currentQuestion.options.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {currentQuestion.type === "MULTI_SELECT" && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentQuestion.options.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 transition hover:border-primary/50"
                            >
                              <Checkbox
                                checked={currentDraft.optionIds.includes(option.id)}
                                onCheckedChange={(checked) =>
                                  handleToggleOption(currentQuestion.id, option.id, checked === true)
                                }
                                className="border-white/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                                disabled={isSubmitting}
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {currentQuestion.type === "FREE_TEXT" && (
                        <div className="space-y-2">
                          <Label className="text-sm text-white/70">Share your perspective</Label>
                          <Textarea
                            value={currentDraft.freeText ?? ""}
                            onChange={(event) => handleFreeText(currentQuestion.id, event.target.value)}
                            rows={5}
                            placeholder="Tell us more about how you approach the markets..."
                            className="border-white/10 bg-black/40 text-white placeholder:text-white/40 focus-visible:ring-primary"
                            disabled={isSubmitting}
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handlePrevious}
                          disabled={activeIndex === 0 || isSubmitting}
                          className="gap-2 sm:self-start"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={isSubmitting}
                          className="gap-2 sm:self-end"
                        >
                          {isLastStep ? (
                            <>
                              {isSubmitting ? "Submitting..." : "Submit responses"}
                              {!isSubmitting && <CheckCircle2 className="h-4 w-4" />}
                            </>
                          ) : (
                            <>
                              Save & continue
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4 lg:grid-cols-3">
              {panelHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="flex items-start gap-3 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <highlight.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{highlight.title}</p>
                      <p className="text-sm text-white/60">{highlight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
