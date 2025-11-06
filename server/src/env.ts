import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

// Load environment variables from the current working directory first
config();

// Fallback to the project root .env when running from the server workspace
if (!process.env.DATABASE_URL) {
  const rootEnvPath = path.resolve(process.cwd(), "..", ".env");
  config({ path: rootEnvPath });
}

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid database connection URL"),
  PORT: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value > 0),
      "PORT must be a positive integer when provided"
    ),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SESSION_COOKIE_NAME: z
    .string()
    .optional()
    .refine((value) => (value ? value.trim().length > 0 : true), "SESSION_COOKIE_NAME cannot be empty"),
  SESSION_TOKEN_TTL_DAYS: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || (!Number.isNaN(Number.parseInt(value, 10)) && Number.parseInt(value, 10) > 0),
      "SESSION_TOKEN_TTL_DAYS must be a positive integer"
    ),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }
      const normalized = value.toLowerCase();
      return normalized === "true" || normalized === "1";
    }),
  COOKIE_DOMAIN: z.string().optional(),
  CORS_ORIGIN: z.string().optional()
});

const parsed = envSchema.safeParse({
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? process.env.VITE_NODE_ENV ?? "development"
});

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error("=== ENVIRONMENT CONFIGURATION ERROR ===");
  console.error("Missing or invalid environment variables:");
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`  - ${key}: ${messages?.join(", ") ?? "Invalid"}`);
  });
  console.error("\nRequired environment variables:");
  console.error("  - DATABASE_URL: PostgreSQL connection string");
  console.error("\nOptional environment variables:");
  console.error("  - NODE_ENV: development | production | test (default: development)");
  console.error("  - PORT: Server port (default: 4000)");
  console.error("  - SESSION_COOKIE_NAME: Custom session cookie name (default: tline_session_token)");
  console.error("  - SESSION_TOKEN_TTL_DAYS: Session lifetime in days (default: 30)");
  console.error("  - COOKIE_SECURE: true | false (default: true in production)");
  console.error("  - COOKIE_DOMAIN: Cookie domain (optional, leave unset for Vercel)");
  console.error("  - CORS_ORIGIN: Comma-separated origins or * (default: http://localhost:8080 in dev)");
  console.error("=======================================");
  throw new Error("Environment validation failed. Please check your .env file and add the missing variables.");
}

const parseCorsOrigin = (value?: string, nodeEnv?: string) => {
  if (!value) {
    // In production, allow same-origin requests by default so Vercel works without extra config.
    if (nodeEnv === "production") {
      return true as const;
    }
    return ["http://localhost:8080"];
  }

  if (value.trim() === "*") {
    return true as const;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const sessionTtlDays = parsed.data.SESSION_TOKEN_TTL_DAYS
  ? Number.parseInt(parsed.data.SESSION_TOKEN_TTL_DAYS, 10)
  : 30;
const sessionTtlMs = sessionTtlDays * 24 * 60 * 60 * 1000;

export const env = {
  databaseUrl: parsed.data.DATABASE_URL,
  port: parsed.data.PORT ?? 4000,
  nodeEnv: parsed.data.NODE_ENV,
  cookies: {
    secure: parsed.data.COOKIE_SECURE ?? parsed.data.NODE_ENV === "production",
    domain: parsed.data.COOKIE_DOMAIN
  },
  session: {
    cookieName: parsed.data.SESSION_COOKIE_NAME ?? "tline_session_token",
    ttlMs: sessionTtlMs,
    ttlSeconds: Math.floor(sessionTtlMs / 1000)
  },
  cors: {
    origin: parseCorsOrigin(parsed.data.CORS_ORIGIN, parsed.data.NODE_ENV)
  }
};
