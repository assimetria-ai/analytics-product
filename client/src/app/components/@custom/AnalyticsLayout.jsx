// @custom — Analytics product sidebar layout
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  Filter,
  Users,
  Bug,
  Code2,
  Key,
  Menu,
} from 'lucide-react'
import { Sidebar, SidebarLogo, SidebarSection, SidebarItem } from '../@system/Sidebar/Sidebar'
import { info } from '@/config/@system/info'
import { cn } from '@/app/lib/@system/utils'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics' },
  { icon: Filter, label: 'Funnels', to: '/app/funnels' },
  { icon: Users, label: 'Sessions', to: '/app/sessions' },
  { icon: Bug, label: 'Errors', to: '/app/errors' },
  { icon: Code2, label: 'Embed Setup', to: '/app/embed' },
  { icon: Key, label: 'API Keys', to: '/app/api-keys' },
]

/**
 * AnalyticsLayout — sidebar layout for analytics product pages
 * Replaces PageLayout to add the analytics-specific sidebar nav.
 */
export function AnalyticsLayout({ children, className }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      {/* Mobile hamburger — fixed floating button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      >
        <SidebarLogo name={info.name} href="/app/dashboard" />
        <SidebarSection>
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
            >
              <SidebarItem
                icon={<Icon className="h-4 w-4" />}
                label={label}
                active={location.pathname === to || (to !== '/app/dashboard' && location.pathname.startsWith(to))}
              />
            </Link>
          ))}
        </SidebarSection>
      </Sidebar>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
