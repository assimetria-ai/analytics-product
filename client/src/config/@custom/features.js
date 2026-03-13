// @custom — Analytics Product feature definitions for the landing page
import { BarChart3, Shield, Zap, Database, Globe, Activity } from 'lucide-react'

export const ANALYTICS_FEATURES = [
  {
    icon: BarChart3,
    title: 'Real-Time Dashboards',
    description: 'Track page views, sessions, and custom events as they happen — no waiting for batch processing.',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'No third-party cookies. No cross-site tracking. GDPR-compliant by default — own your data completely.',
  },
  {
    icon: Zap,
    title: 'Lightweight Script',
    description: 'Under 1 KB tracking snippet that loads async. Zero impact on your Core Web Vitals or page speed.',
  },
  {
    icon: Activity,
    title: 'Error Tracking',
    description: 'Sentry-like error monitoring built in. Catch exceptions, trace stack frames, and get alerted instantly.',
  },
  {
    icon: Database,
    title: 'Self-Hosted Option',
    description: 'Run on your own infra or use our cloud. Your data never leaves your control.',
  },
  {
    icon: Globe,
    title: 'Multi-Product Support',
    description: 'Track unlimited products from a single dashboard. Perfect for SaaS portfolios and agencies.',
  },
]

export const FEATURES_HEADING = 'Everything you need to understand your users'
export const FEATURES_SUBHEADING = 'Privacy-first analytics with zero setup — built for modern SaaS teams.'
