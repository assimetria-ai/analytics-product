// @custom — product-specific config override
// Override any values from @system/info.js here.
// This file is NEVER overwritten during template sync.

export const customInfo = {
  name: 'Analytics Product',
  tagline: 'See everything. Miss nothing.',
  url: import.meta.env.VITE_APP_URL ?? 'https://analytics-product-production.up.railway.app',
  supportEmail: 'support@assimetria.com',
}
