const cors = require('cors')

const ALLOWED_ORIGINS = [
  process.env.APP_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN && `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
  process.env.RAILWAY_STATIC_URL,
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
  // Also handle the string 'undefined' — some CDN edge proxies (Fastly/Varnish) may
  // serialise a missing Origin header as the literal string 'undefined'.
  if (!origin || origin === 'undefined') return true

  // Exact match only — wildcard subdomain matching removed (SEC-1500: attacker-registered subdomain risk)
  if (ALLOWED_ORIGINS.includes(origin)) return true

  return false
}

<<<<<<< HEAD
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
=======
/**
 * Custom CORS middleware that wraps the `cors` package but handles rejections
 * inline (returning 403 directly) instead of passing an Error to next().
 *
 * The cors package calls next(err) on rejection, but Express error handlers
 * sometimes lose err.status and default to 500. By responding directly we
 * guarantee a clean 403 with the correct JSON body.
 */
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin

  // Fast path: origin allowed — delegate to cors package for header setting
  if (isOriginAllowed(origin)) {
    return cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
      exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
      maxAge: 600,
    })(req, res, next)
  }

  // Rejection: respond directly with 403 — never pass to next(err)
  res.status(403).json({ message: `CORS: origin '${origin}' not allowed` })
>>>>>>> b5c993f733f2c8d639b6d7226334d941846b974b
}

module.exports = corsMiddleware
