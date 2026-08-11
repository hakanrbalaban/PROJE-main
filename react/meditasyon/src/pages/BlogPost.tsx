import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../data/blog'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return (
      <div className="post-not-found container">
        <h1>Article not found</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>
          This post may have moved or no longer exists.
        </p>
        <Link to="/blog" className="btn btn-primary">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article>
      <header className="post-header">
        <div className="post-header-inner container">
          <span className="category">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-meta-row">
            <img src={post.authorAvatar} alt="" width={44} height={44} />
            <div>
              <strong>{post.author}</strong>
              <span>
                {post.date} · {post.readTime}
              </span>
            </div>
          </div>
        </div>
        <div className="post-hero-img">
          <img src={post.image} alt="" />
        </div>
      </header>

      <div className="post-body">
        <div className="post-content container">
          {post.content.map((paragraph, index) => (
            <div key={paragraph.slice(0, 32)}>
              <p>{paragraph}</p>
              {index === 1 && (
                <blockquote className="pull-quote">“{post.pullQuote}”</blockquote>
              )}
            </div>
          ))}
          <p style={{ marginTop: '2.5rem' }}>
            <Link to="/blog" className="btn btn-outline">
              ← All articles
            </Link>
          </p>
        </div>
      </div>
    </article>
  )
}
