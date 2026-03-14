/**
 * @custom EventsPage — Event stream with search/filter, event detail, custom event creation.
 * Shows auto-captured events and custom events. POST /api/events, GET /api/events.
 */
import { useState, useCallback } from 'react'
import {
  Zap,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  Code2,
  MousePointer,
  FileText,
  ShoppingCart,
  UserPlus,
  Activity,
  X,
  Check,
  RefreshCw,
} from 'lucide-react'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Brand ────────────────────────────────────────────────────────
const C = { primary: '#4F46E5', secondary: '#0EA5E9', accent: '#8B5CF6', success: '#10B981', warning: '#F59E0B', error: '#EF4444' }

// ─── Mock data ────────────────────────────────────────────────────
const EVENT_TYPES = {
  page_view:      { label: 'Page View',       icon: FileText,      color: '#4F46E5', bg: '#eef2ff' },
  click:          { label: 'Click',           icon: MousePointer,  color: '#0EA5E9', bg: '#f0f9ff' },
  form_submit:    { label: 'Form Submit',     icon: Check,         color: '#10B981', bg: '#f0fdf4' },
  purchase:       { label: 'Purchase',        icon: ShoppingCart,  color: '#F59E0B', bg: '#fffbeb' },
  signup:         { label: 'Sign Up',         icon: UserPlus,      color: '#8B5CF6', bg: '#f5f3ff' },
  custom:         { label: 'Custom',          icon: Code2,         color: '#64748b', bg: '#f8fafc' },
}

const PATHS = ['/', '/pricing', '/blog', '/docs/quickstart', '/signup', '/login', '/blog/analytics-101', '/docs/api', '/settings', '/app/dashboard']
const USER_IDS = ['usr_1a2b3c', 'usr_4d5e6f', 'usr_7g8h9i', 'usr_j0k1l2', 'usr_m3n4o5', 'anonymous']
const COUNTRIES = ['US', 'GB', 'DE', 'CA', 'FR', 'AU', 'NL', 'BR']
const DEVICES = ['Desktop', 'Mobile', 'Tablet']
const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge']

