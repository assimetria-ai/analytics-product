// @custom — product-specific server config override for Analytics Product
// Merge/override values from @system/info.js here.
// This file is NEVER overwritten during template sync.

const systemInfo = require('../@system/info')

const customInfo = {
  name: 'Analytics Product',
  tagline: 'See everything. Miss nothing.',
  url: process.env.APP_URL ?? 'https://analytics-product-production.up.railway.app',
  supportEmail: 'support@assimetria.com',
  description: 'Product analytics platform — privacy-first, zero setup, own your data.',
}

module.exports = { ...systemInfo, ...customInfo }
