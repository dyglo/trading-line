-- DropIndex
DROP INDEX IF EXISTS "UserOnboardingResponse_userId_questionId_key";

-- CreateIndex
CREATE INDEX "UserOnboardingResponse_userId_questionId_idx" ON "UserOnboardingResponse"("userId", "questionId");
