/**
 * @custom ApiAccessPage — API key management, webhook config, and developer docs
 * Create/revoke API keys, set permissions, view usage stats, configure webhooks,
 * and browse endpoint documentation.
 */
import { useState, useCallback } from 'react'
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  Webhook,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Shield,
  AlertTriangle,
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

// ─── Mock data ────────────────────────────────────────────────────
const INITIAL_KEYS = [
  {
    id: 'key_001',
    name: 'Production Dashboard',
    key: 'ak_live_4F46E5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
    created: '2025-11-12',
    lastUsed: '2 hours ago',
    permissions: ['read:analytics', 'read:events', 'read:sessions'],
    rateLimit: 10000,
    usageToday: 4823,
    usageMonth: 142567,
    status: 'active',
  },
  {
    id: 'key_002',
    name: 'Internal Reporting',
    key: 'ak_live_0EA5E9z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5',
    created: '2025-10-03',
    lastUsed: 'Yesterday',
    permissions: ['read:analytics', 'read:pageviews'],
    rateLimit: 5000,
    usageToday: 1234,
    usageMonth: 38921,
    status: 'active',
  },
  {
    id: 'key_003',
    name: 'Legacy Webhook Relay',
    key: 'ak_live_8B5CF6a1a2a3a4a5a6a7a8a9b0b1b2b3b4b5',
    created: '2025-08-22',
    lastUsed: '3 weeks ago',
    permissions: ['read:analytics'],
    rateLimit: 1000,
    usageToday: 0,
    usageMonth: 201,
    status: 'inactive',
  },
]

const ALL_PERMISSIONS = [
  { id: 'read:analytics', label: 'Read Analytics', description: 'Overview, trends, and stats' },
  { id: 'read:events',    label: 'Read Events',    description: 'Raw event stream' },
  { id: 'read:sessions',  label: 'Read Sessions',  description: 'Session list and detail' },
  { id: 'read:pageviews', label: 'Read Pageviews', description: 'Pageview data and top pages' },
  { id: 'read:funnels',   label: 'Read Funnels',   description: 'Funnel configs and data' },
  { id: 'write:funnels',  label: 'Write Funnels',  description: 'Create and update funnels' },
]

const API_DOCS = [
  {
    method: 'GET',
    path: '/api/web-analytics/overview',
    description: 'Dashboard stats: visitors, sessions, pageviews, bounce rate',
    params: 'start, end (ISO dates)',
    example: '{"visitors": 14823, "sessions": 19204, "pageviews": 47391, "bounce_rate": 42.3}',
  },
  {
    method: 'GET',
    path: '/api/web-analytics/pageviews',
    description: 'Pageviews over time with date/country/device filters',
    params: 'start, end, interval (day|week|month), country, device',
    example: '[{"date": "2026-03-10", "visitors": 482, "pageviews": 1203}]',
  },
  {
    method: 'GET',
    path: '/api/web-analytics/top-pages',
    description: 'Top pages ranked by unique visitors',
    params: 'start, end, limit (default 20)',
    example: '[{"path": "/pricing", "visitors": 2943, "views": 4120, "bounce_rate": 44.7}]',
  },
  {
    method: 'GET',
    path: '/api/web-analytics/events',
    description: 'Event list with type counts and recent occurrences',
    params: 'start, end, event_name, limit, offset',
    example: '[{"event_name": "signup", "count": 312, "last_seen": "2026-03-14T10:23:00Z"}]',
  },
  {
    method: 'GET',
    path: '/api/web-analytics/sessions',
    description: 'Paginated session list with journey metadata',
    params: 'start, end, country, device, limit, offset',
    example: '[{"id": "sess_0001", "duration": 143, "pages_count": 4, "country": "US"}]',
  },
  {
    method: 'POST',
    path: '/api/collect',
    description: 'Public ingest endpoint — send events from your tracking script',
    params: 'Body: { site_id, event_name, url, referrer, properties }',
    example: '{"ok": true, "event_id": "evt_abc123"}',
  },
]

