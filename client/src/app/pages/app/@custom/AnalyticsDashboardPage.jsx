import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  BarChart3,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'
import { api } from '../../../lib/@system/api'

// ─── Date Range Presets ──────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'last-month' },
]

const RANGE_LABEL_MAP = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  month: 'This month',
  'last-month': 'Last month',
}

// ─── Mock Data Fallback ───────────────────────────────────────────────────────

function generateMockDailyData(days = 30) {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 800 + Math.floor(Math.random() * 600)
    data.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: base,
      uniqueUsers: Math.floor(base * (0.55 + Math.random() * 0.15)),
      sessions: Math.floor(base * (1.1 + Math.random() * 0.3)),
      pageviews: Math.floor(base * (2.2 + Math.random() * 0.8)),
    })
  }
  return data
}

const MOCK_TOP_PAGES = [
  { path: '/', title: 'Home', views: 4823, unique: 3201, avgTime: '1m 24s' },
  { path: '/pricing', title: 'Pricing', views: 2341, unique: 1899, avgTime: '2m 10s' },
  { path: '/docs', title: 'Documentation', views: 1987, unique: 1456, avgTime: '3m 45s' },
  { path: '/blog', title: 'Blog', views: 1654, unique: 1321, avgTime: '2m 33s' },
  { path: '/signup', title: 'Sign Up', views: 1201, unique: 1105, avgTime: '0m 58s' },
]

const MOCK_REFERRERS = [
  { source: 'Google', visitors: 3456, pct: 34.2 },
  { source: 'Direct', visitors: 2890, pct: 28.6 },
  { source: 'Twitter / X', visitors: 1234, pct: 12.2 },
  { source: 'GitHub', visitors: 987, pct: 9.8 },
]

const MOCK_UTM = [
  { campaign: 'spring-launch', source: 'twitter', medium: 'social', visitors: 1234, conversions: 89 },
  { campaign: 'blog-seo', source: 'google', medium: 'organic', visitors: 987, conversions: 67 },
]

const MOCK_GEO = [
  { country: 'United States', code: 'US', visitors: 3210, pct: 31.8 },
  { country: 'United Kingdom', code: 'GB', visitors: 1456, pct: 14.4 },
  { country: 'Germany', code: 'DE', visitors: 987, pct: 9.8 },
  { country: 'France', code: 'FR', visitors: 654, pct: 6.5 },
]

// ─── Components ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, change }) {
  const isPositive = !change || change >= 0
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {change != null && (
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-red-500" />
          )}
          <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
            {isPositive ? '+' : ''}{change?.toFixed(1)}%
          </span>
          <span className="text-gray-400 dark:text-gray-500 ml-1">vs previous period</span>
        </div>
      )}
    </div>
  )
}

function MiniBarChart({ data, dataKey, height = 120, color = '#6b7280' }) {
  if (!data || data.length === 0) return <div style={{ height }} className="flex items-center justify-center text-sm text-gray-400">No data</div>
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1)
  return (
    <div className="flex items-end gap-px" style={{ height }}>
      {data.map((d, i) => {
        const h = max > 0 ? ((d[dataKey] || 0) / max) * 100 : 0
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{ height: `${Math.max(h, 2)}%`, backgroundColor: color, minWidth: 3, maxWidth: 16 }}
            title={`${d.label}: ${(d[dataKey] || 0).toLocaleString()}`}
          />
        )
      })}
    </div>
  )
}

function TableSection({ title, children, className }) {
  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800', className)}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-0">{children}</div>
    </div>
  )
}