function genEvents(count = 120) {
  const now = Date.now()
  const types = Object.keys(EVENT_TYPES)
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const ts = new Date(now - Math.floor(Math.random() * 86_400_000 * 7))
    const props = {}
    if (type === 'page_view')   { props.url = PATHS[i % PATHS.length]; props.referrer = i % 3 === 0 ? 'https://google.com' : '' }
    if (type === 'click')       { props.element = ['button#cta', 'a.nav-link', 'button.submit', '[data-id="pricing"]'][i % 4]; props.text = ['Get Started', 'View Pricing', 'Sign Up Free', 'Learn More'][i % 4] }
    if (type === 'form_submit') { props.form_id = ['signup-form', 'contact-form', 'newsletter-form'][i % 3]; props.success = Math.random() > 0.15 }
    if (type === 'purchase')    { props.amount = (Math.floor(Math.random() * 490) + 10); props.currency = 'USD'; props.plan = ['starter', 'pro', 'enterprise'][i % 3] }
    if (type === 'signup')      { props.method = ['email', 'google', 'github'][i % 3] }
    if (type === 'custom')      { props.name = ['feature_used', 'export_triggered', 'invite_sent', 'dashboard_viewed'][i % 4]; props.value = Math.floor(Math.random() * 100) }

    return {
      id:          `evt_${(i + 1000).toString(36)}`,
      type,
      user_id:     USER_IDS[i % USER_IDS.length],
      session_id:  `ses_${Math.floor(i / 3).toString(36)}`,
      timestamp:   ts.toISOString(),
      country:     COUNTRIES[i % COUNTRIES.length],
      device:      DEVICES[i % DEVICES.length],
      browser:     BROWSERS[i % BROWSERS.length],
      properties:  props,
    }
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

const MOCK_EVENTS = genEvents(120)

// ─── Helpers ──────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Event Detail Panel ───────────────────────────────────────────
function EventDetail({ event, onClose }) {
  const meta = EVENT_TYPES[event.type] || EVENT_TYPES.custom
  const Icon = meta.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md" style={{ backgroundColor: meta.bg }}>
              <Icon size={16} style={{ color: meta.color }} />
            </span>
            <span className="font-semibold text-slate-900">{meta.label}</span>
            <span className="text-xs text-slate-400 font-mono">{event.id}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Timestamp', new Date(event.timestamp).toLocaleString()],
              ['User ID', event.user_id],
              ['Session', event.session_id],
              ['Device', event.device],
              ['Browser', event.browser],
              ['Country', event.country],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                <p className="font-medium text-slate-800 font-mono text-xs">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Properties</p>
            <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto border border-slate-200">
              {JSON.stringify(event.properties, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Create Event Modal ───────────────────────────────────────────
function CreateEventModal({ onClose, onSave }) {
  const [name, setName]   = useState('')
  const [props, setProps] = useState('{\n  "key": "value"\n}')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) { setError('Event name is required'); return }
    let parsed
    try { parsed = JSON.parse(props) } catch { setError('Invalid JSON properties'); return }
    setSaving(true)
    // Mock save
    await new Promise(r => setTimeout(r, 400))
    onSave({ name: name.trim(), properties: parsed })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Track Custom Event</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Event Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. feature_activated"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 font-mono"
              style={{ focusRingColor: C.primary }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Properties (JSON)</label>
            <textarea
              value={props}
              onChange={e => setProps(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
            <p className="font-medium mb-1">SDK snippet</p>
            <code className="font-mono text-indigo-700">analytics.track('{name || 'event_name'}', {'{'} ... {'}'})</code>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: C.primary }}
          >
            {saving ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
const TYPE_FILTERS = [
  { label: 'All Events', value: '' },
  ...Object.entries(EVENT_TYPES).map(([v, m]) => ({ label: m.label, value: v })),
]

export function EventsPage() {
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('')
  const [selectedEvent, setSelected]  = useState(null)
  const [showCreate, setShowCreate]   = useState(false)
  const [events, setEvents]           = useState(MOCK_EVENTS)
  const [expanded, setExpanded]       = useState({})

  const filtered = events.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        e.type.includes(q) ||
        e.user_id.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        JSON.stringify(e.properties).toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleSave = useCallback((data) => {
    const newEvt = {
      id: `evt_new${Date.now().toString(36)}`,
      type: 'custom',
      user_id: 'usr_current',
      session_id: 'ses_current',
      timestamp: new Date().toISOString(),
      country: 'US',
      device: 'Desktop',
      browser: 'Chrome',
      properties: { name: data.name, ...data.properties },
    }
    setEvents(prev => [newEvt, ...prev])
  }, [])

  // Event type counts for quick stats
  const counts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})

  return (
    <AnalyticsLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap size={22} style={{ color: C.primary }} />
              Events
            </h1>
            <p className="text-sm text-slate-500 mt-1">Auto-captured + custom events from your users</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ backgroundColor: C.primary }}
          >
            <Plus size={14} />
            Track Event
          </button>
        </div>

        {/* Event type stat pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_TYPES).map(([type, meta]) => {
            const Icon = meta.icon
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  typeFilter === type ? 'border-transparent text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
                style={typeFilter === type ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
              >
                <Icon size={12} />
                {meta.label}
                <span className={cn('ml-1 font-mono', typeFilter === type ? 'text-white/80' : 'text-slate-400')}>
                  {(counts[type] || 0).toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, event type, property..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
            />
          </div>
          <p className="text-sm text-slate-500 whitespace-nowrap">
            {filtered.length.toLocaleString()} events
          </p>
        </div>

        {/* Event table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Device</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((event) => {
                const meta = EVENT_TYPES[event.type] || EVENT_TYPES.custom
                const Icon = meta.icon
                const isExpanded = expanded[event.id]
                return (
                  <>
                    <tr
                      key={event.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                    >
                      <td className="px-4 py-3">
                        <span className="p-1 rounded" style={{ backgroundColor: meta.bg }}>
                          <Icon size={12} style={{ color: meta.color }} />
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{meta.label}</span>
                        {event.properties.url && (
                          <span className="ml-2 text-xs text-slate-400 font-mono">{event.properties.url}</span>
                        )}
                        {event.properties.name && (
                          <span className="ml-2 text-xs text-slate-400 font-mono">{event.properties.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs font-mono text-slate-500">{event.user_id}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">{event.device} · {event.browser}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400">{timeAgo(event.timestamp)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(event) }}
                          className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${event.id}-expanded`} className="bg-slate-50 border-b border-slate-100">
                        <td colSpan={6} className="px-4 py-3">
                          <pre className="text-xs font-mono text-slate-600 bg-white rounded border border-slate-200 p-3 overflow-x-auto">
                            {JSON.stringify(event.properties, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Activity size={32} className="mb-3" />
              <p className="text-sm font-medium">No events found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {filtered.length > 50 && (
          <p className="text-xs text-slate-400 text-center">Showing 50 of {filtered.length.toLocaleString()} events</p>
        )}
      </div>

      {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelected(null)} />}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSave={handleSave} />}
    </AnalyticsLayout>
  )
}

export default EventsPage
