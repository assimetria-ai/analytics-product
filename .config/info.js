// Central product config — shared source of truth for both client and server
// @system — do not modify this file directly; override values in config/@custom/

let GENERAL_INFO = {
  name: 'Analytics Product',
  description: 'See everything. Miss nothing. Privacy-first product analytics for SaaS founders.',
  cta: {
    title: 'Start Tracking Today',
    description: 'Join SaaS founders who own their analytics data.',
    buttonText: 'Get Started for Free',
  },
  url: 'https://analytics-product-production.up.railway.app',
  email: 'support@assimetria.com',
  supportEmail: 'support@assimetria.com',
  socials: [],
  theme_color: '#1E3A5F',
  background_color: '#f7f6fe',
  links: {
    faq: 'https://analytics-product-production.up.railway.app/docs',
    refer_and_earn: 'https://analytics-product-production.up.railway.app/refer-and-earn',
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
      price: 49,
      yearlyPrice: 397,
      name: 'Pro',
      description: 'Pro Plan',
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  authMode: 'web2', // Options: 'web2' (email/password) or 'web3' (wallet)
}

module.exports = GENERAL_INFO
