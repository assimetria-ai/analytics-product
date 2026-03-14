# Infrastructure Guide

This document describes required and optional infrastructure dependencies for the product template, their graceful degradation behavior, and common deployment pitfalls.

## Required Infrastructure

| Service | Env Var | Notes |
|---------|---------|-------|
| **PostgreSQL** | `DATABASE_URL` | Required. Server exits on startup if not set. |
| **JWT Keys** | `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` | Required. RS256 key pair for auth tokens. |

Without these, the server will not start.

## Optional Infrastructure

All optional services degrade gracefully. The server starts and serves requests with reduced functionality when they are absent.

| Service | Env Var(s) | Fallback Behavior |
|---------|------------|-------------------|
| **Redis** | `REDIS_ENABLED`, `REDIS_URL` | Rate limiting falls back to in-memory store. Set `REDIS_ENABLED=false` to skip connection entirely. |
| **Email (SMTP/SES)** | `SMTP_HOST` or `SES_FROM_EMAIL` | Transactional emails disabled. Console provider logs email content. |
| **Stripe** | `STRIPE_SECRET_KEY` | Payment routes return errors. Webhook endpoint inactive. |
| **S3** | `S3_BUCKET` | File uploads stored locally in `./uploads` (development only). |
| **OAuth** | `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` | Social login buttons hidden. Email/password auth still works. |
| **Static Assets** | `STATIC_DIR` | Client served separately (Vite dev server, CDN, etc.). |

## Redis Degradation

Redis is used for distributed rate limiting. When unavailable:

1. **`REDIS_ENABLED=false`** — Redis connection is never attempted. Rate limiters use `express-rate-limit`'s built-in in-memory store. Best for early deploys when Redis is not yet provisioned.

2. **Redis URL set but unreachable** — Connection is attempted with `lazyConnect: true` and no retry. On failure, a warning is logged and rate limiters fall back to in-memory. No startup delay.

3. **Redis connected then disconnects** — A single warning is logged on transition. Existing rate limit windows may reset (in-memory store starts fresh). No request failures.

**Recommendation:** For production with multiple replicas, provision Redis so rate limits are shared across instances. For single-instance deploys, in-memory is fine.

## CORS Configuration

### Development (NODE_ENV !== 'production')
- Localhost origins are allowed by default (ports 3000, 3001, 3005, 5173)
- Customize with `CORS_DEV_ORIGINS` (comma-separated)
- `APP_URL` is also accepted

### Production (NODE_ENV === 'production')
- Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of approved origins
- **Railway auto-detection:** If `RAILWAY_PUBLIC_DOMAIN` is set (injected by Railway), `https://{domain}` is automatically added to allowed origins
- Localhost origins are never allowed in production (enforced, throws on violation)

### Common CORS Issues
- **"CORS: Origin header required"** — A non-browser client (curl, server) hit an API route. Use health check paths (`/health`, `/ping`) for probes.
- **"CORS: Origin not allowed"** — Add the origin to `CORS_ALLOWED_ORIGINS`. On Railway, this should be automatic.
- **Analytics/third-party blocked** — Third-party scripts sending requests from their origin need that origin in the allowlist.

## Static Assets

Set `STATIC_DIR` when serving the client build from the same server (single-container deploys). The server validates at startup:

1. Directory exists
2. `index.html` is present
3. JS/CSS assets are present

Warnings are logged for each failed check but the server still starts (API routes work regardless).

**When to set:** Production Railway deploys where client and server are in the same container.
**When to leave unset:** Development (Vite dev server), or when client is deployed separately (CDN, separate service).

## Railway Deployment Checklist

1. **DATABASE_URL** — Provision PostgreSQL add-on (auto-injected)
2. **JWT keys** — Set `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in Railway variables
3. **CORS** — `RAILWAY_PUBLIC_DOMAIN` is auto-detected; no manual CORS config needed
4. **Redis** — Either provision Redis add-on or set `REDIS_ENABLED=false`
5. **CSRF_SECRET** — Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
6. **Optional:** `STRIPE_SECRET_KEY`, `SMTP_HOST`, `S3_BUCKET` as needed

## Startup Log

On boot, the server logs infrastructure status:

```
INFO: Startup: 3 optional service(s) not configured — running with reduced functionality
  disabledServices: ["Redis (rate limiting uses in-memory fallback)", "Email (transactional emails disabled)", "S3 (file uploads use local storage)"]
INFO: Infrastructure status
  infrastructure: { database: true, redis: false, email: false, stripe: true, s3: false, oauth: true, staticAssets: false }
```

This makes it immediately clear what's available after deploy.
