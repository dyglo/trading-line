import cookieParser from "cookie-parser";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";

import { env } from "./env.js";
import authRouter from "./routes/auth.routes.js";
import onboardingRouter from "./routes/onboarding.routes.js";
import profileRouter from "./routes/profile.routes.js";
import { prisma } from "./prisma.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.cors.origin,
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/healthz", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    res.status(503).json({ status: "error", error: (error as Error).message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/onboarding", onboardingRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("=== ERROR DETAILS ===");
  console.error("Error:", err);
  console.error("Stack:", err instanceof Error ? err.stack : "No stack trace");
  console.error("Request URL:", _req.url);
  console.error("Request Method:", _req.method);
  console.error("===================");
  
  const status = typeof (err as { statusCode?: number }).statusCode === "number" ? (err as { statusCode: number }).statusCode : 500;
  const message =
    status >= 500
      ? "An unexpected error occurred. Please try again later."
      : (err as Error).message || "Request failed.";

  const details = (err as { details?: unknown }).details;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && err instanceof Error ? { error: err.message, stack: err.stack } : undefined),
    ...(details ? { details } : undefined)
  });
});

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      console.log(`API server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start API server", error);
    process.exit(1);
  }
};

start();
