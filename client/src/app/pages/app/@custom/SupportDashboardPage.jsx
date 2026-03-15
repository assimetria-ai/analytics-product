import { useState } from 'react'
import {
  Ticket, MessageSquare, Star, Clock,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  CheckCircle2, AlertCircle, User, RefreshCw,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Open Tickets',       value: 42,     change: +8.3,  icon: Ticket,       color: 'text-purple-600' },
  { label: 'Avg Response Time',  value: '4m 32s', change: -12.1, icon: Clock,       color: 'text-blue-600' },
  { label: 'CSAT Score',         value: '94.2%',  change: +1.8,  icon: Star,        color: 'text-yellow-500' },
  { label: 'Active Chats',       value: 7,      change: +16.7, icon: MessageSquare, color: 'text-green-600' },
]

const RECENT_TICKETS = [
  { id: 1042, subject: 'Cannot log in to my account',          requester: 'Alice Chen',       priority: 'high',     status: 'open',     assignee: 'Sam R.',    time: '2m ago' },
  { id: 1041, subject: 'Payment failed for subscription',       requester: 'Bob Martinez',     priority: 'critical', status: 'open',     assignee: 'Dana K.',   time: '8m ago' },
  { id: 1040, subject: 'Feature request: dark mode',            requester: 'Carla Diaz',       priority: 'low',      status: 'pending',  assignee: '—',         time: '22m ago' },
  { id: 1039, subject: 'Slow response times on mobile app',     requester: 'David Lee',        priority: 'medium',   status: 'open',     assignee: 'Sam R.',    time: '41m ago' },
  { id: 1038, subject: 'Export to CSV not working',             requester: 'Emma Wilson',      priority: 'medium',   status: 'resolved', assignee: 'Dana K.',   time: '1h ago' },
  { id: 1037, subject: 'Wrong invoice amount charged',          requester: 'Frank Nguyen',     priority: 'critical', status: 'open',     assignee: 'Sam R.',    time: '2h ago' },
  { id: 1036, subject: 'How to add team members?',              requester: 'Grace Kim',        priority: 'low',      status: 'resolved', assignee: 'Dana K.',   time: '3h ago' },
  { id: 1035, subject: 'API rate limit exceeded',               requester: 'Henry Park',       priority: 'high',     status: 'open',     assignee: '—',         time: '4h ago' },
  { id: 1034, subject: 'Notification emails not being sent',    requester: 'Isla Torres',      priority: 'high',     status: 'pending',  assignee: 'Sam R.',    time: '5h ago' },
  { id: 1033, subject: 'Dashboard charts loading blank',        requester: 'Jake Brown',       priority: 'medium',   status: 'resolved', assignee: 'Dana K.',   time: '6h ago' },
]

const ACTIVITY = [
  { hour: '00', tickets: 2 }, { hour: '02', tickets: 1 }, { hour: '04', tickets: 0 },
  { hour: '06', tickets: 3 }, { hour: '08', tickets: 8 }, { hour: '10', tickets: 14 },
  { hour: '12', tickets: 11 }, { hour: '14', tickets: 16 }, { hour: '16', tickets: 13 },
  { hour: '18', tickets: 9 }, { hour: '20', tickets: 6 }, { hour: '22', tickets: 4 },
]

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}

const STATUS_COLORS = {
  open: 'text-green-600',
  pending: 'text-yellow-600',
  resolved: 'text-blue-600',
  closed: 'text-gray-400',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, change, icon: Icon, color }) {
  const up = change >= 0
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
      <div className="flex items-center gap-1 text-xs">
        {up
          ? <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          : <ArrowDownRight className="h-3 w-3 text-red-500" />}
        <span className={up ? 'text-emerald-600' : 'text-red-600'}>
          {up ? '+' : ''}{change}%
        </span>
        <span className="text-gray-400 ml-1">vs last week</span>
      </div>
    </div>
  )
}

function ActivityChart({ data }) {
  const max = Math.max(...data.map(d => d.tickets), 1)
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map(d => (
        <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all hover:opacity-80"
            style={{
              height: `${Math.max((d.tickets / max) * 100, 4)}%`,
              backgroundColor: '#A855F7',
              opacity: d.tickets === 0 ? 0.2 : 0.8,
            }}
            title={`${d.hour}:00 — ${d.tickets} tickets`}
          />
          {[0, 6, 12, 18, 23].includes(parseInt(d.hour)) && (
            <span className="text-[9px] text-gray-400">{d.hour}h</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SupportDashboardPage() {
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <SupportLayout>
      <Header title="Support Dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Support overview for today</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Activity chart + quick summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Ticket Volume Today</h2>
              <span className="text-xs text-gray-400">By hour</span>
            </div>
            <ActivityChart data={ACTIVITY} />
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'First Reply &lt; 5min', value: '78%', icon: CheckCircle2, color: 'text-green-500' },
                { label: 'SLA Breaches Today',   value: '3',   icon: AlertCircle,   color: 'text-red-500' },
                { label: 'Agents Online',          value: '5',   icon: User,          color: 'text-blue-500' },
                { label: 'Resolved Today',         value: '31',  icon: TrendingUp,    color: 'text-purple-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    <span dangerouslySetInnerHTML={{ __html: item.label }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent tickets table */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
            <a href="/app/tickets" className="text-xs font-medium text-purple-600 hover:text-purple-700">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Requester</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Assignee</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TICKETS.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">#{t.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{t.subject}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{t.requester}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[t.priority])}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium capitalize', STATUS_COLORS[t.status])}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{t.assignee}</td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </SupportLayout>
  )
}
