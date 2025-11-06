import { createServer } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Express } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load the built version first, fallback to TypeScript source
const distPath = path.join(__dirname, '../server/dist/app.js');
const srcPath = path.join(__dirname, '../server/src/app.ts');
const appPath = existsSync(distPath) ? distPath : srcPath;

// Import the app module
const appModule = await import(appPath);

// Get the Express app (supports both default and named exports)
const expressApp: Express = appModule.app || appModule.default;

if (!expressApp) {
  throw new Error('Failed to load Express app. Ensure your app is properly exported.');
}

// Create HTTP server for Vercel
const server = createServer(expressApp);

// Vercel serverless function handler
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Set request start time for logging
  const start = Date.now();
  
  // Log incoming requests in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  
  // Handle the request with Express
  expressApp(req, res);
  
  // Log completed requests
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
}

// Export the Express app for direct usage
export const app = expressApp;
