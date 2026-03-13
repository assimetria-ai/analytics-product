// @custom — Analytics Product feature descriptions for landing page
// These override the template defaults in @system/FeaturesSection
import { BarChart3, Shield, Zap, Eye, Database, LineChart } from 'lucide-react'

export const customFeatures = [
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track page views, sessions, and custom events as they happen. No sampling, no delays.',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    description: 'No third-party cookies. GDPR-compliant by default. Your users\' data stays yours.',
  },
  {
    icon: Zap,
    title: 'Lightweight Script',
    description: 'Under 1KB tracking snippet. Zero impact on page load speed. Works everywhere.',
  },
  {
    icon: Eye,
    title: 'Session Replay',
    description: 'Watch how users interact with your product. Identify friction points and drop-offs.',
  },
  {
    icon: Database,
    title: 'Own Your Data',
    description: 'Self-hostable. Export anytime. No vendor lock-in. Your analytics data belongs to you.',
  },
  {
    icon: LineChart,
    title: 'Error Tracking',
    description: 'Sentry-like error monitoring built in. Catch bugs before your users report them.',
  },
]
