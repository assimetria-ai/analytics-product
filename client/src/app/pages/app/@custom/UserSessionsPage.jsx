import { useState } from 'react'
import {
  Play,
  Search,
  Filter,
  Calendar,
  Clock,
  MousePointerClick,
  Monitor,
  Smartphone,
  Globe,
  ChevronRight,
  Eye,
  MapPin,
} from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { PageLayout } from '../../../components/@system/layout/PageLayout'
import { cn } from '../../../lib/@system/utils'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  {
    id: 'sess_a1b2c3',
    userId: 'user_482',
    country: 'US',
    city: 'San Francisco',
    device: 'desktop',
    browser: 'Chrome 121',
    os: 'macOS',
    duration: '4m 32s',
    pages: 7,
    clicks: 14,
    startedAt: '2026-03-14T01:23:00Z',
    path: ['/', '/pricing', '/features', '/docs', '/docs/install', '/signup', '/app'],
    isLive: true,
  },
  {
    id: 'sess_d4e5f6',
    userId: 'user_1203',
    country: 'GB',
    city: 'London',
    device: 'desktop',
    browser: 'Firefox 122',
    os: 'Windows',
    duration: '2m 15s',
    pages: 4,
    clicks: 8,
    startedAt: '2026-03-14T01:18:00Z',
    path: ['/', '/blog/analytics-guide', '/pricing', '/signup'],
    isLive: true,
  },
  {
    id: 'sess_g7h8i9',
    userId: null,
    country: 'DE',
    city: 'Berlin',
    device: 'mobile',
    browser: 'Safari 17',
    os: 'iOS',
    duration: '1m 48s',
    pages: 3,
    clicks: 5,
    startedAt: '2026-03-14T01:10:00Z',
    path: ['/', '/features', '/pricing'],
    isLive: false,
  },
  {
    id: 'sess_j1k2l3',
    userId: 'user_567',
    country: 'FR',
    city: 'Paris',
    device: 'desktop',
    browser: 'Chrome 121',
    os: 'Linux',
    duration: '6m 11s',
    pages: 9,
    clicks: 22,
    startedAt: '2026-03-14T00:55:00Z',
    path: ['/', '/docs', '/docs/api', '/docs/embed', '/docs/funnels', '/docs/errors', '/pricing', '/signup', '/app'],
    isLive: false,
  },
  {
    id: 'sess_m4n5o6',
    userId: null,
    country: 'CA',
    city: 'Toronto',
    device: 'mobile',
    browser: 'Chrome 121',
    os: 'Android',
    duration: '0m 34s',
    pages: 1,
    clicks: 0,
    startedAt: '2026-03-14T00:48:00Z',
    path: ['/blog/privacy-first-analytics'],
    isLive: false,
  },
  {
    id: 'sess_p7q8r9',
    userId: 'user_891',
    country: 'NL',
    city: 'Amsterdam',
    device: 'desktop',
    browser: 'Edge 121',
    os: 'Windows',
    duration: '3m 22s',
    pages: 5,
    clicks: 11,
    startedAt: '2026-03-13T23:30:00Z',
    path: ['/', '/features', '/pricing', '/about', '/contact'],
    isLive: false,
  },
]

const MOCK_HEATMAP_AREAS = [
  { label: 'CTA Button', clicks: 342, x: '50%', y: '35%' },
  { label: 'Navigation', clicks: 567, x: '50%', y: '5%' },
  { label: 'Pricing Toggle', clicks: 234, x: '60%', y: '55%' },
  { label: 'Feature Cards', clicks: 189, x: '30%', y: '70%' },
  { label: 'Footer Links', clicks: 98, x: '50%', y: '95%' },
]

// ─── Components ──────────────────────────────────────────────────────────────

function SessionRow({ session, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(session.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors',
        isSelected
          ? 'bg-gray-50 dark:bg-gray-750'
          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.isLive && (
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
          {!session.isLive && <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {session.userId || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {session.id.slice(0, 12)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {session.city}, {session.country}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {session.device === 'mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                {session.browser}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {session.pages} pages
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {session.duration}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </button>
  )
}

function UserJourney({ session }) {
  return (
    <div className="space-y-0">
      {session.path.map((page, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0',
              i === 0 ? 'bg-emerald-500' : i === session.path.length - 1 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
            )} />
            {i < session.path.length - 1 && (
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
            )}
          </div>
          <div className="text-sm pb-3">
            <span className="font-medium text-gray-900 dark:text-white">{page}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function HeatmapPreview() {
  const maxClicks = Math.max(...MOCK_HEATMAP_AREAS.map(a => a.clicks))
  return (
    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
        Page Preview
      </div>
      {MOCK_HEATMAP_AREAS.map((area, i) => {
        const intensity = area.clicks / maxClicks
        return (
          <div
            key={i}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: area.x,
              top: area.y,
              width: 20 + intensity * 40,
              height: 20 + intensity * 40,
              background: `radial-gradient(circle, rgba(239,68,68,${0.3 + intensity * 0.5}) 0%, transparent 70%)`,
            }}
            title={`${area.label}: ${area.clicks} clicks`}
          />
        )
      })}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function UserSessionsPage() {
  const [selectedSession, setSelectedSession] = useState(MOCK_SESSIONS[0].id)
  const [tab, setTab] = useState('sessions')
  const session = MOCK_SESSIONS.find(s => s.id === selectedSession)

  return (
    <PageLayout>
      <Header title="User Sessions" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Sessions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Replay sessions, view journeys, and analyze click heatmaps
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['sessions', 'heatmaps'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                  t === tab
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'sessions' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Session list */}
            <div className="lg:col-span-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              {/* Search bar */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions by user, page, or country..."
                  className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
              </div>

              {/* Session rows */}
              {MOCK_SESSIONS.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isSelected={s.id === selectedSession}
                  onSelect={setSelectedSession}
                />
              ))}
            </div>

            {/* Session detail */}
            {session && (
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Session Detail</h3>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity">
                      <Play className="w-3 h-3" />
                      Replay
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">User</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.userId || 'Anonymous'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.city}, {session.country}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Device</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.os} · {session.browser}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Duration</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.duration}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Pages</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.pages}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Clicks</span>
                      <p className="font-medium text-gray-900 dark:text-white">{session.clicks}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">User Journey</h4>
                    <UserJourney session={session} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'heatmaps' && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Click Heatmap — /pricing</h3>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option>/pricing</option>
                    <option>/</option>
                    <option>/features</option>
                    <option>/docs</option>
                  </select>
                  <span className="text-xs text-gray-400">Last 7 days · 1,432 sessions</span>
                </div>
              </div>
              <HeatmapPreview />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MOCK_HEATMAP_AREAS.map((area, i) => (
                  <div key={i} className="text-center px-2 py-2 rounded-md bg-gray-50 dark:bg-gray-750">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{area.label}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{area.clicks}</div>
                    <div className="text-[10px] text-gray-400">clicks</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
