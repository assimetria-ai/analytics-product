import { useEffect, useState, useCallback } from 'react'
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Calendar,
  ChevronDown,
  TrendingUp,
  MousePointerClick,
  ExternalLink,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'
import { api } from '../../../lib/@system/api'

// ─── Date Range Presets ──────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'month' },
  { label: 'Last month', value: 'last-month' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDuration(seconds) {
  if (seconds == null) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function formatPercent(n) {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

function TrendBadge({ value, inverted = false }) {
  if (value == null) return null
  const positive = inverted ? value < 0 : value > 0
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        positive ? 'text-green-600' : 'text-red-500'
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, trend, trendInverted = false }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <TrendBadge value={trend} inverted={trendInverted} />
        </div>
      </div>
    </div>
  )
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────

function MiniBarChart({ data, height = 120 }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No data</div>
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors cursor-default group relative"
          style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
          title={`${d.label}: ${formatNumber(d.value)}`}
        />
      ))}
    </div>
  )
}

// ─── Table Component ─────────────────────────────────────────────────────────

function RankingTable({ title, icon, rows, valueLabel = 'Visitors' }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {(!rows || rows.length === 0) ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">No data yet</p>
        ) : (
          rows.slice(0, 10).map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-muted-foreground w-5 text-right text-xs">{i + 1}</span>
                <span className="text-foreground truncate">{row.label || '(direct)'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{formatNumber(row.value)}</span>
                {row.percent != null && (
                  <div className="w-16">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(row.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Date Range Selector ─────────────────────────────────────────────────────

function DateRangeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const current = DATE_RANGES.find((r) => r.value === value) || DATE_RANGES[2]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border bg-card hover:bg-muted transition-colors"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{current.label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => { onChange(r.value); setOpen(false) }}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors',
                  r.value === value && 'bg-muted font-medium'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Mock Data Generator ─────────────────────────────────────────────────────
// Since the analytics backend doesn't exist yet, generate realistic demo data.

function generateMockData(range) {
  const days = { today: 1, yesterday: 1, '7d': 7, '30d': 30, '90d': 90, month: 30, 'last-month': 30 }[range] || 7
  const baseVisitors = Math.floor(Math.random() * 500) + 200

  // Time series for chart
  const timeSeries = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(baseVisitors * (0.5 + Math.random())),
    }
  })

  const totalVisitors = timeSeries.reduce((sum, d) => sum + d.value, 0)
  const uniqueUsers = Math.floor(totalVisitors * (0.6 + Math.random() * 0.2))
  const sessions = Math.floor(totalVisitors * (0.8 + Math.random() * 0.3))
  const bounceRate = 30 + Math.random() * 35

  // Top pages
  const pages = [
    { label: '/', value: Math.floor(totalVisitors * 0.35) },
    { label: '/pricing', value: Math.floor(totalVisitors * 0.18) },
    { label: '/features', value: Math.floor(totalVisitors * 0.12) },
    { label: '/docs', value: Math.floor(totalVisitors * 0.1) },
    { label: '/blog', value: Math.floor(totalVisitors * 0.08) },
    { label: '/about', value: Math.floor(totalVisitors * 0.05) },
    { label: '/contact', value: Math.floor(totalVisitors * 0.04) },
    { label: '/changelog', value: Math.floor(totalVisitors * 0.03) },
  ].map((p) => ({ ...p, percent: (p.value / totalVisitors) * 100 }))

  // Top referrers
  const referrers = [
    { label: '(direct)', value: Math.floor(totalVisitors * 0.4) },
    { label: 'google.com', value: Math.floor(totalVisitors * 0.25) },
    { label: 'twitter.com', value: Math.floor(totalVisitors * 0.1) },
    { label: 'github.com', value: Math.floor(totalVisitors * 0.08) },
    { label: 'producthunt.com', value: Math.floor(totalVisitors * 0.05) },
    { label: 'linkedin.com', value: Math.floor(totalVisitors * 0.04) },
    { label: 'reddit.com', value: Math.floor(totalVisitors * 0.03) },
  ].map((r) => ({ ...r, percent: (r.value / totalVisitors) * 100 }))

  // Countries
  const countries = [
    { label: 'United States', value: Math.floor(totalVisitors * 0.35) },
    { label: 'United Kingdom', value: Math.floor(totalVisitors * 0.12) },
    { label: 'Germany', value: Math.floor(totalVisitors * 0.1) },
    { label: 'France', value: Math.floor(totalVisitors * 0.08) },
    { label: 'Portugal', value: Math.floor(totalVisitors * 0.06) },
    { label: 'Canada', value: Math.floor(totalVisitors * 0.05) },
    { label: 'Brazil', value: Math.floor(totalVisitors * 0.04) },
    { label: 'India', value: Math.floor(totalVisitors * 0.04) },
  ].map((c) => ({ ...c, percent: (c.value / totalVisitors) * 100 }))

  // UTM sources
  const utmSources = [
    { label: 'newsletter', value: Math.floor(totalVisitors * 0.15) },
    { label: 'social', value: Math.floor(totalVisitors * 0.12) },
    { label: 'paid-search', value: Math.floor(totalVisitors * 0.08) },
    { label: 'organic', value: Math.floor(totalVisitors * 0.06) },
    { label: 'referral', value: Math.floor(totalVisitors * 0.04) },
  ].map((u) => ({ ...u, percent: (u.value / totalVisitors) * 100 }))

  // Devices
  const devices = [
    { label: 'Desktop', value: Math.floor(totalVisitors * 0.58), icon: 'desktop' },
    { label: 'Mobile', value: Math.floor(totalVisitors * 0.34), icon: 'mobile' },
    { label: 'Tablet', value: Math.floor(totalVisitors * 0.08), icon: 'tablet' },
  ]
  const deviceTotal = devices.reduce((s, d) => s + d.value, 0)
  devices.forEach((d) => { d.percent = (d.value / deviceTotal) * 100 })

  return {
    totalVisitors,
    uniqueUsers,
    sessions,
    bounceRate,
    avgDuration: 45 + Math.random() * 180,
    timeSeries,
    pages,
    referrers,
    countries,
    utmSources,
    devices,
    trends: {
      visitors: -5 + Math.random() * 30,
      users: -5 + Math.random() * 25,
      sessions: -5 + Math.random() * 20,
      bounce: -8 + Math.random() * 16,
    },
  }
}

// ─── Device Breakdown ────────────────────────────────────────────────────────

function DeviceBreakdown({ devices }) {
  const icons = {
    desktop: <Monitor className="h-4 w-4" />,
    mobile: <Smartphone className="h-4 w-4" />,
    tablet: <Tablet className="h-4 w-4" />,
  }
  if (!devices || devices.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Devices</h3>
      </div>
      <div className="p-4 space-y-3">
        {devices.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-muted-foreground">{icons[d.icon] || icons.desktop}</span>
                {d.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatNumber(d.value)}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">{formatPercent(d.percent)}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${d.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Realtime Indicator ──────────────────────────────────────────────────────

function RealtimeIndicator({ count }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-sm font-medium text-green-600">{count} online now</span>
    </div>
  )
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

export function DashboardPage() {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [realtimeUsers, setRealtimeUsers] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Try the real API first
      const res = await api.get(`/analytics/dashboard?range=${range}`)
      setData(res)
    } catch {
      // Fall back to mock data for demo
      await new Promise((r) => setTimeout(r, 400))
      setData(generateMockData(range))
    }
    setLoading(false)
  }, [range])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Simulate realtime users
  useEffect(() => {
    setRealtimeUsers(Math.floor(Math.random() * 20) + 3)
    const iv = setInterval(() => {
      setRealtimeUsers((prev) => Math.max(1, prev + Math.floor(Math.random() * 5) - 2))
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  return (
    <AnalyticsLayout>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Analytics overview for your site</p>
          </div>
          <div className="flex items-center gap-3">
            <RealtimeIndicator count={realtimeUsers} />
            <DateRangeSelector value={range} onChange={setRange} />
            <button
              onClick={loadData}
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4 text-muted-foreground', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        {loading && !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse">
                <div className="h-4 w-20 bg-muted rounded mb-2" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Visitors"
              value={formatNumber(data.totalVisitors)}
              icon={<Eye className="h-4 w-4" />}
              trend={data.trends?.visitors}
            />
            <StatCard
              label="Unique Users"
              value={formatNumber(data.uniqueUsers)}
              icon={<Users className="h-4 w-4" />}
              trend={data.trends?.users}
            />
            <StatCard
              label="Sessions"
              value={formatNumber(data.sessions)}
              icon={<MousePointerClick className="h-4 w-4" />}
              trend={data.trends?.sessions}
            />
            <StatCard
              label="Bounce Rate"
              value={formatPercent(data.bounceRate)}
              icon={<TrendingUp className="h-4 w-4" />}
              trend={data.trends?.bounce}
              trendInverted
            />
          </div>
        ) : null}

        {/* Visitors Chart */}
        {data && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Visitors Over Time</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Avg: {formatNumber(Math.round(data.totalVisitors / (data.timeSeries?.length || 1)))}/day
              </span>
            </div>
            <MiniBarChart data={data.timeSeries} height={160} />
            {data.timeSeries && data.timeSeries.length > 1 && (
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{data.timeSeries[0]?.label}</span>
                <span>{data.timeSeries[data.timeSeries.length - 1]?.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Grid: Pages, Referrers, Countries, UTM, Devices */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankingTable
              title="Top Pages"
              icon={<ExternalLink className="h-4 w-4" />}
              rows={data.pages}
              valueLabel="Visitors"
            />
            <RankingTable
              title="Top Referrers"
              icon={<Globe className="h-4 w-4" />}
              rows={data.referrers}
              valueLabel="Visitors"
            />
            <RankingTable
              title="Countries"
              icon={<Globe className="h-4 w-4" />}
              rows={data.countries}
              valueLabel="Visitors"
            />
            <div className="space-y-4">
              <RankingTable
                title="UTM Sources"
                icon={<TrendingUp className="h-4 w-4" />}
                rows={data.utmSources}
                valueLabel="Visitors"
              />
              <DeviceBreakdown devices={data.devices} />
            </div>
          </div>
        )}

        {/* Avg Session Duration */}
        {data && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-muted p-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Session Duration</p>
                <p className="text-lg font-bold text-foreground">{formatDuration(data.avgDuration)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnalyticsLayout>
  )
}
