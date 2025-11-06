import cookieParser from "cookie-parser";
import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";

// Ensure type definitions are included in the build
import "./types/express.js";

import { env } from "./env.js";
import authRouter from "./routes/auth.routes.js";
import onboardingRouter from "./routes/onboarding.routes.js";
import profileRouter from "./routes/profile.routes.js";
import { prisma } from "./prisma.js";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");

  // Trust proxy for Vercel serverless functions
  // This is required for req.ip to work correctly in production
  app.set("trust proxy", 1);

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

  app.get("/healthz", async (_req: Request, res: Response) => {
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

  app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ message: "API route not found." });
  });

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    console.error("=== ERROR DETAILS ===");
    console.error("Error:", err);
    console.error("Stack:", err instanceof Error ? err.stack : "No stack trace");
    console.error("Request URL:", req.url);
    console.error("Request Method:", req.method);
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

  return app;
};

export const app = createApp();
