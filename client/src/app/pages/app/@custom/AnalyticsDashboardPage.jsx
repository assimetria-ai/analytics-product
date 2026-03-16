/**
 * @custom AnalyticsDashboardPage — Real-time analytics overview
 * Visitors, sessions, bounce rate, session duration, traffic over time,
 * top pages, referrer breakdown, UTM analysis. See everything. Miss nothing.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Globe,
  BarChart3,
  MapPin,
  Tag,
} from 'lucide-react'
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { DashboardLayout } from '../../../components/@system/Dashboard/DashboardLayout'
import { cn } from '../../../lib/@system/utils'
import { ANALYTICS_NAV_ITEMS } from '../../../config/@custom/navigation'

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
function genTrafficData() {
  const now = new Date()
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    const base = 380 + Math.floor(Math.sin(i * 0.4) * 120)
    const visitors = base + Math.floor(Math.random() * 180)
    const sessions = Math.floor(visitors * (1.3 + Math.random() * 0.4))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors,
      sessions,
      pageviews: Math.floor(sessions * (2.1 + Math.random() * 1.2)),
    }
  })
}

function genTopPages() {
  return [
    { path: '/',              title: 'Home',                visitors: 4_821, views: 9_340, bounceRate: 38.2 },
    { path: '/pricing',       title: 'Pricing',             visitors: 2_943, views: 4_120, bounceRate: 44.7 },
    { path: '/blog',          title: 'Blog',                visitors: 2_187, views: 5_630, bounceRate: 31.4 },
    { path: '/docs',          title: 'Documentation',       visitors: 1_854, views: 6_890, bounceRate: 22.1 },
    { path: '/about',         title: 'About Us',            visitors: 1_203, views: 1_890, bounceRate: 56.8 },
    { path: '/blog/analytics-101', title: 'Analytics 101', visitors:   987, views: 2_340, bounceRate: 27.3 },
    { path: '/login',         title: 'Login',               visitors:   876, views:   920, bounceRate: 15.2 },
    { path: '/signup',        title: 'Sign Up',             visitors:   743, views:   810, bounceRate: 12.9 },
  ]
}

function genReferrers() {
  return [
    { source: 'Direct',     visitors: 5_394, pct: 36.2, color: C.primary   },
    { source: 'Google',     visitors: 4_120, pct: 27.7, color: C.secondary },
    { source: 'Twitter/X',  visitors: 2_034, pct: 13.7, color: C.accent    },
    { source: 'GitHub',     visitors: 1_456, pct:  9.8, color: C.success   },
    { source: 'LinkedIn',   visitors:   876, pct:  5.9, color: C.warning   },
    { source: 'Other',      visitors:   987, pct:  6.6, color: '#94a3b8'   },
  ]
}

function genUTM() {
  return [
    { campaign: 'product-launch',  source: 'email',   medium: 'newsletter', sessions: 2_340, conversions: 312 },
    { campaign: 'blog-promo',      source: 'twitter', medium: 'social',     sessions: 1_456, conversions: 189 },
    { campaign: 'retargeting-q1',  source: 'google',  medium: 'cpc',        sessions:   987, conversions: 145 },
    { campaign: 'docs-seo',        source: 'google',  medium: 'organic',    sessions:   756, conversions:  87 },
    { campaign: 'partner-ship',    source: 'github',  medium: 'referral',   sessions:   543, conversions:  67 },
  ]
}

function genGeoData() {
  return [
    { country: 'United States', visitors: 5_230, flag: '🇺🇸' },
    { country: 'United Kingdom', visitors: 1_840, flag: '🇬🇧' },
    { country: 'Germany',       visitors: 1_320, flag: '🇩🇪' },
    { country: 'Canada',        visitors: 1_120, flag: '🇨🇦' },
    { country: 'France',        visitors:   870, flag: '🇫🇷' },
    { country: 'Australia',     visitors:   760, flag: '🇦🇺' },
  ]
}

// ─── Component ────────────────────────────────────────────────────
export { AnalyticsDashboardPage }
export default function AnalyticsDashboardPage() {
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [traffic, setTraffic]       = useState([])
  const [topPages, setTopPages]     = useState([])
  const [referrers, setReferrers]   = useState([])
  const [utmData, setUtmData]       = useState([])
  const [geoData, setGeoData]       = useState([])

  const loadData = useCallback(() => {
    setTraffic(genTrafficData())
    setTopPages(genTopPages())
    setReferrers(genReferrers())
    setUtmData(genUTM())
    setGeoData(genGeoData())
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

  const kpis = useMemo(() => {
    if (!traffic.length) return null
    const totalVisitors  = traffic.reduce((s, d) => s + d.visitors, 0)
    const totalSessions  = traffic.reduce((s, d) => s + d.sessions, 0)
    const totalPageviews = traffic.reduce((s, d) => s + d.pageviews, 0)
    return {
      visitors:      totalVisitors,
      sessions:      totalSessions,
      pageviews:     totalPageviews,
      bounceRate:    42.3,
      avgDuration:   '2m 34s',
      pagesPerSess:  parseFloat((totalPageviews / totalSessions).toFixed(1)),
    }
  }, [traffic])

  return (
    <DashboardLayout navItems={ANALYTICS_NAV_ITEMS}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.textDark }}>Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">See everything. Miss nothing. — Last 30 days</p>
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

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
                <div className="h-7 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            {kpis && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard icon={Users}            label="Visitors"       value={kpis.visitors.toLocaleString()}    change={+14.2} positive />
                <KpiCard icon={MousePointerClick} label="Sessions"      value={kpis.sessions.toLocaleString()}    change={+11.8} positive />
                <KpiCard icon={BarChart3}         label="Pageviews"     value={kpis.pageviews.toLocaleString()}   change={+9.3}  positive />
                <KpiCard icon={TrendingDown}      label="Bounce Rate"   value={`${kpis.bounceRate}%`}             change={-2.1}  positive />
                <KpiCard icon={Clock}             label="Avg. Duration" value={kpis.avgDuration}                  change={+0.4}  positive />
                <KpiCard icon={TrendingUp}        label="Pages/Session" value={kpis.pagesPerSess.toString()}      change={+0.2}  positive />
              </div>
            )}

            {/* Traffic Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">Traffic Over Time</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.primary }} />
                    Visitors
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.secondary }} />
                    Sessions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.accent }} />
                    Pageviews
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={traffic} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    {[['primary', C.primary], ['secondary', C.secondary], ['accent', C.accent]].map(([id, color]) => (
                      <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={45} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
                  <Area type="monotone" dataKey="visitors"  stroke={C.primary}   fill="url(#grad-primary)"   strokeWidth={2} />
                  <Area type="monotone" dataKey="sessions"  stroke={C.secondary} fill="url(#grad-secondary)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pageviews" stroke={C.accent}    fill="url(#grad-accent)"    strokeWidth={1.5} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top Pages + Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Pages */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Top Pages</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Page</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Visitors</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                        <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Bounce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPages.map((page, i) => (
                        <tr key={page.path} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: i < 3 ? C.primary : '#cbd5e1' }}
                              >{i + 1}</span>
                              <div className="min-w-0">
                                <div className="font-medium text-slate-900 truncate">{page.title}</div>
                                <div className="text-xs text-slate-400 truncate font-mono">{page.path}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right text-slate-700 font-mono">{page.visitors.toLocaleString()}</td>
                          <td className="py-3 text-right text-slate-700 font-mono">{page.views.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              page.bounceRate < 30  ? 'bg-emerald-50 text-emerald-700' :
                              page.bounceRate < 50  ? 'bg-amber-50 text-amber-700' :
                                                       'bg-red-50 text-red-700'
                            )}>
                              {page.bounceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Referrer Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-slate-400" />
                  Referrers
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={referrers} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="visitors">
                      {referrers.map((r, i) => <Cell key={i} fill={r.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v.toLocaleString(), 'Visitors']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {referrers.map((r) => (
                    <div key={r.source} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="flex-1 text-slate-700">{r.source}</span>
                      <span className="text-slate-400 text-xs">{r.pct}%</span>
                      <span className="text-slate-600 font-medium font-mono text-xs w-16 text-right">{r.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UTM Campaigns + Geo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* UTM Analysis */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-slate-400" />
                  UTM Campaigns
                </h2>
                <div className="space-y-0">
                  <div className="grid grid-cols-5 gap-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <span className="col-span-2">Campaign</span>
                    <span>Source / Medium</span>
                    <span className="text-right">Sessions</span>
                    <span className="text-right">Conversions</span>
                  </div>
                  {utmData.map((u) => (
                    <div key={u.campaign} className="grid grid-cols-5 gap-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm">
                      <span className="col-span-2 font-medium text-slate-900 truncate">{u.campaign}</span>
                      <span className="text-slate-500 truncate">
                        <span className="text-slate-700">{u.source}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        {u.medium}
                      </span>
                      <span className="text-right text-slate-700 font-mono">{u.sessions.toLocaleString()}</span>
                      <span className="text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                          {u.conversions}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Session bar chart by campaign */}
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={utmData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="campaign" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={100} />
                      <Tooltip
                        formatter={(v) => [v.toLocaleString(), 'Sessions']}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                      <Bar dataKey="sessions" fill={C.primary} radius={[0, 4, 4, 0]} maxBarSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Geo Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  Top Countries
                </h2>
                <div className="space-y-3">
                  {geoData.map((g, i) => {
                    const maxVisitors = geoData[0].visitors
                    const pct = Math.round((g.visitors / maxVisitors) * 100)
                    return (
                      <div key={g.country}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 text-slate-700">
                            <span className="text-lg leading-none">{g.flag}</span>
                            {g.country}
                          </span>
                          <span className="font-medium text-slate-900 font-mono">{g.visitors.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: i === 0 ? C.primary : C.secondary }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#eef2ff' }}>
          <Icon size={14} style={{ color: C.primary }} />
        </div>
      </div>
      <div className="text-xl font-bold text-slate-900 mb-1">{value}</div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', positive ? 'text-emerald-600' : 'text-red-500')}>
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {change > 0 ? '+' : ''}{change}%
          <span className="text-slate-400 font-normal ml-1">30d</span>
        </div>
      )}
    </div>
  )
}
