# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Server Configuration (Optional)
NODE_ENV=development
PORT=4000

# Session Settings (Optional - defaults shown)
SESSION_TOKEN_TTL_DAYS=30
SESSION_COOKIE_NAME=tline_session_token

# Cookie Configuration (Optional)
COOKIE_SECURE=false
# COOKIE_DOMAIN=

# CORS Configuration (Optional - defaults to http://localhost:8080)
CORS_ORIGIN=http://localhost:8080
```

### 3. Start Development Servers

Run the single dev command, which now starts both Vite and the API server together:

```bash
npm run dev
```

The frontend will be available on `http://localhost:8080` and the API on `http://localhost:4000` (proxied automatically).

### 4. Verify Setup

1. Frontend should be accessible at `http://localhost:8080`
2. Backend health check: `http://localhost:4000/healthz`
3. Try logging in - authentication should work!

## Troubleshooting

### Error: "ECONNREFUSED" or "Failed to load resource"

This means the backend server is not running. Make sure you've started the backend server with `npm run dev:server` in a separate terminal.

### Error: "Environment validation failed"

This means you're missing required environment variables. Make sure your `.env` file has at least:
- `DATABASE_URL`

### Error: "500 Internal Server Error"

Check the backend server logs for detailed error messages. The improved error handling will show you exactly what's missing.

## Production Deployment (Vercel)

### Required Environment Variables in Vercel:

1. `DATABASE_URL` - Your PostgreSQL connection string (Render, Neon, Supabase, etc.)
2. `NODE_ENV` - Set to `production`
3. `COOKIE_SECURE` - Set to `true`

### Optional Environment Variables:

- `CORS_ORIGIN` - Leave unset (will allow all origins in production)
- `COOKIE_DOMAIN` - Leave unset (correct for Vercel)
- `SESSION_TOKEN_TTL_DAYS` - Optional (default: 30 days)
- `SESSION_COOKIE_NAME` - Optional (default: `tline_session_token`)

## Notes

- Never commit your `.env` file to version control
- You no longer need to manage JWT secrets—the API issues hashed, database-backed session cookies automatically
- The backend must be running for the frontend to work locally
- In production (Vercel), the API runs as serverless functions, so you don't need to start a separate server

