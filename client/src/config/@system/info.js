// @system — product identity config
// Base defaults; @custom/info.js overrides these per-product
import { customInfo } from '../@custom/info'

const defaults = {
  name: 'ProductTemplate',
  tagline: 'Your product tagline here',
  url: import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
  supportEmail: 'support@example.com',
}

export const info = { ...defaults, ...customInfo }
