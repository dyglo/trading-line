# Debugging Login 500 Error

## Common Causes

The 500 Internal Server Error on login is usually caused by one of these issues:

### 1. Missing Environment Variables

Check that your `.env` file (in `project/server/` or project root) contains:

```env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="your-secret-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-secret-at-least-32-characters-long"
```

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Must be at least 32 characters
- `JWT_REFRESH_SECRET` - Must be at least 32 characters

**Optional variables:**
- `ACCESS_TOKEN_EXPIRES_IN` - Default: 900 (15 minutes)
- `REFRESH_TOKEN_EXPIRES_IN` - Default: 604800 (7 days)
- `CORS_ORIGIN` - Default: http://localhost:8080
- `PORT` - Default: 4000

### 2. Database Connection Issues

Test your database connection:
```bash
cd project/server
npm run dev
```

Check the server logs for connection errors. You should see:
```
API server listening on http://localhost:4000
```

If you see database connection errors, verify:
- `DATABASE_URL` is correct
- Database server is running
- Network/firewall allows connection

### 3. Check Server Logs

After starting the server, try logging in again and check the console output. You should now see detailed error information like:

```
=== ERROR DETAILS ===
Error: ...
Stack: ...
Request URL: /api/auth/login
Request Method: POST
===================
```

### 4. Verify Environment File Location

The server looks for `.env` in this order:
1. `project/server/.env`
2. `project/.env` (project root)

Make sure your `.env` file is in one of these locations.

### 5. Generate JWT Secrets

If you need to generate secure JWT secrets:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

## Testing the Fix

1. Make sure the server is running:
   ```bash
   cd project/server
   npm run dev
   ```

2. Check the health endpoint:
   ```bash
   curl http://localhost:4000/healthz
   ```
   Should return: `{"status":"ok"}`

3. Try logging in again and check the server console for detailed error messages.

## Next Steps

If you still get errors after checking the above:
1. Share the error details from the server console
2. Verify your `.env` file has all required variables
3. Check that the database is accessible and migrations are applied

