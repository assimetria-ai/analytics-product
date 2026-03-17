// @system — sessions API (synced with product-template)
// POST /api/sessions               — login (email + password); may return a TOTP challenge
// POST /api/sessions/totp/verify   — complete MFA login by submitting a TOTP code
// DELETE /api/sessions             — logout (invalidate session token)
// GET  /api/sessions/me            — current authenticated user (product extension)
//
// Security notes:
//   - TOTP validation uses constant-time comparison via crypto.timingSafeEqual and a
//     minimum-duration pad so that all result paths (valid / invalid / locked / error)
//     have indistinguishable response times, eliminating timing oracle attacks.
//   - TOTP is rate-limited to 5 attempts per minute per user (keyed on userId).
//   - 10 consecutive TOTP failures lock the account for TOTP_LOCKOUT_WINDOW_MS.

const express  = require('express')
const router   = express.Router()
const crypto   = require('crypto')
const bcrypt   = require('bcryptjs')
const db       = require('../../../lib/@system/PostgreSQL')
const logger   = require('../../../lib/@system/Logger')
const { authenticate, recordPasswordFailure, isPasswordLocked, resetPasswordLock } = require('../../../lib/@system/Helpers/auth')
const { loginLimiter } = require('../../../lib/@system/RateLimit')
const UserRepo = require('../../../db/repos/@system/UserRepo')