// ─── Component ────────────────────────────────────────────────────
export { ApiAccessPage }
export default function ApiAccessPage() {
  const [keys, setKeys]             = useState(INITIAL_KEYS)
  const [showModal, setShowModal]   = useState(false)
  const [newKeyResult, setNewKeyResult] = useState(null)
  const [copiedId, setCopiedId]     = useState(null)
  const [revealedId, setRevealedId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [docsOpen, setDocsOpen]     = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.yourapp.com/analytics')
  const [webhookSaved, setWebhookSaved] = useState(false)

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleCreate = useCallback((name, permissions) => {
    const newKey = {
      id: `key_${Date.now()}`,
      name,
      key: `ak_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions,
      rateLimit: 5000,
      usageToday: 0,
      usageMonth: 0,
      status: 'active',
    }
    setKeys((prev) => [newKey, ...prev])
    setNewKeyResult(newKey)
    setShowModal(false)
  }, [])

  const handleRevoke = useCallback((id) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    setDeleteConfirmId(null)
  }, [])

  const handleSaveWebhook = useCallback(() => {
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 2000)
  }, [])

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: C.textDark }}>API Access</h1>
            <p className="text-sm text-slate-500 mt-1">Manage API keys, configure webhooks, and explore the REST API</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setNewKeyResult(null) }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.primary }}
          >
            <Plus size={15} />
            New API Key
          </button>
        </div>

        {/* New key result banner */}
        {newKeyResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-800">API key created — save it now!</p>
                <p className="text-xs text-emerald-600 mt-0.5">This is the only time you can see the full key.</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="text-xs font-mono bg-white border border-emerald-200 rounded px-2 py-1 text-emerald-800 break-all">
                    {newKeyResult.key}
                  </code>
                  <button
                    onClick={() => handleCopy(newKeyResult.key, 'banner')}
                    className="flex-shrink-0 p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                  >
                    {copiedId === 'banner' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <button onClick={() => setNewKeyResult(null)} className="p-1 rounded hover:bg-emerald-100 transition-colors">
                <X size={15} className="text-emerald-600" />
              </button>
            </div>
          </div>
        )}

        {/* API Keys list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <KeyRound size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">API Keys</h2>
            <span className="ml-auto text-xs text-slate-400">{keys.length} key{keys.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {keys.map((k) => (
              <ApiKeyRow
                key={k.id}
                apiKey={k}
                revealed={revealedId === k.id}
                onToggleReveal={() => setRevealedId(revealedId === k.id ? null : k.id)}
                onCopy={() => handleCopy(k.key, k.id)}
                copied={copiedId === k.id}
                confirmingDelete={deleteConfirmId === k.id}
                onDeleteClick={() => setDeleteConfirmId(k.id)}
                onDeleteConfirm={() => handleRevoke(k.id)}
                onDeleteCancel={() => setDeleteConfirmId(null)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webhook config */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Webhook size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Webhook Configuration</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Receive real-time POST requests when new events are ingested. Useful for server-side processing or alerting.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="https://yourdomain.com/webhooks/analytics"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Events to Forward</label>
                <div className="flex flex-wrap gap-2">
                  {['pageview', 'custom_event', 'session_end', 'goal_conversion'].map((evt) => (
                    <label key={evt} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input type="checkbox" defaultChecked={evt === 'goal_conversion'} className="rounded" />
                      {evt}
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveWebhook}
                className="w-full py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: C.primary }}
              >
                {webhookSaved ? <><Check size={14} /> Saved!</> : 'Save Webhook'}
              </button>
            </div>
          </div>

          {/* Usage per key summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Usage Summary</h2>
            </div>
            <div className="space-y-3">
              {keys.filter((k) => k.status === 'active').map((k) => (
                <div key={k.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium truncate max-w-[160px]">{k.name}</span>
                    <span className="text-slate-400">
                      {k.usageToday.toLocaleString()} / {k.rateLimit.toLocaleString()} today
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((k.usageToday / k.rateLimit) * 100, 100)}%`,
                        backgroundColor: k.usageToday / k.rateLimit > 0.8 ? C.warning : C.primary,
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {k.usageMonth.toLocaleString()} requests this month
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Docs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">API Reference</h2>
            </div>
            {docsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {docsOpen && (
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              {API_DOCS.map((doc, i) => (
                <DocRow key={i} doc={doc} onCopyExample={() => handleCopy(doc.example, `doc-${i}`)} copied={copiedId === `doc-${i}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create key modal */}
      {showModal && (
        <CreateKeyModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          allPermissions={ALL_PERMISSIONS}
        />
      )}
    </AnalyticsLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function ApiKeyRow({ apiKey: k, revealed, onToggleReveal, onCopy, copied, confirmingDelete, onDeleteClick, onDeleteConfirm, onDeleteCancel }) {
  const maskedKey = k.key.slice(0, 12) + '••••••••••••••••••••' + k.key.slice(-4)

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-slate-800">{k.name}</span>
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs font-medium',
              k.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            )}>
              {k.status}
            </span>
          </div>
          {/* Key display */}
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 truncate max-w-xs">
              {revealed ? k.key : maskedKey}
            </code>
            <button onClick={onToggleReveal} className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400">
              {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button onClick={onCopy} className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400">
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Created {k.created}</span>
            <span>·</span>
            <span>Last used {k.lastUsed}</span>
            <span>·</span>
            <span>{k.usageToday.toLocaleString()} req today</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Shield size={10} />
              {k.rateLimit.toLocaleString()}/day limit
            </span>
          </div>
          {/* Permissions */}
          <div className="flex flex-wrap gap-1 mt-2">
            {k.permissions.map((p) => (
              <span key={p} className="px-1.5 py-0.5 rounded text-xs bg-indigo-50 text-indigo-600 font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>
        {/* Delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} /> Revoke?
              </span>
              <button
                onClick={onDeleteConfirm}
                className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={onDeleteCancel}
                className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={onDeleteClick}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DocRow({ doc, onCopyExample, copied }) {
  const [open, setOpen] = useState(false)
  const methodColors = {
    GET:  'bg-blue-50 text-blue-700',
    POST: 'bg-emerald-50 text-emerald-700',
    PUT:  'bg-amber-50 text-amber-700',
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <span className={cn('px-2 py-0.5 rounded text-xs font-bold font-mono', methodColors[doc.method] || 'bg-slate-100 text-slate-600')}>
          {doc.method}
        </span>
        <code className="text-sm font-mono text-slate-700">{doc.path}</code>
        <span className="text-sm text-slate-400 ml-2 hidden sm:inline">{doc.description}</span>
        <span className="ml-auto">
          {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-3 bg-slate-50 border-t border-slate-100">
          <div className="pt-3">
            <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
            <p className="text-sm text-slate-700">{doc.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Parameters</p>
            <p className="text-sm text-slate-600 font-mono text-xs">{doc.params}</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-500">Example Response</p>
              <button
                onClick={onCopyExample}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {copied ? <><Check size={11} className="text-emerald-500" /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto">
              {doc.example}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateKeyModal({ onClose, onCreate, allPermissions }) {
  const [name, setName]       = useState('')
  const [selected, setSelected] = useState(['read:analytics'])

  const toggle = (perm) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || selected.length === 0) return
    onCreate(name.trim(), selected)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <KeyRound size={16} className="text-slate-400" />
            Create API Key
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Dashboard"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
            <div className="space-y-2">
              {allPermissions.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    selected.includes(p.id)
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{p.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selected.length === 0}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: C.primary }}
            >
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
