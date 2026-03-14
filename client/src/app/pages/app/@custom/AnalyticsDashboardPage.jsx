import { useState, useMemo, useCallback } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointerClick,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ───────────────────────────────────────────────────────────────

function generateDailyData(days = 30) {
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

const MOCK_DAILY = generateDailyData(30)

const MOCK_TOP_PAGES = [
  { path: '/', title: 'Home', views: 4823, unique: 3201, avgTime: '1m 24s' },
  { path: '/pricing', title: 'Pricing', views: 2341, unique: 1899, avgTime: '2m 10s' },
  { path: '/docs', title: 'Documentation', views: 1987, unique: 1456, avgTime: '3m 45s' },
  { path: '/blog', title: 'Blog', views: 1654, unique: 1321, avgTime: '2m 33s' },
  { path: '/signup', title: 'Sign Up', views: 1201, unique: 1105, avgTime: '0m 58s' },
  { path: '/features', title: 'Features', views: 987, unique: 802, avgTime: '1m 47s' },
  { path: '/login', title: 'Login', views: 876, unique: 654, avgTime: '0m 32s' },
  { path: '/about', title: 'About', views: 543, unique: 432, avgTime: '1m 15s' },
]

const MOCK_REFERRERS = [
  { source: 'Google', visitors: 3456, pct: 34.2 },
  { source: 'Direct', visitors: 2890, pct: 28.6 },
  { source: 'Twitter / X', visitors: 1234, pct: 12.2 },
  { source: 'GitHub', visitors: 987, pct: 9.8 },
  { source: 'Hacker News', visitors: 654, pct: 6.5 },
  { source: 'Reddit', visitors: 432, pct: 4.3 },
  { source: 'LinkedIn', visitors: 234, pct: 2.3 },
  { source: 'Other', visitors: 213, pct: 2.1 },
]

const MOCK_UTM = [
  { campaign: 'spring-launch', source: 'twitter', medium: 'social', visitors: 1234, conversions: 89 },
  { campaign: 'blog-seo', source: 'google', medium: 'organic', visitors: 987, conversions: 67 },
  { campaign: 'newsletter-march', source: 'email', medium: 'email', visitors: 654, conversions: 112 },
  { campaign: 'producthunt', source: 'producthunt', medium: 'referral', visitors: 543, conversions: 45 },
  { campaign: 'hn-post', source: 'hackernews', medium: 'referral', visitors: 321, conversions: 23 },
]

const MOCK_GEO = [
  { country: 'United States', code: 'US', visitors: 3210, pct: 31.8 },
  { country: 'United Kingdom', code: 'GB', visitors: 1456, pct: 14.4 },
  { country: 'Germany', code: 'DE', visitors: 987, pct: 9.8 },
  { country: 'France', code: 'FR', visitors: 654, pct: 6.5 },
  { country: 'Canada', code: 'CA', visitors: 543, pct: 5.4 },
  { country: 'Netherlands', code: 'NL', visitors: 432, pct: 4.3 },
  { country: 'Brazil', code: 'BR', visitors: 387, pct: 3.8 },
  { country: 'India', code: 'IN', visitors: 354, pct: 3.5 },
  { country: 'Australia', code: 'AU', visitors: 298, pct: 3.0 },
  { country: 'Japan', code: 'JP', visitors: 234, pct: 2.3 },
]

const DATE_RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month']

// ─── Components ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, change, changeLabel }) {
  const isPositive = change >= 0
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
      <div className="flex items-center gap-1 text-xs">
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-red-500" />
        )}
        <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-gray-400 dark:text-gray-500 ml-1">{changeLabel || 'vs previous period'}</span>
      </div>
    </div>
  )
}

