/**
 * @custom/info.js — Analytics Product Configuration
 */

const info = {
  name: 'Analytics Product',
  tagline: 'See everything. Miss nothing.',
  slug: 'analytics-product',
  navItems: [
    { to: '/dashboard',      label: 'Dashboard',      icon: 'LayoutDashboard' },
    { to: '/embed-script',   label: 'Embed Script',   icon: 'Code' },
    { to: '/events',         label: 'Event Tracking',  icon: 'Activity' },
    { to: '/funnels',        label: 'Funnels',         icon: 'Filter' },
    { to: '/errors',         label: 'Error Tracking',  icon: 'AlertTriangle' },
    { to: '/sessions',       label: 'User Sessions',   icon: 'Users' },
    { to: '/api',            label: 'API Access',      icon: 'Key' },
    { to: '/settings',       label: 'Settings',        icon: 'Settings' },
  ],
}

export default info
