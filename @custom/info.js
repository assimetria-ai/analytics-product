// @custom — Analytics Product branding configuration
// Overrides .config/info.js defaults

const GENERAL_INFO = {
  name: 'Analytics Product',
  description: 'See everything. Miss nothing. Privacy-first product analytics for SaaS founders.',
  cta: {
    title: 'Start Tracking Today',
    description: 'Join SaaS founders who own their analytics data.',
    buttonText: 'Get Started for Free',
  },
  url: 'https://analytics-product-production.up.railway.app',
  email: 'hello@analyticsproduct.com',
  supportEmail: 'support@analyticsproduct.com',
  socials: [],
  theme_color: '#1E3A5F',
  background_color: '#F0F4F8',
  links: {
    faq: 'https://analyticsproduct.com/faq',
    refer_and_earn: 'https://analyticsproduct.com/refer',
  },
  products: {
    monthly: {
      price: 49,
      description: 'Monthly Subscription',
    },
    yearly: {
      price: 397,
      description: 'Yearly Subscription',
    },
  },
  plans: [
    {
      priceId: 'price_REPLACE_ME',
      price: 0,
      yearlyPrice: 0,
      name: 'Free',
      description: 'Free Plan — 10K events/month, core analytics',
      paymentLink: '',
      noAllowedRoutes: [],
    },
    {
      priceId: 'price_REPLACE_ME',
      price: 49,
      yearlyPrice: 397,
      name: 'Pro',
      description: 'Pro Plan — Unlimited events, funnels, retention, session replay',
      paymentLink: '',
      noAllowedRoutes: [],
    },
    {
      priceId: 'price_REPLACE_ME',
      price: 199,
      yearlyPrice: 1990,
      name: 'Enterprise',
      description: 'Enterprise Plan — Dedicated support, SSO, custom integrations',
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  authMode: 'web2',
  emailProvider: 'resend',
}

module.exports = GENERAL_INFO
