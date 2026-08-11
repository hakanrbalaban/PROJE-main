import CTASection from '../components/CTASection'
import { Reveal } from '../components/Layout'

const team = [
  {
    name: 'Maya Chen',
    role: 'Meditation Teacher',
    bio: 'Trained in mindfulness-based stress reduction, Maya crafts sessions that feel warm, clear, and deeply human.',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
  },
  {
    name: 'Elena Vasquez',
    role: 'Mindfulness Expert',
    bio: 'Elena bridges contemplative practice and everyday life, helping people bring awareness into work, rest, and relationships.',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop',
  },
  {
    name: 'David Okonkwo',
    role: 'Lead Developer',
    bio: 'A longtime practitioner himself, David builds Still with care — calm interfaces that never get in the way of presence.',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
  },
]

const awards = [
  { mark: '★', label: 'Best Meditation App of the Year' },
  { mark: 'W', label: 'Wellness Innovation Award' },
  { mark: 'S', label: 'Sleep Health Recognition' },
  { mark: 'M', label: 'Mindful Living Choice' },
]

export default function About() {
  return (
    <>
      <header className="page-header page-header--image">
        <div
          className="page-header-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=900&fit=crop')",
          }}
          role="img"
          aria-label="Sunlight through a quiet forest"
        />
        <div className="container">
          <h1>Our Mission is to Make Mental Wellness Accessible to Everyone</h1>
          <p>
            We believe calm should not be a luxury — it should be a daily companion, open to anyone
            ready to begin.
          </p>
        </div>
      </header>

      <section className="section about-story">
        <div className="container">
          <div className="about-story-grid">
            <Reveal>
              <div className="about-story-image">
                <img
                  src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=1000&fit=crop"
                  alt="Quiet lakeside morning for reflection"
                />
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="about-story-text">
                <span className="section-eyebrow">Our story</span>
                <h2 className="section-title">Born from a need for quieter days</h2>
                <p>
                  Still began when our founders struggled to find a meditation practice that felt
                  approachable — not performative, not overwhelming, just honest support for anxious
                  minds and restless nights.
                </p>
                <p>
                  What started as a personal journey into mindfulness grew into a shared passion:
                  to build tools rooted in compassion, informed by science, and held by community.
                  Every session, story, and tracker in Still reflects that intention.
                </p>
                <div className="values">
                  <span className="value-tag">Compassion</span>
                  <span className="value-tag">Science</span>
                  <span className="value-tag">Community</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section team">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">The people behind Still</span>
              <h2 className="section-title">Teachers, experts, and builders</h2>
              <p className="section-lead">
                A small team dedicated to well-being — crafting experiences that honor your pace.
              </p>
            </div>
          </Reveal>
          <div className="team-grid">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={(i + 1) as 1 | 2 | 3}>
                <article className="team-member">
                  <img src={member.photo} alt={member.name} />
                  <h3>{member.name}</h3>
                  <span className="role">{member.role}</span>
                  <p>{member.bio}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section awards">
        <div className="container">
          <Reveal>
            <div className="section-head centered">
              <span className="section-eyebrow">Recognition</span>
              <h2 className="section-title">Trusted by the wellness community</h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <ul className="awards-list">
              {awards.map((a) => (
                <li key={a.label} className="award-logo">
                  <div className="award-mark" aria-hidden="true">
                    {a.mark}
                  </div>
                  <span>{a.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Become a Part of Our Mindful Community"
        description="Join thousands finding quieter mornings and gentler nights with Still."
        variant="community"
      />
    </>
  )
}
