// @custom — Embed setup page for the Analytics Product
import { useState } from 'react'
import { Code2, Copy, Check, ExternalLink, Globe, Zap, Shield } from 'lucide-react'
import { Header } from '../../../components/@system/Header/Header'
import { AnalyticsLayout } from '../../../components/@custom/AnalyticsLayout'
import { cn } from '../../../lib/@system/utils'

const SITE_ID_PLACEHOLDER = 'YOUR_SITE_ID'

function CodeBlock({ code, language = 'html' }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/80">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-4 text-sm overflow-x-auto text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function StepCard({ number, title, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-3">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  )
}

export function EmbedSetupPage() {
  const [siteId, setSiteId] = useState('')
  const displayId = siteId.trim() || SITE_ID_PLACEHOLDER

  const scriptSnippet = `<script>
  (function(a,n,l,y,t,i,c,s){
    a[t]=a[t]||function(){(a[t].q=a[t].q||[]).push(arguments)};
    i=n.createElement(l);i.async=1;i.src=y;
    c=n.getElementsByTagName(l)[0];c.parentNode.insertBefore(i,c);
  })(window,document,'script','https://your-domain.com/embed.js','analytics');
  analytics('init', '${displayId}');
</script>`

  const npmSnippet = `import analytics from '@analytics-product/tracker'

analytics.init('${displayId}')

// Track a custom event
analytics.track('button_clicked', { label: 'Get Started' })

// Track a page view manually
analytics.page()`

  const reactSnippet = `// In your app root (e.g., main.jsx or App.jsx)
import { useEffect } from 'react'

export function App() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://your-domain.com/embed.js'
    script.async = true
    script.onload = () => window.analytics?.('init', '${displayId}')
    document.head.appendChild(script)
  }, [])

  return <YourApp />
}`

  return (
    <AnalyticsLayout>
      <Header title="Embed Setup" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Embed Setup
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add the tracking script to your site to start collecting analytics data.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'Lightweight', desc: '< 2KB gzipped — no performance impact' },
            { icon: Shield, title: 'Privacy-first', desc: 'No cookies, GDPR compliant by default' },
            { icon: Globe, title: 'Works everywhere', desc: 'Any site: HTML, React, Vue, Next.js' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary flex-shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Site ID configuration */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Your Site ID
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Enter your site ID to personalise the code snippets below. Find your site ID in your account settings or API Keys page.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="e.g. site_abc123xyz"
              className={cn(
                'flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              )}
            />
            {siteId && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Set
              </span>
            )}
          </div>
        </div>

        {/* Installation steps */}
        <StepCard number={1} title="Add the script to your HTML">
          <p className="text-sm text-muted-foreground mb-3">
            Paste this snippet into the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;head&gt;</code> of every page you want to track, or in your site-wide layout template.
          </p>
          <CodeBlock code={scriptSnippet} language="html" />
        </StepCard>

        <StepCard number={2} title="Verify tracking is working">
          <p className="text-sm text-muted-foreground mb-3">
            Visit your site and check the <span className="font-medium text-foreground">Analytics</span> page. You should see a pageview appear within a few seconds.
          </p>
          <div className="rounded-md bg-muted/60 border border-border px-4 py-3 text-sm text-muted-foreground">
            Open your browser console and run <code className="text-xs bg-background border border-border px-1.5 py-0.5 rounded">window.analytics</code> — if it returns a function, the script is loaded.
          </div>
        </StepCard>

        <StepCard number={3} title="Track custom events (optional)">
          <p className="text-sm text-muted-foreground mb-3">
            Call <code className="text-xs bg-muted px-1.5 py-0.5 rounded">analytics('track', eventName, properties)</code> to track custom user actions like button clicks, form submissions, or purchases.
          </p>
          <CodeBlock
            code={`// Track a button click
analytics('track', 'button_clicked', { label: 'Get Started', page: '/pricing' })

// Track a form submission
analytics('track', 'form_submitted', { form: 'signup', plan: 'pro' })

// Track a purchase
analytics('track', 'purchase', { amount: 49, currency: 'USD', plan: 'pro' })`}
            language="javascript"
          />
        </StepCard>

        {/* React / SPA integration */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">React / SPA Integration</h2>
          <p className="text-sm text-muted-foreground">
            For single-page apps, initialise the tracker once in your root component. Page changes are tracked automatically via history events.
          </p>
          <CodeBlock code={reactSnippet} language="jsx" />
        </div>

        {/* API Keys link */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Need an API key?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate server-side API keys to send events from your backend or CI pipelines.
            </p>
          </div>
          <a
            href="/app/api-keys"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex-shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            API Keys
          </a>
        </div>
      </div>
    </AnalyticsLayout>
  )
}
