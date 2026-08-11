import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import { Reveal } from '../components/Layout'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'A gentle introduction with limited sessions to begin your practice.',
    features: [
      '5 guided meditations',
      '2 sleep soundscapes',
      'Basic mood logging',
      'Community newsletter',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$12.99',
    period: '/ month',
    description: 'Full library access with offline listening and advanced tracking.',
    features: [
      'Entire meditation library',
      'All sleep stories & soundscapes',
      'Breathing exercises',
      'Offline access',
      'Full progress tracking',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Annual',
    price: '$79.99',
    period: '/ year',
    description: 'Everything in Premium with two months free — our best value.',
    features: [
      'Everything in Premium',
      'Save ~49% vs monthly',
      'Priority new content',
      'Offline access',
      'Full progress tracking',
    ],
    cta: 'Start Free Trial',
    popular: false,
    save: 'Save $75.89 a year',
  },
]

const comparisonRows = [
  { feature: 'Guided meditations', free: '5', premium: 'Unlimited', annual: 'Unlimited' },
  { feature: 'Sleep stories', free: '—', premium: 'Full library', annual: 'Full library' },
  { feature: 'Soundscapes', free: '2', premium: 'Unlimited', annual: 'Unlimited' },
  { feature: 'Breathing exercises', free: '—', premium: '✓', annual: '✓' },
  { feature: 'Offline access', free: '—', premium: '✓', annual: '✓' },
  { feature: 'Progress tracking', free: 'Basic', premium: 'Full', annual: 'Full' },
  { feature: 'Mood logging', free: '✓', premium: '✓', annual: '✓' },
  { feature: 'New content priority', free: '—', premium: '—', annual: '✓' },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your subscription at any time from your account settings. You will keep access through the end of your billing period, with no cancellation fees.',
  },
  {
    q: "What's included in the free trial?",
    a: 'Your 7-day free trial unlocks the full Premium library — guided meditations, sleep stories, soundscapes, breathing exercises, offline access, and complete progress tracking. No credit card required to start.',
  },
  {
    q: 'How does the annual billing work?',
    a: 'Choose Annual and you are billed once per year at the discounted rate. Your subscription renews automatically unless you cancel before the renewal date. You can switch plans anytime.',
  },
  {
    q: 'Is there a free plan after the trial?',
    a: 'Absolutely. If you decide Premium is not for you, you can continue on the Free plan with limited sessions and basic mood logging — no pressure to upgrade.',
  },
]

function Cell({ value }: { value: string }) {
  if (value === '✓') return <span className="check">✓</span>
  if (value === '—') return <span className="dash">—</span>
  return <>{value}</>
}

export default function Pricing() {
  return (
    <>
      <header className="page-header page-header--soft">
        <div className="container">
          <h1>Simple, Transparent Pricing</h1>
          <p>
            Start with a free 7-day trial. No long-term commitment — just clarity on what you get
            and the freedom to cancel anytime.
          </p>
        </div>
      </header>

      <section className="section pricing-tiers">
        <div className="container">
          <div className="tiers-grid">
            {tiers.map((tier, i) => (
              <Reveal key={tier.name} delay={(i + 1) as 1 | 2 | 3}>
                <article className={`tier${tier.popular ? ' popular' : ''}`}>
                  {tier.popular && <span className="tier-badge">Most Popular</span>}
                  <h3>{tier.name}</h3>
                  <p className="tier-desc">{tier.description}</p>
                  <div className="tier-price">
                    {tier.price}
                    <span>{tier.period}</span>
                  </div>
                  {tier.save ? <p className="tier-save">{tier.save}</p> : <p className="tier-save">&nbsp;</p>}
                  <ul className="tier-features">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className={`btn ${tier.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {tier.cta}
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section comparison">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">Compare plans</span>
              <h2 className="section-title">Every feature, side by side</h2>
              <p className="section-lead">
                See exactly what is included across Free, Premium, and Annual.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Premium</th>
                    <th>Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>
                        <Cell value={row.free} />
                      </td>
                      <td>
                        <Cell value={row.premium} />
                      </td>
                      <td>
                        <Cell value={row.annual} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section faq">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">FAQ</span>
              <h2 className="section-title">Pricing questions, answered</h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="faq-list">
              {faqs.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Start Your Free 7-Day Trial"
        description="No credit card required. Explore the full library and decide if Still feels like home."
        variant="trial"
      />
    </>
  )
}
