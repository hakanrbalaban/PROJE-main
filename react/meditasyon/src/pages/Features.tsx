import CTASection from '../components/CTASection'
import { Reveal } from '../components/Layout'

const featureBlocks = [
  {
    eyebrow: 'Library',
    title: 'Guided Meditations',
    paragraphs: [
      'Explore a vast library of sessions for stress relief, sharper focus, emotional balance, and restorative sleep — each led by world-class instructors who speak with warmth and clarity.',
      'Whether you have three minutes or thirty, there is a practice waiting that meets your energy and intention.',
    ],
    bullets: [
      'Sessions for anxiety, focus, gratitude, and more',
      'Beginner-friendly and advanced practices',
      'New content added regularly',
    ],
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=700&fit=crop',
    alt: 'Person in a calm guided meditation pose',
    reverse: false,
  },
  {
    eyebrow: 'Rest',
    title: 'Sleep Stories & Soundscapes',
    paragraphs: [
      'Drift off with calming narrations and carefully crafted ambient soundscapes. Soft voices and gentle atmospheres help you fall asleep faster — and stay asleep through the night.',
      'From rainfall forests to quiet starlit fields, every soundscape is designed to lower the volume of a restless mind.',
    ],
    bullets: [
      'Soothing bedtime stories for adults',
      'Nature and ambient soundscapes',
      'Nighttime visuals that ease the senses',
    ],
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&h=700&fit=crop',
    alt: 'Starry night sky over quiet mountains',
    reverse: true,
  },
  {
    eyebrow: 'Progress',
    title: 'Daily Mindfulness Tracker',
    paragraphs: [
      'Log your moods, keep meditation streaks alive, and see your practice unfold over time with clear, beautiful charts.',
      'Progress is not about perfection — it is about noticing patterns and celebrating the days you showed up.',
    ],
    bullets: [
      'Mood logging and reflection prompts',
      'Streak tracking that motivates gently',
      'Easy-to-read weekly and monthly charts',
    ],
    image:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900&h=700&fit=crop',
    alt: 'Journal and soft light for mindful tracking',
    reverse: false,
  },
  {
    eyebrow: 'Breathe',
    title: 'Breathing Exercises',
    paragraphs: [
      'Interactive visual guides walk you through box breathing, 4-7-8, and other proven techniques to reduce stress in moments — not hours.',
      'Your breath is always available. Still helps you use it with intention when tension rises.',
    ],
    bullets: [
      'Box breathing and 4-7-8 techniques',
      'On-screen visual pacing guides',
      'Quick resets for busy days',
    ],
    image:
      'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=900&h=700&fit=crop',
    alt: 'Soft morning light suggesting calm breath',
    reverse: true,
  },
]

export default function Features() {
  return (
    <>
      <header className="page-header page-header--soft">
        <div className="container">
          <h1>Everything You Need for a Mindful Life</h1>
          <p>
            A comprehensive suite of tools — guided sessions, sleep support, tracking, and
            breathing practices — designed to fit the rhythm of real life.
          </p>
        </div>
      </header>

      <section className="section features-page-sections">
        <div className="container">
          {featureBlocks.map((block) => (
            <Reveal key={block.title}>
              <article className={`feature-block${block.reverse ? ' reverse' : ''}`}>
                <div className="feature-visual">
                  <img src={block.image} alt={block.alt} />
                </div>
                <div className="feature-copy">
                  <span className="section-eyebrow">{block.eyebrow}</span>
                  <h2>{block.title}</h2>
                  {block.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                  <ul>
                    {block.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection
        title="Experience Still for Yourself"
        description="Start a free trial and explore guided meditations, sleep stories, tracking, and breathing tools — no long-term commitment."
        variant="trial"
      />
    </>
  )
}
