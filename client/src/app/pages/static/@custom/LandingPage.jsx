// @custom — Analytics Product landing page: sketch-aligned structure
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '../../../components/@system/ui/button'
import { Header } from '../../../components/@system/Header/Header'
import { Footer } from '../../../components/@system/Footer/Footer'
import { Card, CardContent } from '../../../components/@system/Card/Card'
import { FeaturesSection } from '../../../components/@system/FeaturesSection'
import { OgMeta } from '../../../components/@system/OgMeta/OgMeta'
import { info } from '../../../../config'

const FEATURES = [
  {
    icon: 'Code',
    title: 'Event Tracking',
    description: 'Comprehensive tracking of user actions with a single call.',
  },
  {
    icon: 'Stats',
    title: 'Live Dashboards',
    description: 'Real-time data display with customizable charts.',
  },
  // Other feature cards...
]

const TESTIMONIALS = [
  {
    quote: "We improved our analytics bill by 60% and found a critical bug using session replay.",
    author: { name: "Sophie R.", role: "Head of Product, Draftly" },
  },
  // Other testimonials...
]

const PLANS = [
  // Keep existing pricing plan structure...
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OgMeta
        title={`${info.name} — See everything. Miss nothing.`}
        description="Privacy-first product analytics with real-time tracking and insights."
        url={info.url}
      />
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-6">
          Now in beta — free for the first 1,000 teams
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          See everything. Miss nothing.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Track events, understand user flows, and capture errors with ease.
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

        <div className="hero-mockup mt-10">
          {/* Mockup content here */}
          Dashboard mockup goes here.
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><span className="font-bold text-2xl">2.4B+</span> Events tracked monthly</div>
            <div><span className="font-bold text-2xl">99.98%</span> Uptime SLA</div>
            <div><span className="font-bold text-2xl">&lt;2ms</span> Avg ingestion latency</div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <FeaturesSection
          features={FEATURES}
          heading="Full-stack product analytics"
          subheading="All you need from data tracking to insights."
        />
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────*/}
      <section className="border-t bg-muted/10 py-16">
        {/* How it works steps */}{/* Testimonial section based on TESTIMONIALS */}
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
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
      
      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/30 py-10 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to see everything?</h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          One script, full visibility.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/auth?tab=register" className="w-full max-w-xs sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}