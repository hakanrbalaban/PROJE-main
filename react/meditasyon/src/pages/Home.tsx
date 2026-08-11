import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import { Reveal } from '../components/Layout'

const features = [
  {
    title: 'Guided Meditation',
    description:
      'Sessions for stress, focus, and emotional balance — led by experienced teachers who meet you where you are.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Sleep Stories & Soundscapes',
    description:
      'Calming narrations and ambient soundscapes designed to quiet the mind and ease you into deeper rest.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M28 10c-1.5 8-8 14-16 15.5 3.5 6.5 11 11 19 11 9.4 0 17-7.6 17-17 0-7.5-4.9-13.9-11.5-16.1C34.5 10.2 31 12 28 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Daily Mindfulness Tracker',
    description:
      'Log your moods, build streaks, and watch your practice grow — gentle progress you can see and feel.',
    icon: (
      <svg className="feature-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M8 32l8-10 7 6 9-14 8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 38h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

const steps = [
  {
    title: 'Set Your Intention',
    description:
      'Choose what you need today — calm, focus, sleep, or a moment of kindness toward yourself.',
  },
  {
    title: 'Choose a Session',
    description:
      'Browse guided meditations, sleep stories, or breathing exercises matched to your intention.',
  },
  {
    title: 'Track Your Progress',
    description:
      'See your streaks, moods, and minutes practiced — a quiet record of showing up for yourself.',
  },
]

const testimonials = [
  {
    quote:
      'Still helped me quiet the nighttime spiral. I fall asleep faster and wake up feeling like myself again.',
    name: 'Sarah M.',
    role: 'Teacher, Portland',
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  },
  {
    quote:
      'The guided sessions gave me tools for anxiety I actually use. Five minutes before meetings changed everything.',
    name: 'James K.',
    role: 'Product Designer, Austin',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  },
  {
    quote:
      'I never thought I could meditate. The sleep stories and tracker made it feel approachable — and lasting.',
    name: 'Priya R.',
    role: 'Nurse, Chicago',
    photo:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop',
  },
]

export default function Home() {
  return (
    <>
      <section className="hero" aria-label="Welcome">
        <div className="hero-bg" role="img" aria-label="Person meditating in soft morning light" />
        <div className="hero-content">
          <p className="hero-brand">Still</p>
          <h1>Inner peace, clearer focus, and nights that finally rest.</h1>
          <p className="hero-lead">
            A meditation companion for calmer days and deeper sleep — start free, no pressure.
          </p>
          <div className="btn-group">
            <a href="#download" className="btn btn-accent">
              Download the App
            </a>
            <Link to="/pricing" className="btn btn-ghost">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      <section className="section features-list">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">What you will find</span>
              <h2 className="section-title">Three pillars of a quieter practice</h2>
              <p className="section-lead">
                Everything you need to build a mindful rhythm — without clutter or overwhelm.
              </p>
            </div>
          </Reveal>
          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i + 1) as 1 | 2 | 3}>
                <article className="feature-item">
                  {f.icon}
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section how-it-works">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">How it works</span>
              <h2 className="section-title">Three simple steps to begin</h2>
              <p className="section-lead">
                No complicated setup. Just a clear path from intention to insight.
              </p>
            </div>
          </Reveal>
          <div className="steps">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={(i + 1) as 1 | 2 | 3}>
                <article className="step">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">Voices from the community</span>
              <h2 className="section-title">Calmer minds, better nights</h2>
              <p className="section-lead">
                Real stories from people who found relief from anxiety and space for deeper sleep.
              </p>
            </div>
          </Reveal>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i + 1) as 1 | 2 | 3}>
                <figure className="testimonial">
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption className="testimonial-author">
                    <img src={t.photo} alt="" width={48} height={48} />
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div id="download">
        <CTASection
          title="Start Your Journey to a Calmer Mind Today"
          description="Download Still on the App Store or Google Play and begin with a free trial — your quieter self is waiting."
          variant="stores"
        />
      </div>
    </>
  )
}
