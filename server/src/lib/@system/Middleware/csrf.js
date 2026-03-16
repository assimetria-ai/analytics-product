const { doubleCsrf } = require('csrf-csrf')

/**
 * CSRF protection middleware using double-submit cookie pattern.
 *
 * This middleware protects against Cross-Site Request Forgery attacks by:
 * 1. Generating a CSRF token stored in an httpOnly cookie
 * 2. Requiring clients to send this token in a custom header (X-CSRF-Token)
 * 3. Validating that both values match before processing state-changing requests
 *
 * The middleware automatically handles GET, HEAD, and OPTIONS requests as safe
 * and only validates tokens for POST, PUT, PATCH, DELETE requests.
 *
 * Usage:
 *   - Add csrfProtection middleware to routes that need CSRF protection
 *   - Expose generateCsrfToken() via a GET endpoint so clients can fetch the token
 *   - Clients must include the token in the X-CSRF-Token header for protected requests
 */
const {
  generateCsrfToken: _generateCsrfToken, // Generate a new CSRF token
  doubleCsrfProtection                    // Middleware to validate CSRF tokens
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true, // Prevent JavaScript access to the cookie
  },
  size: 64, // Token size in bytes
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Safe methods that don't need CSRF protection
  getTokenFromRequest: (req) => req.headers['x-csrf-token'], // Custom header for the token
  getSessionIdentifier: (req) => {
    // Use session ID if available, otherwise fall back to a default empty string
    // This is safe because CSRF protection relies on the double-submit cookie pattern,
    // not on session identification
    return req.sessionID || req.session?.id || ''
  },
})

/**
 * Routes exempt from CSRF validation.
 * Auth routes (register/login/forgot-password) are called before the client
 * has a session, so CSRF protection doesn't apply — there's no cookie to steal.
 * Webhook routes receive server-to-server calls that can't carry CSRF tokens.
 */
/**
 * Paths exempt from CSRF validation (prefix match via startsWith).
 */
const CSRF_EXEMPT_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
  '/api/sessions',
  '/api/sessions/refresh',
  '/api/sessions/register',
  '/api/users/password/request',
  '/api/users/password/reset',
  '/api/users/email/verify',
  '/api/webhook',
  '/api/stripe/webhook',
  '/api/payments/webhook',
]

/**
 * Paths exempt only when matched exactly (not as prefix).
 * Used for endpoints like POST /api/users (registration) where /api/users/me
 * and other sub-paths still require CSRF protection.
 */
const CSRF_EXEMPT_EXACT = [
  '/api/users',
]

/**
 * CSRF protection middleware that validates tokens on state-changing requests
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF validation in test/development environments if needed
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_CSRF === 'true') {
    return next()
  }

  // Skip CSRF for auth and webhook routes (no session to protect)
  // Check both full path (app-level mount) and stripped path (router-level mount)
  const fullPath = (req.originalUrl || req.path).split('?')[0]
  const routerPath = req.path.split('?')[0]
  if (CSRF_EXEMPT_PATHS.some(p => fullPath.startsWith(p) || routerPath.startsWith(p) || routerPath.startsWith(p.replace('/api', '')))) {
    return next()
  }
  // Exact-match exemptions (e.g. POST /api/users but NOT /api/users/me)
  if (CSRF_EXEMPT_EXACT.some(p => fullPath === p || routerPath === p || routerPath === p.replace('/api', ''))) {
    return next()
  }

  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or missing CSRF token',
        error: 'CSRF_VALIDATION_FAILED'
      })
    }
    next()
  })
}

/**
 * Middleware to generate and expose CSRF token to clients
 * Mount this on a GET endpoint (e.g., GET /api/csrf-token)
 */
const generateCsrfToken = (req, res) => {
  const token = _generateCsrfToken(req, res)
  res.json({ csrfToken: token })
}

/**
 * Export generateToken as an alias for compatibility
 */
const generateToken = _generateCsrfToken

module.exports = {
  csrfProtection,
  generateCsrfToken,
  generateToken,
}
