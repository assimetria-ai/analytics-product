// @custom — Support Product sidebar layout
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Ticket,
  BookOpen,
  MessageSquare,
  Bot,
  Users,
  Menu,
} from 'lucide-react'
import { Sidebar, SidebarLogo, SidebarSection, SidebarItem } from '../@system/Sidebar/Sidebar'
import { info } from '@/config/@system/info'
import { cn } from '@/app/lib/@system/utils'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       to: '/app/dashboard' },
  { icon: Inbox,           label: 'Inbox',            to: '/app/inbox' },
  { icon: Ticket,          label: 'Tickets',          to: '/app/tickets' },
  { icon: BookOpen,        label: 'Knowledge Base',   to: '/app/knowledge-base' },
  { icon: MessageSquare,   label: 'Chat Widget',      to: '/app/chat-widget' },
  { icon: Bot,             label: 'AI Auto-Reply',    to: '/app/ai-auto-reply' },
  { icon: Users,           label: 'Escalation',       to: '/app/escalation' },
]

export function SupportLayout({ children, className }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:opacity-90 transition-colors"
        style={{ backgroundColor: '#A855F7', color: '#fff' }}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)}>
        <SidebarLogo name={info.name} href="/app/dashboard" />
        <SidebarSection>
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
              <SidebarItem
                icon={<Icon className="h-4 w-4" />}
                label={label}
                active={
                  location.pathname === to ||
                  (to !== '/app/dashboard' && location.pathname.startsWith(to))
                }
              />
            </Link>
          ))}
        </SidebarSection>
      </Sidebar>

      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
