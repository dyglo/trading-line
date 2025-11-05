-- CreateIndex
CREATE UNIQUE INDEX "OnboardingOption_questionId_value_key" ON "OnboardingOption"("questionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingQuestion_prompt_key" ON "OnboardingQuestion"("prompt");
