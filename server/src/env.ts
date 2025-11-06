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
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed. Please check your .env file.");
}

const accessTokenExpiresIn = parsed.data.ACCESS_TOKEN_EXPIRES_IN
  ? Number.parseInt(parsed.data.ACCESS_TOKEN_EXPIRES_IN, 10)
  : 60 * 15; // 15 minutes
const refreshTokenExpiresIn = parsed.data.REFRESH_TOKEN_EXPIRES_IN
  ? Number.parseInt(parsed.data.REFRESH_TOKEN_EXPIRES_IN, 10)
  : 60 * 60 * 24 * 7; // 7 days

const parseCorsOrigin = (value?: string) => {
  if (!value) {
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
    origin: parseCorsOrigin(parsed.data.CORS_ORIGIN)
  }
};
