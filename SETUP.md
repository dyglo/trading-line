# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Generate JWT Secrets

Run the secret generator script:

```bash
npm run generate-secrets
```

This will output two secrets. Add them to your `.env` file.

### 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT Secrets (Required - Generate using: npm run generate-secrets)
JWT_ACCESS_SECRET=your_generated_access_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here

# Server Configuration (Optional)
NODE_ENV=development
PORT=4000

# Token Expiry (Optional - defaults shown)
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=604800

# Cookie Configuration (Optional)
COOKIE_SECURE=false

# CORS Configuration (Optional - defaults to http://localhost:8080)
CORS_ORIGIN=http://localhost:8080
```

### 4. Start Development Servers

You need to run both the frontend and backend servers:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

The frontend will run on `http://localhost:8080` and the backend on `http://localhost:4000`.

### 5. Verify Setup

1. Frontend should be accessible at `http://localhost:8080`
2. Backend health check: `http://localhost:4000/healthz`
3. Try logging in - authentication should work!

## Troubleshooting

### Error: "ECONNREFUSED" or "Failed to load resource"

This means the backend server is not running. Make sure you've started the backend server with `npm run dev:server` in a separate terminal.

### Error: "Environment validation failed"

This means you're missing required environment variables. Make sure your `.env` file has:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET` (at least 32 characters)
- `JWT_REFRESH_SECRET` (at least 32 characters, different from access secret)

Run `npm run generate-secrets` to generate the JWT secrets.

### Error: "500 Internal Server Error"

Check the backend server logs for detailed error messages. The improved error handling will show you exactly what's missing.

## Production Deployment (Vercel)

### Required Environment Variables in Vercel:

1. `DATABASE_URL` - Your PostgreSQL connection string
2. `JWT_ACCESS_SECRET` - Same as your local `.env`
3. `JWT_REFRESH_SECRET` - Same as your local `.env`
4. `NODE_ENV` - Set to `production`
5. `COOKIE_SECURE` - Set to `true`

### Optional Environment Variables:

- `CORS_ORIGIN` - Leave unset (will allow all origins in production)
- `COOKIE_DOMAIN` - Leave unset (correct for Vercel)
- `ACCESS_TOKEN_EXPIRES_IN` - Optional (default: 900 seconds)
- `REFRESH_TOKEN_EXPIRES_IN` - Optional (default: 604800 seconds)

## Notes

- Never commit your `.env` file to version control
- Keep your JWT secrets secure and use different secrets for production
- The backend must be running for the frontend to work locally
- In production (Vercel), the API runs as serverless functions, so you don't need to start a separate server

