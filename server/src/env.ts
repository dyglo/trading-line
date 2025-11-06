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
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || (!Number.isNaN(Number.parseInt(value, 10)) && Number.parseInt(value, 10) > 0),
      "ACCESS_TOKEN_EXPIRES_IN must be a positive integer representing seconds"
    ),
  REFRESH_TOKEN_EXPIRES_IN: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || (!Number.isNaN(Number.parseInt(value, 10)) && Number.parseInt(value, 10) > 0),
      "REFRESH_TOKEN_EXPIRES_IN must be a positive integer representing seconds"
    ),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => (value ? value.toLowerCase() === "true" : undefined)),
  COOKIE_DOMAIN: z.string().optional(),
  CORS_ORIGIN: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  console.error("=== ENVIRONMENT CONFIGURATION ERROR ===");
  console.error("Missing or invalid environment variables:");
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`  - ${key}: ${messages?.join(", ") ?? "Invalid"}`);
  });
  console.error("\nRequired environment variables:");
  console.error("  - DATABASE_URL: PostgreSQL connection string");
  console.error("  - JWT_ACCESS_SECRET: Random 32+ character string");
  console.error("  - JWT_REFRESH_SECRET: Random 32+ character string (different from access secret)");
  console.error("\nOptional environment variables:");
  console.error("  - NODE_ENV: development | production | test (default: development)");
  console.error("  - PORT: Server port (default: 4000)");
  console.error("  - ACCESS_TOKEN_EXPIRES_IN: Access token expiry in seconds (default: 900)");
  console.error("  - REFRESH_TOKEN_EXPIRES_IN: Refresh token expiry in seconds (default: 604800)");
  console.error("  - COOKIE_SECURE: true | false (default: true in production)");
  console.error("  - COOKIE_DOMAIN: Cookie domain (optional, leave unset for Vercel)");
  console.error("  - CORS_ORIGIN: Comma-separated origins or * (default: http://localhost:8080)");
  console.error("=======================================");
  throw new Error("Environment validation failed. Please check your .env file and add the missing variables.");
}

const accessTokenExpiresIn = parsed.data.ACCESS_TOKEN_EXPIRES_IN
  ? Number.parseInt(parsed.data.ACCESS_TOKEN_EXPIRES_IN, 10)
  : 60 * 15; // 15 minutes
const refreshTokenExpiresIn = parsed.data.REFRESH_TOKEN_EXPIRES_IN
  ? Number.parseInt(parsed.data.REFRESH_TOKEN_EXPIRES_IN, 10)
  : 60 * 60 * 24 * 7; // 7 days

const parseCorsOrigin = (value?: string, nodeEnv?: string) => {
  if (!value) {
    // In production, if CORS_ORIGIN is not set, allow same-origin requests
    // This works for Vercel where frontend and API share the same domain
    if (nodeEnv === "production") {
      return true as const; // Allow all origins in production if not specified (for Vercel)
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

export const env = {
  databaseUrl: parsed.data.DATABASE_URL,
  port: parsed.data.PORT ?? 4000,
  nodeEnv: parsed.data.NODE_ENV,
  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  },
  cookies: {
    secure: parsed.data.COOKIE_SECURE ?? parsed.data.NODE_ENV === "production",
    domain: parsed.data.COOKIE_DOMAIN
  },
  cors: {
    origin: parseCorsOrigin(parsed.data.CORS_ORIGIN, parsed.data.NODE_ENV)
  }
};
