/**
 * @custom/info.js — Letterflow Configuration
 */

const info = {
  name: 'Letterflow',
  tagline: 'Write. Land. Earn.',
  slug: 'letterflow',
  navItems: [
    { to: '/app',             label: 'Dashboard',       icon: 'LayoutDashboard' },
    { to: '/app/posts',       label: 'Newsletters',     icon: 'Mail' },
    { to: '/app/posts/new',   label: 'Compose',         icon: 'PenSquare' },
    { to: '/app/calendar',    label: 'Schedule',        icon: 'Calendar' },
    { to: '/app/analytics',   label: 'Analytics',       icon: 'BarChart3' },
    { to: '/app/templates',   label: 'Templates',       icon: 'FileText' },
    { to: '/app/hashtags',    label: 'Growth',          icon: 'TrendingUp' },
    { to: '/app/settings',    label: 'Settings',        icon: 'Settings' },
  ],
}

export default info
