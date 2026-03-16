// @custom — BlogKit sidebar layout
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  PenLine,
  FileText,
  LayoutTemplate,
  BarChart2,
  Tag,
  Settings,
  Menu,
  Search,
  Rss,
} from 'lucide-react'
import { Sidebar, SidebarLogo, SidebarSection, SidebarItem } from '../@system/Sidebar/Sidebar'
import { info } from '@/config'
import { cn } from '@/app/lib/@system/utils'

const NAV_ITEMS = [
  { icon: FileText,       label: 'Posts',     to: '/app/posts' },
  { icon: PenLine,        label: 'New Post',  to: '/app/editor' },
  { icon: Tag,            label: 'Tags',      to: '/app/posts?tab=tags' },
  { icon: LayoutTemplate, label: 'Themes',    to: '/app/themes' },
  { icon: BarChart2,      label: 'Analytics', to: '/app/blog-analytics' },
  { icon: Search,         label: 'SEO',       to: '/app/seo' },
  { icon: Rss,            label: 'RSS Feed',  to: '/app/posts?tab=rss', external: true },
]

/**
 * BlogLayout — sidebar layout for BlogKit management pages.
 */
export function BlogLayout({ children, className }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:opacity-90 transition-colors"
        style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      >
        <SidebarLogo name={info.name} href="/app/posts" />
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
                active={
                  location.pathname === to.split('?')[0] ||
                  (to !== '/app/posts' && location.pathname.startsWith(to.split('?')[0]))
                }
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
