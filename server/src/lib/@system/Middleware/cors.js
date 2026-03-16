// @system CORS middleware — fixed 2026-03-16 (task #13210)
// Uses cors package callback pattern with explicit err.status = 403 on rejection.
// Matches blogkit/letterflow pattern which returns proper status codes in production.
const cors = require('cors')

const ALLOWED_ORIGINS = [
  process.env.APP_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

function isOriginAllowed(origin) {
  // Requests without an Origin header are NOT cross-origin browser requests — they come
  // from curl, Postman, server-to-server calls, or same-origin navigation. The browser
  // always sends an Origin header on cross-origin requests, so absence of Origin means
  // CORS enforcement doesn't apply. Allow these in all environments.
  // Production healthchecks still use /healthz (registered before CORS middleware).
  //
  // Also handle the string 'undefined' / 'null' — Railway CDN edge proxies (Fastly/Varnish)
  // may serialise a missing Origin header as the literal string 'undefined'.
  if (!origin || origin === 'undefined' || origin === 'null') return true

  // Exact match only — wildcard subdomain matching removed (SEC-1500: attacker-registered subdomain risk)
  if (ALLOWED_ORIGINS.includes(origin)) return true

  return false
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      const err = new Error(`CORS: origin '${origin}' not allowed`)
      err.status = 403
      callback(err)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  maxAge: 600, // preflight cache 10 min
}

module.exports = cors(corsOptions)
