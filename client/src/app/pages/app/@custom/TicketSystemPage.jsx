import { useState, useMemo } from 'react'
import { Search, Filter, Plus, X, ChevronDown } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { SupportLayout } from '../../../components/@custom/SupportLayout'
import { TicketRow } from '../../../components/@custom/TicketRow'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TICKETS = [
  { id: 1042, subject: 'Cannot log in to my account',           requester: 'Alice Chen',   channel: 'chat',   priority: 'high',     status: 'open',     assignee: 'Sam R.',  sla: 'On Track',  createdAt: '2024-03-14' },
  { id: 1041, subject: 'Payment failed for subscription',        requester: 'Bob Martinez', channel: 'email',  priority: 'critical', status: 'open',     assignee: 'Dana K.', sla: 'Warning',   createdAt: '2024-03-14' },
  { id: 1040, subject: 'Feature request: dark mode',             requester: 'Carla Diaz',   channel: 'chat',   priority: 'low',      status: 'pending',  assignee: '—',       sla: 'On Track',  createdAt: '2024-03-13' },
  { id: 1039, subject: 'Slow response times on mobile app',      requester: 'David Lee',    channel: 'social', priority: 'medium',   status: 'open',     assignee: 'Sam R.',  sla: 'On Track',  createdAt: '2024-03-13' },
  { id: 1038, subject: 'Export to CSV not working',              requester: 'Emma Wilson',  channel: 'email',  priority: 'medium',   status: 'resolved', assignee: 'Dana K.', sla: 'Met',       createdAt: '2024-03-13' },
  { id: 1037, subject: 'Wrong invoice amount charged',           requester: 'Frank Nguyen', channel: 'chat',   priority: 'critical', status: 'open',     assignee: 'Sam R.',  sla: 'Breached',  createdAt: '2024-03-12' },
  { id: 1036, subject: 'How to add team members?',               requester: 'Grace Kim',    channel: 'email',  priority: 'low',      status: 'resolved', assignee: 'Dana K.', sla: 'Met',       createdAt: '2024-03-12' },
  { id: 1035, subject: 'API rate limit exceeded',                requester: 'Henry Park',   channel: 'chat',   priority: 'high',     status: 'open',     assignee: '—',       sla: 'Warning',   createdAt: '2024-03-12' },
  { id: 1034, subject: 'Notification emails not being sent',     requester: 'Isla Torres',  channel: 'email',  priority: 'high',     status: 'pending',  assignee: 'Sam R.',  sla: 'On Track',  createdAt: '2024-03-11' },
  { id: 1033, subject: 'Dashboard charts loading blank',         requester: 'Jake Brown',   channel: 'chat',   priority: 'medium',   status: 'resolved', assignee: 'Dana K.', sla: 'Met',       createdAt: '2024-03-11' },
  { id: 1032, subject: 'Need to cancel subscription',            requester: 'Kate Murphy',  channel: 'email',  priority: 'medium',   status: 'open',     assignee: '—',       sla: 'On Track',  createdAt: '2024-03-11' },
  { id: 1031, subject: 'How to export my data?',                 requester: 'Liam Johnson', channel: 'chat',   priority: 'low',      status: 'open',     assignee: 'Sam R.',  sla: 'On Track',  createdAt: '2024-03-10' },
  { id: 1030, subject: 'Two-factor auth not sending code',       requester: 'Mia Chen',     channel: 'email',  priority: 'high',     status: 'open',     assignee: 'Dana K.', sla: 'Warning',   createdAt: '2024-03-10' },
  { id: 1029, subject: 'Integrations page shows 500 error',      requester: 'Noah Taylor',  channel: 'chat',   priority: 'medium',   status: 'pending',  assignee: 'Sam R.',  sla: 'On Track',  createdAt: '2024-03-10' },
  { id: 1028, subject: 'Incorrect data in analytics report',     requester: 'Olivia Scott', channel: 'email',  priority: 'medium',   status: 'resolved', assignee: 'Dana K.', sla: 'Met',       createdAt: '2024-03-09' },
]

const STATUS_TABS = [
  { label: 'All',      value: 'all' },
  { label: 'Open',     value: 'open' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed',   value: 'closed' },
]

const PRIORITY_OPTIONS = ['all', 'critical', 'high', 'medium', 'low']
const ASSIGNEE_OPTIONS = ['all', 'Sam R.', 'Dana K.', 'Unassigned']

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TicketSystemPage() {
  const [statusTab, setStatusTab] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const statusCounts = useMemo(() => {
    const counts = { all: TICKETS.length }
    TICKETS.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
    return counts
  }, [])

  const filtered = useMemo(() => {
    return TICKETS.filter(t => {
      if (statusTab !== 'all' && t.status !== statusTab) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (assigneeFilter === 'Unassigned' && t.assignee !== '—') return false
      if (assigneeFilter !== 'all' && assigneeFilter !== 'Unassigned' && t.assignee !== assigneeFilter) return false
      if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) &&
          !t.requester.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [statusTab, priorityFilter, assigneeFilter, search])

  return (
    <SupportLayout>
      <Header title="Tickets" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket System</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} tickets</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#A855F7' }}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-0.5 gap-0.5">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusTab(tab.value)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  statusTab === tab.value
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {tab.label}
                {statusCounts[tab.value] != null && (
                  <span className="ml-1.5 text-gray-400">{statusCounts[tab.value]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Assignee filter */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="pl-3 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none"
            >
              {ASSIGNEE_OPTIONS.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All Agents' : a}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Requester</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">SLA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">No tickets found</td>
                  </tr>
                ) : (
                  filtered.map(ticket => (
                    <TicketRow key={ticket.id} ticket={ticket} onClick={setSelected} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Ticket detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">#{selected.id}</p>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{selected.subject}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Requester', value: selected.requester },
                { label: 'Channel',   value: selected.channel },
                { label: 'Priority',  value: selected.priority },
                { label: 'Status',    value: selected.status },
                { label: 'Assignee',  value: selected.assignee || '—' },
                { label: 'SLA',       value: selected.sla },
                { label: 'Created',   value: selected.createdAt },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{value}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm rounded-lg text-white font-medium hover:opacity-90"
                style={{ backgroundColor: '#A855F7' }}
              >
                Open Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </SupportLayout>
  )
}
