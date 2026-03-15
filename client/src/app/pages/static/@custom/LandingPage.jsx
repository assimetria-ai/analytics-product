// @custom — Analytics Product landing page with product-specific features, pricing, and CTAs
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Code, Activity, BarChart3, GitBranch, Bug, Eye, Webhook } from 'lucide-react'
import { Button } from '../../../components/@system/ui/button'
import { Header } from '../../../components/@system/Header/Header'
import { Footer } from '../../../components/@system/Footer/Footer'
import { Card, CardContent } from '../../../components/@system/Card/Card'
import { FeaturesSection } from '../../../components/@system/FeaturesSection'
import { OgMeta } from '../../../components/@system/OgMeta/OgMeta'
import { info } from '../../../../config/@system/info'

const PRODUCT_FEATURES = [
  {
    icon: Code,
    title: 'Embed Script',
    description: 'Lightweight JS snippet (<1KB gzipped). One-line install, no cookies by default, GDPR-compliant. Auto-captures page views and clicks.',
  },
  {
    icon: Activity,
    title: 'Event Tracking',
    description: 'Auto-capture page views, clicks, and form submissions. Custom event API for tracking business-specific actions. Retroactive event definition.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Real-time analytics showing visitors, sessions, bounce rate, top pages, referrers, UTM breakdown, and geographic data with customizable date ranges.',
  },
  {
    icon: GitBranch,
    title: 'Funnels',
    description: 'Define multi-step conversion funnels. Visualize drop-off at each step. Filter by user properties, time range, or cohort.',
  },
  {
    icon: Bug,
    title: 'Error Tracking',
    description: 'Sentry-like error capture: automatic JS error collection, stack traces with source map support, error grouping, deduplication, and alert notifications.',
  },
  {
    icon: Eye,
    title: 'User Sessions',
    description: 'Session replay with lightweight DOM snapshots. User journey visualization showing page flow, navigation paths, and click heatmaps.',
  },
  {
    icon: Webhook,
    title: 'API Access',
    description: 'REST API for querying all analytics data programmatically. Webhook support for real-time event forwarding. API key authentication with rate limiting.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 10K events/month',
      'Basic dashboard',
      'Event tracking',
      '7-day data retention',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/auth?tab=register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    features: [
      'Unlimited events',
      'Funnels & sessions',
      'Error tracking',
      '12-month data retention',
      'API access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/auth?tab=register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'SLA guarantee',
      'Dedicated support',
      'SSO & audit logs',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    ctaLink: `mailto:${info.supportEmail}`,
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OgMeta
        title={`${info.name} — See everything. Miss nothing.`}
        description="Privacy-first analytics with real-time dashboards, conversion funnels, error tracking, and session replay. One script, full visibility."
        url={info.url}
      />
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-6">
          Privacy-first analytics
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          See everything. Miss nothing.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Drop in a single script and get real-time dashboards, conversion funnels, error tracking, and session replay — all without cookies or complex setup.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link to="/auth?tab=register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
              Start Tracking Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/docs" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto sm:min-w-[200px]">
              View Documentation
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">1.2B+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Events tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">3K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Sites monitored</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">&lt;1KB</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Script size</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <FeaturesSection
        features={PRODUCT_FEATURES}
        heading="Full-stack product analytics"
        subheading="From page views to error traces — everything you need to understand your users."
      />

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/10">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Up and running in minutes</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              One script. No build step. No complex configuration.
            </p>
          </div>
          <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Install', desc: 'Add a single script tag to your site. Under 1KB gzipped, loads async, zero performance impact.' },
              { step: '2', title: 'Configure', desc: 'Set up custom events, funnels, and alerts from the dashboard. No code changes needed after install.' },
              { step: '3', title: 'Analyze', desc: 'Watch real-time data flow in. Dashboards, funnels, session replay, and error tracking — all automatic.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as you grow.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? 'border-primary shadow-lg' : ''}
            >
              <CardContent className="pt-5 sm:pt-6 px-4 sm:px-6 space-y-3 sm:space-y-4">
                {plan.highlighted && (
                  <span className="inline-block rounded-full bg-primary px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xs sm:text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.ctaLink} className="block">
                  <Button
                    className="w-full"
                    size="default"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-10 sm:py-14 md:py-16 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to see everything?</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams already using {info.name} for product analytics.
          </p>
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center">
            <Link to="/auth?tab=register" className="w-full max-w-xs sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
