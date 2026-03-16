// @custom — Letterflow landing page: newsletter platform for creators
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Mail, Users, BarChart3, Zap, Palette, TestTube2, FileDown } from 'lucide-react'
import { Button } from '../../../components/@system/ui/button'
import { Header } from '../../../components/@system/Header/Header'
import { Footer } from '../../../components/@system/Footer/Footer'
import { Card, CardContent } from '../../../components/@system/Card/Card'
import { FeaturesSection } from '../../../components/@system/FeaturesSection'
import { OgMeta } from '../../../components/@system/OgMeta/OgMeta'
import { info } from '../../../../config/@system/info'

const PRODUCT_FEATURES = [
  {
    icon: Mail,
    title: 'Newsletter Editor',
    description: 'Rich text block editor with drag-and-drop sections, inline images, reusable templates, and mobile preview. Supports HTML export and scheduled publishing.',
  },
  {
    icon: Users,
    title: 'Subscriber Management',
    description: 'Import subscribers via CSV or API. Segment by tags, signup source, engagement level, or custom fields. Automatic bounce and unsubscribe handling.',
  },
  {
    icon: Zap,
    title: 'Email Sending',
    description: 'Send campaigns via Resend or AWS SES. SPF/DKIM setup wizard, deliverability scoring, send-time optimization, and automatic list hygiene.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Per-campaign open rate, click rate, unsubscribes, and growth trends. Subscriber growth chart, geo distribution, and top content ranking.',
  },
  {
    icon: Zap,
    title: 'Automation Sequences',
    description: 'Multi-step drip campaigns triggered by signup, tag, or date. Visual sequence builder with delay nodes, conditional branches, and per-step metrics.',
  },
  {
    icon: Palette,
    title: 'Landing Pages',
    description: 'Drag-and-drop landing page builder for newsletter signups. Custom domains, embedded forms, social proof widgets, and conversion tracking.',
  },
  {
    icon: TestTube2,
    title: 'A/B Testing',
    description: 'Split-test subject lines, sender names, content blocks, and send times. Automatic winner selection based on open rate or click rate.',
  },
  {
    icon: FileDown,
    title: 'Import / Export',
    description: 'One-click import from Mailchimp, Substack, ConvertKit, or CSV. Export subscriber lists and campaign history. GDPR-compliant data portability.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: [
      'Up to 2,500 subscribers',
      'Unlimited newsletters',
      'Newsletter editor',
      'Basic analytics',
      'Landing page',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$29',
    period: '/month',
    features: [
      'Up to 25,000 subscribers',
      'Automation sequences',
      'A/B testing',
      'Advanced analytics',
      'Custom domains',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '$79',
    period: '/month',
    features: [
      'Unlimited subscribers',
      'Everything in Growth',
      'Ad network monetization',
      'Dedicated IP',
      'API access',
      'SLA guarantee',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OgMeta
        title={`${info.name} — Write. Land. Earn.`}
        description="The newsletter platform for creators. Beautiful editor, powerful automations, deliverability tools, and monetization — all in one place."
        url={info.url}
      />
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14 sm:py-20 md:py-28 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-6">
          The newsletter platform for creators
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Write. Land. Earn.
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Beautiful editor, powerful automations, deliverability tools, and monetization — everything you need to grow your newsletter and earn from your audience.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto sm:min-w-[200px]">
              Start Writing Free <ArrowRight className="h-4 w-4" />
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
              <div className="text-2xl sm:text-3xl font-bold">50M+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Emails sent</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">12K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Creators</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">99.5%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Deliverability</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">48%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Avg open rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <FeaturesSection
        features={PRODUCT_FEATURES}
        heading="Everything you need to grow your newsletter"
        subheading="From writing to sending to earning — a complete platform built for creators."
      />

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="border-t bg-muted/10">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Launch your newsletter in minutes</h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              No tech skills needed. Start writing and growing your audience today.
            </p>
          </div>
          <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Write', desc: 'Craft beautiful newsletters with our block editor. Drag-and-drop sections, inline images, and mobile-ready templates.' },
              { step: '2', title: 'Land', desc: 'Reach every inbox with SPF/DKIM authentication, deliverability scoring, and send-time optimization built in.' },
              { step: '3', title: 'Earn', desc: 'Monetize with paid subscriptions, ad network revenue, and sponsorship tools. Your audience, your income.' },
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
            Start free with 2,500 subscribers. Scale as you grow.
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to grow your newsletter?</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators already using {info.name} to write, land, and earn.
          </p>
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center">
            <Link to="/register" className="w-full max-w-xs sm:w-auto">
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
