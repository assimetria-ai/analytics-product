// @custom — Analytics Product landing page: privacy-first product analytics
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../../../components/@system/ui/button'
import { Header } from '../../../components/@system/Header/Header'
import { Footer } from '../../../components/@system/Footer/Footer'
import { Card, CardContent } from '../../../components/@system/Card/Card'
import { FeaturesSection } from '../../../components/@system/FeaturesSection'
import { OgMeta } from '../../../components/@system/OgMeta/OgMeta'
import { info } from '../../../../config'
import { ANALYTICS_FEATURES, FEATURES_HEADING, FEATURES_SUBHEADING } from '../../../../config/@custom/features'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 10K events/month',
      'Core analytics dashboard',
      'Real-time page views',
      '1 project',
      '30-day data retention',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    features: [
      'Unlimited events',
      'Funnels and retention',
      'Session replay',
      'Error tracking',
      'Unlimited projects',
      '1-year data retention',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'SSO / SAML',
      'Custom integrations',
      'Unlimited data retention',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    ctaLink: '/register',
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OgMeta
        title={`${info.name} — ${info.tagline}`}
        description="Privacy-first product analytics for SaaS founders. Real-time dashboards, funnels, error tracking, and session replay — all without cookies."
        url={info.url}
      />
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-6">
          Privacy-first product analytics
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          See everything. Miss nothing.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Real-time dashboards, conversion funnels, error tracking, and session replay — all without third-party cookies. GDPR-compliant by default.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
              Start Tracking Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto sm:min-w-[200px]">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">500M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Events tracked</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">2K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">SaaS teams</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">&lt;1KB</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Script size</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">0</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Cookies needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <FeaturesSection
        features={ANALYTICS_FEATURES}
        heading={FEATURES_HEADING}
        subheading={FEATURES_SUBHEADING}
      />

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/10">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Up and running in 2 minutes</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              One script tag. Real-time data. No configuration needed.
            </p>
          </div>
          <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Add the script', desc: 'Paste a single line of JavaScript into your app. Under 1KB, loads async, zero impact on page speed.' },
              { step: '2', title: 'See your data', desc: 'Page views, sessions, referrers, and custom events appear in your dashboard in real time.' },
              { step: '3', title: 'Go deeper', desc: 'Build funnels, track errors, replay sessions, and segment users — all from one unified platform.' },
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
            Start free with 10K events. Scale as your product grows.
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to own your analytics?</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join SaaS founders who track smarter with {info.name}. No cookies, no compromise.
          </p>
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center">
            <Link to="/register" className="w-full max-w-xs sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
