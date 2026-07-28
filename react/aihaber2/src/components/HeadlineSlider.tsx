import { useEffect, useState } from 'react'
import type { Article } from '../types'
import { formatCount } from '../types'
import { CoverImage } from './CoverImage'

interface Props {
  articles: Article[]
  onOpen: (id: string) => void
}

export function HeadlineSlider({ articles, onOpen }: Props) {
  const slides = articles.slice(0, 6)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length < 2 || paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [slides.length, paused])

  if (!slides.length) return null
  const article = slides[index]

  return (
    <section
      className="relative min-h-[78vh] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((a, i) => (
        <CoverImage
          key={a.id}
          src={a.coverUrl}
          seed={a.id}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07040e] via-[rgba(10,6,18,0.55)] to-[rgba(10,6,18,0.2)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(255,45,106,0.28),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_20%,rgba(0,229,192,0.18),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-[1280px] flex-col justify-end px-4 pb-16 pt-28 md:px-6">
        <p className="animate-rise mb-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          AİORA
        </p>
        <p className="mb-5 max-w-lg text-base text-[rgba(243,232,255,0.78)] sm:text-lg">
          Viral AI magazin 🔥 günde 40 özgün yazı · emoji · beğeni · yorum
        </p>

        <div key={article.id} className="max-w-3xl animate-[slide-in_0.45s_ease]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="viral-badge animate-pulse-glow">🔥 MANŞET</span>
            <span className="rounded-full bg-[rgba(0,229,192,0.2)] px-3 py-1 text-xs font-semibold text-[var(--cyan)]">
              {article.categoryLabel}
            </span>
            <span className="text-xs text-[var(--muted)]">
              👁 {formatCount(article.views)} · ❤️ {formatCount(article.likes)} · {article.readMinutes} dk
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-[rgba(243,232,255,0.85)]">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpen(article.slug || article.id)}
              className="rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] px-6 py-2.5 font-bold text-white shadow-lg shadow-[rgba(255,45,106,0.35)] transition hover:brightness-110"
            >
              Oku ✨
            </button>
            <a
              href="#yazilar"
              className="rounded-full border border-[var(--line)] bg-[rgba(26,15,46,0.55)] px-6 py-2.5 font-medium text-[var(--mist)] backdrop-blur"
            >
              Tüm yazılar →
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Önceki manşet"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-xl backdrop-blur hover:bg-[var(--hot)]"
          >
            ←
          </button>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Manşet ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-[var(--hot)]' : 'w-2 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
          <button
            type="button"
            aria-label="Sonraki manşet"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/30 text-xl backdrop-blur hover:bg-[var(--cyan)] hover:text-[var(--ink)]"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}
