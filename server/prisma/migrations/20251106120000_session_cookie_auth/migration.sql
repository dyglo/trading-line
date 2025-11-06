-- Session cookie migration: replace refresh tokens with hashed session token records

DROP INDEX IF EXISTS "Session_refreshToken_key";

ALTER TABLE "Session"
    ADD COLUMN "tokenHash" TEXT NOT NULL,
    ADD COLUMN "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DROP COLUMN "refreshToken";

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
