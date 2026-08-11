import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark" aria-hidden="true" />
          Still
        </Link>

        <button
          type="button"
          className={`nav-toggle${open ? ' open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links${open ? ' open' : ''}`} aria-label="Primary">
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={close}>
            About
          </NavLink>
          <NavLink to="/features" onClick={close}>
            Features
          </NavLink>
          <NavLink to="/pricing" onClick={close}>
            Pricing
          </NavLink>
          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          <Link to="/pricing" className="btn btn-primary nav-cta" onClick={close}>
            Start Free Trial
          </Link>
        </nav>
      </div>
    </header>
  )
}
