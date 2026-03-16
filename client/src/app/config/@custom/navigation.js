/**
 * @custom Analytics Product — Navigation configuration
 * Defines sidebar navigation items for the analytics dashboard.
 */
import {
  LayoutDashboard,
  BarChart3,
  MousePointerClick,
  Filter,
  AlertTriangle,
  Users,
  Code,
  Settings,
  CreditCard,
  Key,
} from 'lucide-react'

export const ANALYTICS_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app' },
  { icon: BarChart3,       label: 'Analytics',       to: '/app/analytics' },
  { icon: MousePointerClick, label: 'Events',        to: '/app/analytics/engagement' },
  { icon: Filter,          label: 'Funnels',          to: '/app/funnels' },
  { icon: AlertTriangle,   label: 'Error Tracking',   to: '/app/errors' },
  { icon: Users,           label: 'Sessions',         to: '/app/sessions' },
  { icon: Code,            label: 'Embed Script',     to: '/app/embed' },
  { icon: Key,             label: 'API Keys',         to: '/app/api-keys' },
  { icon: CreditCard,      label: 'Billing',          to: '/app/billing' },
  { icon: Settings,        label: 'Settings',         to: '/app/settings' },
]