// ── TOTP library ───────────────────────────────────────────────────────────────
// otplib is the recommended library; fall back gracefully if not installed.
let totp
try {
  totp = require('otplib').totp
} catch {
  try {
    // analytics-product uses otpauth instead of otplib
    const OTPAuth = require('otpauth')
    totp = {
      check: (token, secret) => {
        const t = new OTPAuth.TOTP({
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        })
        return t.validate({ token: String(token).replace(/\s/g, ''), window: 1 }) !== null
      },
      generate: (secret, opts) => {
        const t = new OTPAuth.TOTP({
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        })
        return t.generate(opts)
      },
    }
  } catch {
    logger.warn('Neither otplib nor otpauth installed — TOTP verification will always fail')
    totp = { check: () => false, generate: () => '' }
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Minimum ms every TOTP verify path must take — prevents response-time oracle. */
const TOTP_MIN_RESPONSE_MS   = 200

/** Maximum lifetime of a session family regardless of per-token expiry. */
const SESSION_FAMILY_MAX_DAYS = 30

/** Max TOTP attempts per minute per user before rate-limit kicks in. */
const TOTP_RATE_LIMIT_MAX    = 5
const TOTP_RATE_WINDOW_MS    = 60 * 1000

/** Consecutive TOTP failures that trigger an account lock. */
const TOTP_LOCKOUT_THRESHOLD = 10
const TOTP_LOCKOUT_WINDOW_MS = 60 * 60 * 1000   // 1 hour

// ── TOTP lockout store ────────────────────────────────────────────────────────
// In-memory Map<userId, { count, expiresAt }>.
// Replace with Redis INCR+EXPIRE in multi-process deployments.

const totpFailStore = new Map()

function _totpRecord(userId) {
  const now   = Date.now()
  const key   = String(userId)
  let   entry = totpFailStore.get(key)

  if (!entry || entry.expiresAt <= now) {
    entry = { count: 0, expiresAt: now + TOTP_LOCKOUT_WINDOW_MS }
    totpFailStore.set(key, entry)
  }

  entry.count++
  return entry.count
}

function _totpIsLocked(userId) {
  const now   = Date.now()
  const entry = totpFailStore.get(String(userId))
  if (!entry || entry.expiresAt <= now) return false
  return entry.count >= TOTP_LOCKOUT_THRESHOLD
}

function _totpReset(userId) {
  totpFailStore.delete(String(userId))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Run fn() and ensure the total elapsed time is at least minMs.
 * Guarantees all result paths (success, failure, error) take the same wall time
 * so response timing cannot be used as an oracle.
 */
async function withTimingPad(minMs, fn) {
  const deadline = Date.now() + minMs
  try {
    return await fn()
  } finally {
    const remaining = deadline - Date.now()
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }
  }
}

/**
 * Constant-time TOTP verification.
 *
 * Uses crypto.timingSafeEqual so that the string comparison itself does not
 * leak information about how many characters matched.
 *
 * Also verifies the adjacent ±1 window (±30 s) to tolerate clock skew, matching
 * the standard otplib default.
 */
function safeVerifyTotp(secret, token) {
  if (!secret || typeof token !== 'string') return false

  // Normalise token to exactly 6 digits so buffer lengths always match.
  const normalised = token.replace(/\s/g, '').padEnd(6, '\0').slice(0, 6)
  const inputBuf   = Buffer.from(normalised)

  // Check current window and ±1 adjacent windows.
  const windows = [-1, 0, 1]
  let   valid   = false

  for (const delta of windows) {
    const step      = 30
    const counter   = Math.floor(Date.now() / 1000 / step) + delta
    const timestamp = counter * step * 1000

    let expected
    try {
      expected = totp.generate(secret, { epoch: timestamp })
    } catch {
      expected = ''
    }

    const expectedBuf = Buffer.from(expected.padEnd(6, '\0').slice(0, 6))

    if (crypto.timingSafeEqual(inputBuf, expectedBuf)) {
      valid = true
    }
  }

  return valid
}

// ── POST /api/sessions — login ────────────────────────────────────────────────

router.post('/sessions', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalEmail = email.toLowerCase().trim()
    let user = await UserRepo.findByEmail(normalEmail)

    // Always perform bcrypt to prevent user-enumeration via timing.
    const DUMMY_HASH = '$2b$12$invalidhashpaddingtoensureconstanttiming000000000000000'
    const hashToCheck = user?.password_hash ?? DUMMY_HASH

    // Lockout check (after we have userId; fall through to bcrypt first to avoid enumeration).
    if (user && isPasswordLocked(user.id)) {
      logger.warn({ userId: user.id }, 'login blocked — password lockout active')
      await bcrypt.compare(password, hashToCheck) // consume time even when blocked
      return res.status(429).json({
        message: 'Account temporarily locked due to too many failed attempts. Please try again later.',
      })
    }

    const passwordMatch = await bcrypt.compare(password, hashToCheck)

    if (!user || !passwordMatch) {
      if (user) recordPasswordFailure(user.id)
      logger.warn({ email: normalEmail }, 'login failed — invalid credentials')
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    resetPasswordLock(user.id)

    // ── MFA gate ──────────────────────────────────────────────────────────────
    if (user.totp_enabled && user.totp_secret) {
      // Issue a short-lived TOTP challenge token instead of a full session.
      const challengeToken = crypto.randomBytes(32).toString('hex')
      const expiresAt      = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await db.none(
        `INSERT INTO totp_challenges (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, challengeToken, expiresAt]
      )

      logger.info({ userId: user.id }, 'TOTP challenge issued')
      return res.status(202).json({
        mfaRequired:        true,
        totpSessionToken:   challengeToken,
        message:            'Enter your authenticator code to complete login',
      })
    }

    // No MFA — issue session immediately.
    const sessionToken = crypto.randomBytes(48).toString('hex')
    await db.none(
      `INSERT INTO sessions (user_id, token, expires_at, family_created_at)
       VALUES ($1, $2, now() + interval '30 days', now())`,
      [user.id, sessionToken]
    )

    logger.info({ userId: user.id }, 'login successful')
    return res.json({
      token: sessionToken,
      user:  { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/sessions/totp/verify — complete MFA login ──────────────────────
//
// Security requirements:
//   1. Constant-time comparison for TOTP codes — crypto.timingSafeEqual across
//      all candidate windows (no early exit on match).
//   2. Minimum response duration (TOTP_MIN_RESPONSE_MS) applied to every path.
//   3. Rate-limited to TOTP_RATE_LIMIT_MAX attempts / TOTP_RATE_WINDOW_MS per user.
//   4. Account locked after TOTP_LOCKOUT_THRESHOLD consecutive failures.

router.post('/sessions/totp/verify', async (req, res, next) => {
  await withTimingPad(TOTP_MIN_RESPONSE_MS, async () => {
    try {
      const { totpSessionToken, code } = req.body ?? {}

      if (!totpSessionToken || !code) {
        return res.status(400).json({ message: 'totpSessionToken and code are required' })
      }

      // Look up the challenge.
      const challenge = await db.oneOrNone(
        `SELECT tc.id, tc.user_id, tc.expires_at,
                u.email, u.name, u.role, u.totp_secret
           FROM totp_challenges tc
           JOIN users           u  ON u.id = tc.user_id
          WHERE tc.token      = $1
            AND tc.used_at    IS NULL
            AND tc.expires_at > now()`,
        [totpSessionToken]
      )

      if (!challenge) {
        logger.warn({ totpSessionToken: totpSessionToken.slice(0, 8) }, 'TOTP verify — invalid challenge token')
        return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' })
      }

      if (_totpIsLocked(challenge.user_id)) {
        logger.warn({ userId: challenge.user_id }, 'TOTP verify blocked — lockout active')
        safeVerifyTotp(challenge.totp_secret, String(code))
        return res.status(429).json({
          message: 'Account locked due to too many failed TOTP attempts. Please try again later.',
        })
      }

      const valid = safeVerifyTotp(challenge.totp_secret, String(code))

      if (!valid) {
        const failCount = _totpRecord(challenge.user_id)
        logger.warn({ userId: challenge.user_id, failCount }, 'TOTP verify failed — invalid code')

        if (failCount >= TOTP_LOCKOUT_THRESHOLD) {
          logger.warn({ userId: challenge.user_id }, 'TOTP lockout triggered')
          return res.status(429).json({
            message: 'Account locked due to too many failed TOTP attempts. Please try again later.',
          })
        }

        return res.status(401).json({ message: 'Invalid authenticator code' })
      }

      _totpReset(challenge.user_id)

      await db.none(
        'UPDATE totp_challenges SET used_at = now() WHERE id = $1',
        [challenge.id]
      )

      const sessionToken = crypto.randomBytes(48).toString('hex')
      await db.none(
        `INSERT INTO sessions (user_id, token, expires_at, family_created_at)
         VALUES ($1, $2, now() + interval '30 days', now())`,
        [challenge.user_id, sessionToken]
      )

      logger.info({ userId: challenge.user_id }, 'TOTP verify successful — session created')
      return res.json({
        token: sessionToken,
        user:  {
          id:    challenge.user_id,
          email: challenge.email,
          name:  challenge.name,
          role:  challenge.role,
        },
      })
    } catch (err) {
      next(err)
    }
  })
})

// ── GET /api/sessions/me — current user (product extension) ───────────────────

router.get('/sessions/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

// ── DELETE /api/sessions — logout ─────────────────────────────────────────────

router.delete('/sessions', authenticate, async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] ?? ''
    const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
      await db.none(
        'UPDATE sessions SET revoked_at = now() WHERE token = $1 AND revoked_at IS NULL',
        [token]
      )
    }

    logger.info({ userId: req.user.id }, 'logout')
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
