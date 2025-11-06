import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../server/dist/app.js");
const srcPath = path.join(__dirname, "../server/src/app.ts");

const moduleUrl = existsSync(distPath) ? pathToFileURL(distPath).href : pathToFileURL(srcPath).href;

const imported = await import(moduleUrl);

const expressApp: Express | undefined = (imported as { app?: Express; default?: Express }).app ?? imported.default;

if (!expressApp) {
  throw new Error("Failed to load Express app for serverless handler.");
}

const handler = (req: Parameters<Express["handle"]>[0], res: Parameters<Express["handle"]>[1]) => expressApp(req, res);

export const app = expressApp;
export default handler;
