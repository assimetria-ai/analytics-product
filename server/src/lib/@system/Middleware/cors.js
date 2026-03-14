const cors = require('cors')

const ALLOWED_ORIGINS = [
  process.env.APP_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

function isOriginAllowed(origin) {
  // Allow no-origin requests (curl, Postman, server-to-server, same-origin navigations)
  // in development and test.
  // In production, allow no-origin for non-browser clients (healthchecks use /healthz before CORS).
  // Same-origin fetch from the SPA served by this server may send no Origin header in some cases.
  if (!origin) return true

  // Exact match only — wildcard subdomain matching removed (SEC-1500: attacker-registered subdomain risk)
  if (ALLOWED_ORIGINS.includes(origin)) return true

  return false
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  maxAge: 600, // preflight cache 10 min
}

module.exports = cors(corsOptions)
