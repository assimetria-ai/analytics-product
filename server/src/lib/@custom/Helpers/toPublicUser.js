// @custom — product-specific toPublicUser override
// Extends the base public user shape with activeBrandId for multi-brand support.

/**
 * Normalise a user DB row to the public-safe shape.
 * Adds activeBrandId (analytics-product specific).
 */
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role ?? 'user',
    emailVerified: user.emailVerified ?? (user.email_verified ?? false),
    onboardingCompleted: user.onboardingCompleted ?? (!!user.onboarding_completed),
    activeBrandId: user.activeBrandId ?? (user.active_brand_id ?? null),
  }
}

module.exports = { toPublicUser }