function MiniBarChart({ data, dataKey, height = 120, color = '#6b7280' }) {
  const max = Math.max(...data.map(d => d[dataKey]))
  const barWidth = Math.max(4, Math.floor((100 / data.length) * 0.7))
  const gap = Math.max(1, Math.floor((100 / data.length) * 0.3))

  return (
    <div className="flex items-end gap-px" style={{ height }}>
      {data.map((d, i) => {
        const h = max > 0 ? (d[dataKey] / max) * 100 : 0
        return (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80 group relative"
            style={{ height: `${Math.max(h, 2)}%`, backgroundColor: color, minWidth: 3, maxWidth: 16 }}
            title={`${d.label}: ${d[dataKey].toLocaleString()}`}
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
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const totals = useMemo(() => {
    const visitors = MOCK_DAILY.reduce((s, d) => s + d.visitors, 0)
    const unique = MOCK_DAILY.reduce((s, d) => s + d.uniqueUsers, 0)
    const sessions = MOCK_DAILY.reduce((s, d) => s + d.sessions, 0)
    const pageviews = MOCK_DAILY.reduce((s, d) => s + d.pageviews, 0)
    const bounceRate = 42.3
    const avgDuration = '2m 14s'
    return { visitors, unique, sessions, pageviews, bounceRate, avgDuration }
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }, [])

  const maxReferrerVisitors = Math.max(...MOCK_REFERRERS.map(r => r.visitors))
  const maxGeoVisitors = Math.max(...MOCK_GEO.map(g => g.visitors))
  const maxPageViews = Math.max(...MOCK_TOP_PAGES.map(p => p.views))

  return (
    <PageLayout>
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
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {dateRange}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showDatePicker && (
                <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1">
                  {DATE_RANGES.map(r => (
                    <button
                      key={r}
                      onClick={() => { setDateRange(r); setShowDatePicker(false) }}
                      className={cn(
                        'block w-full text-left px-4 py-2 text-sm transition-colors',
                        r === dateRange
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </button>
            <button
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard icon={Eye} label="Visitors" value={totals.visitors} change={12.5} />
          <MetricCard icon={Users} label="Unique Users" value={totals.unique} change={8.3} />
          <MetricCard icon={BarChart3} label="Sessions" value={totals.sessions} change={15.1} />
          <MetricCard icon={MousePointerClick} label="Pageviews" value={totals.pageviews} change={9.7} />
          <MetricCard icon={TrendingDown} label="Bounce Rate" value={`${totals.bounceRate}%`} change={-3.2} />
          <MetricCard icon={Clock} label="Avg. Duration" value={totals.avgDuration} change={5.8} />
        </div>

        {/* Visitors Chart */}
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
            <MiniBarChart data={MOCK_DAILY} dataKey="visitors" height={100} color="#6b7280" />
            <MiniBarChart data={MOCK_DAILY} dataKey="uniqueUsers" height={60} color="#3b82f6" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500">
            {MOCK_DAILY.filter((_, i) => i % 5 === 0).map(d => (
              <span key={d.date}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Two-column: Top Pages + Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSection title="Top Pages">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Page</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TOP_PAGES.map(page => (
                    <tr key={page.path} className="border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{page.path}</span>
                          <span className="text-gray-400 dark:text-gray-500 text-xs hidden sm:inline">{page.title}</span>
                        </div>
                      </td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-gray-700 dark:text-gray-300">{page.views.toLocaleString()}</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-gray-700 dark:text-gray-300">{page.unique.toLocaleString()}</td>
                      <td className="text-right px-5 py-2.5 text-gray-500 dark:text-gray-400">{page.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableSection>

          <TableSection title="Referrers">
            <div className="py-2">
              {MOCK_REFERRERS.map(ref => (
                <BarRow key={ref.source} label={ref.source} value={ref.visitors} maxValue={maxReferrerVisitors} color="#6b7280" />
              ))}
            </div>
          </TableSection>
        </div>

        {/* Two-column: UTM Campaigns + Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSection title="UTM Campaigns">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                    <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitors</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_UTM.map(utm => (
                    <tr key={utm.campaign} className="border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-5 py-2.5 font-medium text-gray-900 dark:text-white">{utm.campaign}</td>
                      <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">{utm.source}/{utm.medium}</td>
                      <td className="text-right px-3 py-2.5 tabular-nums text-gray-700 dark:text-gray-300">{utm.visitors.toLocaleString()}</td>
                      <td className="text-right px-5 py-2.5 tabular-nums text-emerald-600 dark:text-emerald-400">{utm.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableSection>

          <TableSection title="Countries">
            <div className="py-2">
              {MOCK_GEO.map(geo => (
                <BarRow key={geo.code} label={`${geo.country}`} value={geo.visitors} maxValue={maxGeoVisitors} color="#3b82f6" />
              ))}
            </div>
          </TableSection>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Tracking live — 14 visitors online now</span>
        </div>
      </div>
    </PageLayout>
  )
}
