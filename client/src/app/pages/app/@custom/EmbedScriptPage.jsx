/**
 * @custom EmbedScriptPage — Tracking snippet setup & site configuration
 * Copy embed code, configure privacy settings, set auto-capture options,
 * view installation guides for HTML/React/Next.js/Vue, verify live status.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Code2,
  Copy,
  Check,
  Globe,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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

// ─── Snippet generators ───────────────────────────────────────────
function genHtmlSnippet(domain, cookieless) {
  return `<!-- Analytics Tracking Script -->
<script>
  window.analyticsConfig = {
    siteId: 'site_${domain.replace(/\W/g, '').slice(0, 8).toLowerCase()}',
    apiHost: 'https://api.analytics.example.com',${cookieless ? '\n    cookieless: true,' : ''}
    autoCapture: true
  };
</script>
<script src="https://cdn.analytics.example.com/tracker.min.js" async defer></script>`
}

function genReactSnippet(domain) {
  return `// Install: npm install @analytics/tracker
import { Analytics } from '@analytics/tracker'

// In your app root (e.g. main.jsx / _app.tsx)
Analytics.init({
  siteId: 'site_${domain.replace(/\W/g, '').slice(0, 8).toLowerCase()}',
  apiHost: 'https://api.analytics.example.com',
  autoCapture: true,
})

// Track custom events anywhere
Analytics.track('signup', { plan: 'pro' })
Analytics.identify('user_123', { name: 'Jane Doe' })`
}

function genNextSnippet(domain) {
  return `// In app/layout.tsx (App Router) or pages/_app.tsx (Pages Router)
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://cdn.analytics.example.com/tracker.min.js"
          strategy="afterInteractive"
          data-site-id="site_${domain.replace(/\W/g, '').slice(0, 8).toLowerCase()}"
          data-api-host="https://api.analytics.example.com"
        />
      </body>
    </html>
  )
}`
}

function genVueSnippet(domain) {
  return `// Install: npm install @analytics/vue-plugin
// In main.js or main.ts
import { createApp } from 'vue'
import { AnalyticsPlugin } from '@analytics/vue-plugin'
import App from './App.vue'

const app = createApp(App)

app.use(AnalyticsPlugin, {
  siteId: 'site_${domain.replace(/\W/g, '').slice(0, 8).toLowerCase()}',
  apiHost: 'https://api.analytics.example.com',
  autoCapture: true,
})

app.mount('#app')`
}

// ─── Component ────────────────────────────────────────────────────
export { EmbedScriptPage }
export default function EmbedScriptPage() {
  const [domain, setDomain]             = useState('myapp.example.com')
  const [cookieless, setCookieless]     = useState(false)
  const [anonIP, setAnonIP]             = useState(true)
  const [capturePageviews, setCapturePageviews] = useState(true)
  const [captureClicks, setCaptureClicks]       = useState(true)
  const [captureForms, setCaptureForms]         = useState(false)
  const [activeTab, setActiveTab]       = useState('html')
  const [copied, setCopied]             = useState(false)
  const [verifyStatus, setVerifyStatus] = useState('idle') // idle | checking | live | not-found
  const [domainEditing, setDomainEditing] = useState(false)

  const snippets = {
    html:    genHtmlSnippet(domain, cookieless),
    react:   genReactSnippet(domain),
    nextjs:  genNextSnippet(domain),
    vue:     genVueSnippet(domain),
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(snippets[activeTab]).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [snippets, activeTab])

  const handleVerify = useCallback(() => {
    setVerifyStatus('checking')
    // Simulate verification check
    setTimeout(() => {
      setVerifyStatus(Math.random() > 0.4 ? 'live' : 'not-found')
    }, 2200)
  }, [])

  const tabs = [
    { id: 'html',   label: 'HTML' },
    { id: 'react',  label: 'React' },
    { id: 'nextjs', label: 'Next.js' },
    { id: 'vue',    label: 'Vue' },
  ]

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: C.textDark }}>Embed Script</h1>
          <p className="text-sm text-slate-500 mt-1">Install the tracking snippet on your site to start collecting data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Snippet + install tabs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Site domain */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Site Domain</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onFocus={() => setDomainEditing(true)}
                    onBlur={() => setDomainEditing(false)}
                    className={cn(
                      'w-full px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none transition-all',
                      domainEditing
                        ? 'border-indigo-400 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                    placeholder="yourdomain.com"
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={verifyStatus === 'checking'}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {verifyStatus === 'checking' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Verify
                </button>
              </div>
              {/* Verification status */}
              {verifyStatus !== 'idle' && verifyStatus !== 'checking' && (
                <div className={cn(
                  'mt-3 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
                  verifyStatus === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                )}>
                  {verifyStatus === 'live'
                    ? <><CheckCircle2 size={15} /> Script detected — data is flowing in!</>
                    : <><XCircle size={15} /> Script not found on <span className="font-mono">{domain}</span> — check your installation</>
                  }
                </div>
              )}
              {verifyStatus === 'checking' && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={14} className="animate-spin" />
                  Checking <span className="font-mono text-slate-700">{domain}</span> for the tracking script…
                </div>
              )}
            </div>

            {/* Installation snippet */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Installation Snippet</h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      'px-4 py-2.5 text-xs font-medium transition-colors',
                      activeTab === t.id
                        ? 'text-indigo-700 border-b-2 border-indigo-500 bg-white'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <div className="relative">
                <pre className="p-5 text-xs leading-relaxed text-slate-700 font-mono overflow-x-auto bg-slate-900 text-slate-100 whitespace-pre">
                  {snippets[activeTab]}
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <InstallInstructions activeTab={activeTab} />
          </div>

          {/* Right: Settings */}
          <div className="space-y-4">
            {/* Privacy settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Privacy Settings</h2>
              </div>
              <div className="space-y-4">
                <ToggleRow
                  label="Cookie-less Tracking"
                  description="Track visitors without cookies. GDPR-friendly but may slightly reduce accuracy."
                  checked={cookieless}
                  onChange={setCookieless}
                />
                <ToggleRow
                  label="IP Anonymization"
                  description="Hash visitor IP addresses before storage. Recommended for EU compliance."
                  checked={anonIP}
                  onChange={setAnonIP}
                />
              </div>
            </div>

            {/* Auto-capture */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Auto-capture Events</h2>
              </div>
              <div className="space-y-4">
                <ToggleRow
                  label="Pageview Events"
                  description="Automatically track page loads and SPA navigation."
                  checked={capturePageviews}
                  onChange={setCapturePageviews}
                />
                <ToggleRow
                  label="Click Events"
                  description="Capture all user click interactions with element metadata."
                  checked={captureClicks}
                  onChange={setCaptureClicks}
                />
                <ToggleRow
                  label="Form Submissions"
                  description="Track form submit events (field values are never captured)."
                  checked={captureForms}
                  onChange={setCaptureForms}
                />
              </div>
              <button
                className="mt-5 w-full py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: C.primary }}
                onMouseEnter={(e) => (e.target.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.target.style.opacity = 1)}
              >
                Save Settings
              </button>
            </div>

            {/* Stats summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Data Received Today</h2>
              <div className="space-y-2">
                {[
                  { label: 'Pageviews',  value: '3,421' },
                  { label: 'Events',     value: '892' },
                  { label: 'Sessions',   value: '1,087' },
                  { label: 'Visitors',   value: '743' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-mono font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 size={12} />
                Script active and receiving data
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsLayout>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start gap-3">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors',
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
    </div>
  )
}

function InstallInstructions({ activeTab }) {
  const [open, setOpen] = useState(true)

  const instructions = {
    html: [
      'Copy the snippet above.',
      'Paste it before the closing </body> tag in your HTML file.',
      'Deploy your site and click Verify to confirm the script is live.',
    ],
    react: [
      'Install the package: npm install @analytics/tracker',
      'Call Analytics.init() once at the root of your app (before rendering).',
      'Use Analytics.track() to send custom events from any component.',
    ],
    nextjs: [
      'Add the <Script> tag to your root layout (App Router) or _app.tsx (Pages Router).',
      'Use strategy="afterInteractive" to avoid blocking page load.',
      'The script auto-detects SPA navigation and tracks route changes.',
    ],
    vue: [
      'Install the plugin: npm install @analytics/vue-plugin',
      'Register the plugin in main.js before app.mount().',
      'The plugin injects $analytics into every component for custom tracking.',
    ],
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <span>Installation Steps</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {instructions[activeTab].map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: C.primary }}
              >
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
