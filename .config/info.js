// Central product config — shared source of truth for both client and server
// @custom — Analytics Product branding

let GENERAL_INFO = {
  name: 'Analytics Product',
  description: 'See everything. Miss nothing. Product analytics platform — privacy-first, zero setup, own your data.',
  cta: {
    title: 'Start Tracking',
    description: 'Join teams who ship better products with data-driven insights.',
    buttonText: 'Get Started for Free',
  },
  url: 'https://analytics-product-production.up.railway.app',
  email: 'support@assimetria.com',
  supportEmail: 'support@assimetria.com',
  socials: [],
  theme_color: '#6b7280',
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
  authMode: 'web2',
}

module.exports = GENERAL_INFO
