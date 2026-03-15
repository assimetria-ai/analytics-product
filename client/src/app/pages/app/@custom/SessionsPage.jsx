/**
 * @custom SessionsPage — User session replay & journey explorer
 * Browse recorded sessions, inspect page-by-page journeys, view heatmap placeholders.
 * Filter by date range, country, and device type.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Video,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Filter,
  Search,
  ChevronRight,
  X,
  MapPin,
  MousePointer2,
  ArrowRight,
  RefreshCw,
  LayoutGrid,
  Play,
} from 'lucide-react'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Brand ────────────────────────────────────────────────────────
const C = {
  primary:   '#4F46E5',
  secondary: '#0EA5E9',
  accent:    '#8B5CF6',
  success:   '#10B981',
  warning:   '#F59E0B',
  error:     '#EF4444',
  bgLight:   '#F8FAFC',
  textDark:  '#1E293B',
}

// ─── Mock data generators ─────────────────────────────────────────
const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
]

const DEVICES = ['Desktop', 'Mobile', 'Tablet']
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge']

const PAGE_PATHS = [
  { path: '/', title: 'Home', duration: 42 },
  { path: '/pricing', title: 'Pricing', duration: 87 },
  { path: '/blog', title: 'Blog', duration: 124 },
  { path: '/docs', title: 'Documentation', duration: 210 },
  { path: '/about', title: 'About Us', duration: 38 },
  { path: '/blog/analytics-101', title: 'Analytics 101', duration: 195 },
  { path: '/login', title: 'Login', duration: 28 },
  { path: '/signup', title: 'Sign Up', duration: 55 },
  { path: '/features', title: 'Features', duration: 96 },
  { path: '/contact', title: 'Contact', duration: 43 },
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function genJourney(pageCount) {
  const pages = []
  const shuffled = [...PAGE_PATHS].sort(() => Math.random() - 0.5).slice(0, pageCount)
  shuffled.forEach((p, i) => {
    pages.push({
      ...p,
      order: i + 1,
      duration: p.duration + Math.floor(Math.random() * 60 - 20),
      scroll_depth: Math.floor(30 + Math.random() * 65),
      clicks: Math.floor(Math.random() * 8),
    })
  })
  return pages
}

function genSessions(count = 60) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const country = randomItem(COUNTRIES)
    const device = randomItem(DEVICES)
    const pageCount = Math.floor(1 + Math.random() * 7)
    const duration = Math.floor(30 + Math.random() * 480)
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const startedAt = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000)
    return {
      id: `sess_${(i + 1).toString().padStart(4, '0')}`,
      visitor_id: `visitor_${Math.floor(Math.random() * 9000 + 1000)}`,
      started_at: startedAt,
      duration,
      pages_count: pageCount,
      entry_page: PAGE_PATHS[Math.floor(Math.random() * 3)].path,
      exit_page: randomItem(PAGE_PATHS).path,
      country: country.name,
      flag: country.flag,
      country_code: country.code,
      device,
      browser: randomItem(BROWSERS),
      is_bounce: pageCount === 1,
      journey: genJourney(pageCount),
    }
  })
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const DeviceIcon = ({ device, size = 14 }) => {
  if (device === 'Mobile') return <Smartphone size={size} />
  if (device === 'Tablet') return <Tablet size={size} />
  return <Monitor size={size} />
}

// ─── Component ────────────────────────────────────────────────────
export { SessionsPage }
export default function SessionsPage() {
  const [sessions, setSessions]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [selected, setSelected]         = useState(null)
  const [search, setSearch]             = useState('')
  const [filterDevice, setFilterDevice] = useState('All')
  const [filterCountry, setFilterCountry] = useState('All')
  const [heatmapPage, setHeatmapPage]   = useState(null)

  const loadData = useCallback(() => {
    setSessions(genSessions(60))
  }, [])

  useEffect(() => {
    loadData()
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [loadData])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadData()
    setTimeout(() => setRefreshing(false), 700)
  }, [loadData])

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.visitor_id.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
    const matchDevice = filterDevice === 'All' || s.device === filterDevice
    const matchCountry = filterCountry === 'All' || s.country === filterCountry
    return matchSearch && matchDevice && matchCountry
  })

  const uniqueCountries = [...new Set(sessions.map((s) => s.country))]

  const stats = {
    total: sessions.length,
    bounces: sessions.filter((s) => s.is_bounce).length,
    avgDuration: sessions.length
      ? Math.round(sessions.reduce((a, s) => a + s.duration, 0) / sessions.length)
      : 0,
    avgPages: sessions.length
      ? (sessions.reduce((a, s) => a + s.pages_count, 0) / sessions.length).toFixed(1)
      : 0,
  }

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.textDark }}>Sessions</h1>
            <p className="text-sm text-slate-500 mt-1">Browse user journeys and session replays — Last 7 days</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Sessions"  value={stats.total.toLocaleString()}          icon={Video}        />
            <StatCard label="Bounce Rate"     value={`${Math.round((stats.bounces / stats.total) * 100)}%`} icon={ArrowRight}   />
            <StatCard label="Avg. Duration"   value={formatDuration(stats.avgDuration)}      icon={Clock}        />
            <StatCard label="Avg. Pages"      value={stats.avgPages}                         icon={LayoutGrid}   />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="All">All Devices</option>
              {DEVICES.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="All">All Countries</option>
              {uniqueCountries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} sessions</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Session list */}
          <div className="lg:col-span-2 space-y-2">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-24" />
                        <div className="h-3 bg-slate-200 rounded w-40" />
                      </div>
                    </div>
                  </div>
                ))
              : filtered.slice(0, 30).map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    isSelected={selected?.id === s.id}
                    onClick={() => { setSelected(s); setHeatmapPage(null) }}
                  />
                ))
            }
            {!loading && filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No sessions match your filters</div>
            )}
          </div>

          {/* Session detail panel */}
          <div className="lg:col-span-3">
            {selected ? (
              <SessionDetail
                session={selected}
                heatmapPage={heatmapPage}
                setHeatmapPage={setHeatmapPage}
                onClose={() => setSelected(null)}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center h-64">
                <Play size={28} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Select a session to view its journey</p>
                <p className="text-sm text-slate-400 mt-1">Click any session on the left to explore page-by-page details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnalyticsLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#eef2ff' }}>
          <Icon size={14} style={{ color: C.primary }} />
        </div>
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

function SessionRow({ session: s, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm',
        isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: C.primary }}
        >
          {s.visitor_id.slice(-2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-slate-700 truncate">{s.id}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(s.started_at)}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="text-sm leading-none">{s.flag}</span>
              {s.country}
            </span>
            <span className="flex items-center gap-1">
              <DeviceIcon device={s.device} size={12} />
              {s.device}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(s.duration)}
            </span>
            <span>{s.pages_count} page{s.pages_count !== 1 ? 's' : ''}</span>
            {s.is_bounce && (
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">Bounce</span>
            )}
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-2" />
      </div>
    </button>
  )
}

function SessionDetail({ session: s, heatmapPage, setHeatmapPage, onClose }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Detail header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-800">{s.id}</span>
            {s.is_bounce && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">Bounce</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{s.visitor_id}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Session meta */}
      <div className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50">
        {[
          { label: 'Duration',  value: formatDuration(s.duration),   icon: Clock },
          { label: 'Pages',     value: `${s.pages_count} visited`,    icon: LayoutGrid },
          { label: 'Country',   value: `${s.flag} ${s.country}`,      icon: MapPin },
          { label: 'Device',    value: `${s.device} · ${s.browser}`,  icon: Monitor },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Icon size={11} /> {label}
            </span>
            <span className="text-sm font-medium text-slate-800 truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Journey timeline */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Video size={14} className="text-slate-400" />
          Page Journey
        </h3>
        <div className="space-y-2">
          {s.journey.map((page, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < s.journey.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-4 bg-slate-200" />
              )}
              <button
                onClick={() => setHeatmapPage(heatmapPage?.path === page.path ? null : page)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                  heatmapPage?.path === page.path
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                )}
              >
                {/* Step badge */}
                <span
                  className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: i === 0 ? C.success : i === s.journey.length - 1 ? C.error : C.primary }}
                >
                  {i === 0 ? 'E' : i === s.journey.length - 1 ? 'X' : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-slate-800 truncate">{page.title}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {formatDuration(page.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-xs text-slate-400 truncate">{page.path}</span>
                    <span className="text-xs text-slate-400">{page.clicks} clicks</span>
                    <span className="text-xs text-slate-400">{page.scroll_depth}% scrolled</span>
                  </div>
                </div>
                <MousePointer2 size={13} className="text-slate-300 flex-shrink-0 mt-1" />
              </button>

              {/* Heatmap placeholder */}
              {heatmapPage?.path === page.path && (
                <HeatmapPlaceholder page={page} />
              )}
            </div>
          ))}
        </div>

        {/* Entry / Exit summary */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.success }} />
            Entry: <span className="font-mono text-slate-700">{s.entry_page}</span>
          </div>
          <ArrowRight size={12} className="text-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.error }} />
            Exit: <span className="font-mono text-slate-700">{s.exit_page}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeatmapPlaceholder({ page }) {
  return (
    <div className="ml-11 mt-2 mb-1 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
          <MousePointer2 size={12} />
          Click Heatmap — {page.title}
        </span>
        <span className="text-xs text-indigo-400">{page.clicks} interactions recorded</span>
      </div>
      {/* Simulated heatmap zones */}
      <div className="relative h-28 rounded-md overflow-hidden bg-white border border-indigo-100">
        {/* Header zone */}
        <div className="absolute top-1 left-2 right-2 h-5 rounded bg-indigo-100 opacity-60 flex items-center px-2">
          <span className="text-xs text-indigo-400">Header / Nav</span>
        </div>
        {/* Hot zones */}
        <div
          className="absolute rounded-full blur-xl opacity-40"
          style={{ width: 48, height: 48, top: 28, left: '35%', backgroundColor: '#EF4444' }}
        />
        <div
          className="absolute rounded-full blur-lg opacity-30"
          style={{ width: 36, height: 36, top: 48, left: '60%', backgroundColor: '#F59E0B' }}
        />
        <div
          className="absolute rounded-full blur-md opacity-25"
          style={{ width: 28, height: 28, top: 60, left: '15%', backgroundColor: '#F59E0B' }}
        />
        {/* Body zones */}
        <div className="absolute bottom-1 left-2 right-2 h-5 rounded bg-slate-100 opacity-40 flex items-center px-2">
          <span className="text-xs text-slate-400">Footer / CTA</span>
        </div>
        <div className="absolute inset-0 flex items-end justify-end p-2">
          <span className="text-xs text-indigo-300 italic">scroll depth: {page.scroll_depth}%</span>
        </div>
      </div>
      <p className="text-xs text-indigo-400 mt-2 text-center">
        Heatmap preview — full resolution available in session recording
      </p>
    </div>
  )
}
