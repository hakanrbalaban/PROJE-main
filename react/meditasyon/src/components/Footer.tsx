import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-mark" aria-hidden="true" />
              Still
            </Link>
            <p>
              Guided meditation, sleep stories, and daily mindfulness — helping you
              find calm, focus, and better rest.
            </p>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/about">About</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">Our Mission</Link>
            <Link to="/about">Team</Link>
            <Link to="/blog">Resources</Link>
          </div>

          <div className="footer-col">
            <h4>Get Started</h4>
            <Link to="/pricing">Free Trial</Link>
            <Link to="/pricing">Download</Link>
            <a href="mailto:hello@still.app">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Still. All rights reserved.</span>
          <span>Made for quieter minds.</span>
        </div>
      </div>
    </footer>
  )
}
