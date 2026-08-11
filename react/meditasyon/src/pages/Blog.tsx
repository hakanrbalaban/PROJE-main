import { Link } from 'react-router-dom'
import CTASection from '../components/CTASection'
import { Reveal } from '../components/Layout'
import { blogPosts, getFeaturedPost } from '../data/blog'

export default function Blog() {
  const featured = getFeaturedPost()
  const rest = blogPosts.filter((p) => p.slug !== featured.slug)

  return (
    <>
      <header className="page-header page-header--soft">
        <div className="container">
          <h1>Insights for a Mindful Life</h1>
          <p>
            Articles on meditation techniques, sleep hygiene, stress management, and living with
            more presence — written for real days, not perfect ones.
          </p>
        </div>
      </header>

      <section className="section blog-featured">
        <div className="container">
          <Reveal>
            <Link to={`/blog/${featured.slug}`} className="featured-card">
              <img src={featured.image} alt="" />
              <div className="featured-body">
                <span className="category">Featured · {featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="meta">
                  <span>{featured.author}</span>
                  <span>{featured.date}</span>
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section blog-grid-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-eyebrow">All articles</span>
              <h2 className="section-title">Explore the library</h2>
            </div>
          </Reveal>
          <div className="blog-grid">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <Link to={`/blog/${post.slug}`} className="blog-card">
                  <img src={post.image} alt="" />
                  <span className="category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="meta">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Feel the Benefits?"
        description="Reading is a beautiful start. Try Still free and bring these practices into your daily rhythm."
        variant="trial"
      />
    </>
  )
}