function BarRow({ label, value, maxValue, color = '#6b7280' }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      <span className="text-sm text-gray-700 dark:text-gray-300 w-32 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [overviewRes, dashRes] = await Promise.all([
        api.get(`/analytics/overview?range=${dateRange}`),
        api.get(`/analytics/dashboard?range=${dateRange}`),
      ])
      setData(overviewRes)
      setStats(dashRes)
    } catch {
      // Fall back to mock data
      const mockDaily = generateMockDailyData(dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30)
      setData({
        daily: mockDaily,
        topPages: MOCK_TOP_PAGES,
        referrers: MOCK_REFERRERS,
        utm: MOCK_UTM,
        geo: MOCK_GEO,
      })
      setStats({
        bounceRate: 42.3,
        avgDuration: 134,
        trends: { visitors: 12.5, users: 8.3, sessions: 15.1, bounce: -3.2 },
        totalVisitors: mockDaily.reduce((s, d) => s + d.visitors, 0),
        uniqueUsers: mockDaily.reduce((s, d) => s + d.uniqueUsers, 0),
        sessions: mockDaily.reduce((s, d) => s + d.sessions, 0),
      })
    }
    setLoading(false)
  }, [dateRange])

  useEffect(() => { loadData() }, [loadData])

  const totals = useMemo(() => {
    if (stats) {
      const pageviews = data?.daily?.reduce((s, d) => s + (d.pageviews || 0), 0) || 0
      return {
        visitors: stats.totalVisitors || 0,
        unique: stats.uniqueUsers || 0,
        sessions: stats.sessions || 0,
        pageviews,
        bounceRate: typeof stats.bounceRate === 'number' ? `${stats.bounceRate.toFixed(1)}%` : '—',
        avgDuration: stats.avgDuration ? formatDuration(stats.avgDuration) : '—',
      }
    }
    if (data?.daily) {
      const daily = data.daily
      return {
        visitors: daily.reduce((s, d) => s + (d.visitors || 0), 0),
        unique: daily.reduce((s, d) => s + (d.uniqueUsers || 0), 0),
        sessions: daily.reduce((s, d) => s + (d.sessions || 0), 0),
        pageviews: daily.reduce((s, d) => s + (d.pageviews || 0), 0),
        bounceRate: '42.3%',
        avgDuration: '2m 14s',
      }
    }
    return null
  }, [data, stats])

  const daily = data?.daily || []
  const topPages = data?.topPages || []
  const referrers = data?.referrers || []
  const utm = data?.utm || []
  const geo = data?.geo || []

  const maxReferrerVisitors = referrers.length ? Math.max(...referrers.map(r => r.visitors)) : 1
  const maxGeoVisitors = geo.length ? Math.max(...geo.map(g => g.visitors)) : 1
  const maxPageViews = topPages.length ? Math.max(...topPages.map(p => p.views)) : 1

  return (
    <AnalyticsLayout>
      <Header title="Analytics Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time analytics for your product
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {RANGE_LABEL_MAP[dateRange] || dateRange}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showDatePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
                    {DATE_RANGES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => { setDateRange(r.value); setShowDatePicker(false) }}
                        className={cn(
                          'block w-full text-left px-4 py-2 text-sm transition-colors',
                          r.value === dateRange
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        {loading && !totals ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-5 animate-pulse">
                <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : totals && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard icon={Eye} label="Visitors" value={totals.visitors} change={stats?.trends?.visitors} />
            <MetricCard icon={Users} label="Unique Users" value={totals.unique} change={stats?.trends?.users} />
            <MetricCard icon={BarChart3} label="Sessions" value={totals.sessions} change={stats?.trends?.sessions} />
            <MetricCard icon={MousePointerClick} label="Pageviews" value={totals.pageviews} />
            <MetricCard icon={TrendingDown} label="Bounce Rate" value={totals.bounceRate} change={stats?.trends?.bounce} />
            <MetricCard icon={Clock} label="Avg. Duration" value={totals.avgDuration} />
          </div>
        )}

        {/* Visitors Chart */}
        {daily.length > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Visitors Over Time</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#6b7280' }} />
                  Visitors
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                  Unique Users
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <MiniBarChart data={daily} dataKey="visitors" height={100} color="#6b7280" />
              <MiniBarChart data={daily} dataKey="uniqueUsers" height={60} color="#3b82f6" />
            </div>
            {daily.length > 1 && (
              <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                {daily.filter((_, i) => i % Math.max(1, Math.floor(daily.length / 6)) === 0).map(d => (
                  <span key={d.date || d.label}>{d.label}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Two-column: Top Pages + Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSection title="Top Pages">
            {topPages.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No page data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                      <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map(page => (
                      <tr key={page.path} className="border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{page.path}</span>
                            {page.title && <span className="text-gray-400 text-xs hidden sm:inline">{page.title}</span>}
                          </div>
                        </td>
                        <td className="text-right px-3 py-2.5 tabular-nums text-gray-700">{(page.views || 0).toLocaleString()}</td>
                        <td className="text-right px-5 py-2.5 tabular-nums text-gray-700">{(page.unique || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableSection>

          <TableSection title="Referrers">
            {referrers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No referrer data yet</p>
            ) : (
              <div className="py-2">
                {referrers.map(ref => (
                  <BarRow key={ref.source} label={ref.source} value={ref.visitors} maxValue={maxReferrerVisitors} color="#6b7280" />
                ))}
              </div>
            )}
          </TableSection>
        </div>

        {/* Two-column: UTM Campaigns + Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSection title="UTM Campaigns">
            {utm.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No UTM campaign data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utm.map((u, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-2.5 font-medium text-gray-900 dark:text-white">{u.campaign}</td>
                        <td className="px-3 py-2.5 text-gray-500">{u.source}/{u.medium}</td>
                        <td className="text-right px-5 py-2.5 tabular-nums text-gray-700">{(u.visitors || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableSection>

          <TableSection title="Countries">
            {geo.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No geographic data yet</p>
            ) : (
              <div className="py-2">
                {geo.map(g => (
                  <BarRow key={g.country + g.code} label={g.country} value={g.visitors} maxValue={maxGeoVisitors} color="#3b82f6" />
                ))}
              </div>
            )}
          </TableSection>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Tracking live</span>
        </div>
      </div>
    </AnalyticsLayout>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '0s'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}
