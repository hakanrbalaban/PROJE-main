import { useRef } from 'react'
import { CATEGORY_META, type Article, type CategoryId } from '../types'
import { CoverImage } from './CoverImage'
import { unsplashUrl } from '../lib/unsplash'

interface CategoryGridProps {
  category: CategoryId
  articles: Article[]
  onSelect: (id: CategoryId) => void
}

export function CategoryIconGrid({ category, articles, onSelect }: CategoryGridProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const counts = Object.fromEntries(
    CATEGORY_META.filter((c) => c.id !== 'tumu').map((c) => [
      c.id,
      articles.filter((a) => a.category === c.id).length,
    ]),
  ) as Record<string, number>

  function scroll(dir: -1 | 1) {
    trackRef.current?.scrollBy({
      left: dir * Math.min(360, (trackRef.current?.clientWidth || 320) * 0.7),
      behavior: 'smooth',
    })
  }

  return (
    <div id="kategoriler" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">
            🎯 Kategoriler
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Kaydır · ikona tıkla · tümünü oku</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect('tumu')}
            className="rounded-[4px] border border-[var(--line)] bg-[rgba(26,15,46,0.85)] px-3 py-2 text-xs font-extrabold text-[var(--cyan)]"
          >
            Tüm yazılar →
          </button>
          <button type="button" aria-label="Sola" onClick={() => scroll(-1)} className="grid h-10 w-10 place-items-center rounded-[4px] border border-[var(--line)] bg-[var(--panel)] text-white">←</button>
          <button type="button" aria-label="Sağa" onClick={() => scroll(1)} className="grid h-10 w-10 place-items-center rounded-[4px] border border-[var(--line)] bg-[var(--panel)] text-white">→</button>
        </div>
      </div>
      <div ref={trackRef} className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {CATEGORY_META.filter((c) => c.id !== 'tumu').map((c, i) => {
          const active = category === c.id
          const count = counts[c.id] ?? 0
          const shape = i % 3
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`flex min-w-[132px] max-w-[148px] snap-start flex-col items-center gap-2 border-2 px-3 py-5 text-center transition hover:-translate-y-0.5 ${
                shape === 2 ? 'border-dashed' : ''
              } ${active ? 'bg-[rgba(255,45,106,0.2)]' : 'bg-[rgba(26,15,46,0.9)]'}`}
              style={{ borderColor: `${c.accent}66`, boxShadow: `0 10px 28px ${c.accent}30` }}
            >
              <span className="text-3xl leading-none">{c.emoji}</span>
              <span className="text-sm font-bold text-white">{c.label}</span>
              <span className="h-1 w-9 rounded-sm" style={{ background: c.accent }} />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{count} yazı</span>
              <span className="text-[11px] font-bold text-[var(--cyan)]">{active ? 'Aktif' : 'Tümünü oku →'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface MosaicProps {
  articles: Article[]
  onOpen: (id: string) => void
  onViewAll: () => void
}

export function MagazineMosaic({ articles, onOpen, onViewAll }: MosaicProps) {
  const items = articles.slice(0, 5)
  if (items.length === 0) return null
  const [featured, ...rest] = items
  const meta = CATEGORY_META.find((c) => c.id === featured.category)

  return (
    <div id="one-cikan" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">📰 Öne çıkanlar</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Manşet altı seçki — magazin grid</p>
        </div>
        <button type="button" onClick={onViewAll} className="rounded-[4px] border border-[var(--line)] px-3 py-2 text-xs font-extrabold text-[var(--cyan)]">
          Tümünü gör →
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <article className="group relative min-h-[300px] overflow-hidden rounded-[4px] border-2 border-[var(--line)] md:col-span-2 md:row-span-2 lg:min-h-[420px]">
          <button type="button" onClick={() => onOpen(featured.slug || featured.id)} className="absolute inset-0 block text-left">
            <CoverImage src={featured.coverUrl || unsplashUrl(featured.id || featured.slug)} seed={featured.id} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              {meta && <span className="mb-2 inline-block rounded-[3px] bg-[rgba(0,229,192,0.25)] px-3 py-1 text-xs font-bold text-[var(--cyan)]">{meta.label}</span>}
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-3xl">{featured.title}</h3>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80">{featured.excerpt}</p>
              <span className="mt-3 inline-flex text-sm font-bold text-[var(--hot-2)]">Tümünü oku →</span>
            </div>
          </button>
        </article>
        {rest.map((item) => {
          const c = CATEGORY_META.find((x) => x.id === item.category)
          return (
            <article key={item.id} className="group relative min-h-[180px] overflow-hidden rounded-[4px] border-2 border-[var(--line)]">
              <button type="button" onClick={() => onOpen(item.slug || item.id)} className="absolute inset-0 block text-left">
                <CoverImage src={item.coverUrl || unsplashUrl(item.id || item.slug)} seed={item.id} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  {c && <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--cyan)]">{c.label}</span>}
                  <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-snug text-white">{item.title}</h3>
                </div>
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

const LAYOUTS = ['hero-side', 'slide', 'mosaic', 'numbered', 'duo'] as const

interface BlocksProps {
  articles: Article[]
  onOpen: (id: string) => void
  onSelectCategory: (id: CategoryId) => void
}

export function CategoryMagazineBlocks({ articles, onOpen, onSelectCategory }: BlocksProps) {
  const cats = CATEGORY_META.filter((c) => c.id !== 'tumu').slice(0, 6)

  return (
    <>
      {cats.map((cat, catIndex) => {
        const layout = LAYOUTS[catIndex % LAYOUTS.length]
        const list = articles.filter((a) => a.category === cat.id).slice(0, layout === 'slide' ? 10 : 6)
        if (list.length === 0) return null
        const [featured, ...rest] = list

        return (
          <div
            key={cat.id}
            id={`kat-${cat.id}`}
            className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6"
            style={{ ['--cat-accent' as string]: cat.accent }}
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 pb-3" style={{ borderColor: cat.accent }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-[4px] text-2xl" style={{ background: `${cat.accent}22`, boxShadow: `inset 0 0 0 2px ${cat.accent}88` }}>
                  {cat.emoji}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: cat.accent }}>
                    Magazin · {layout}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">{cat.label}</h2>
                  <p className="text-sm text-[var(--muted)]">{list.length}+ içerik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="rounded-[4px] border px-3 py-2 text-xs font-extrabold text-white"
                style={{ borderColor: `${cat.accent}99`, background: `${cat.accent}33` }}
              >
                Tümünü oku →
              </button>
            </div>

            {layout === 'hero-side' && (
              <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
                <FeatureCard article={featured} cat={cat} onOpen={onOpen} tall />
                <div className="grid gap-3">
                  {rest.slice(0, 4).map((item) => (
                    <SideItem key={item.id} article={item} onOpen={onOpen} />
                  ))}
                </div>
              </div>
            )}

            {layout === 'slide' && <SlideRail items={list} cat={cat} onOpen={onOpen} onMore={() => onSelectCategory(cat.id)} />}

            {layout === 'mosaic' && (
              <div className="grid auto-rows-[140px] grid-cols-2 gap-2 md:grid-cols-3 md:grid-rows-[160px_160px_140px]">
                {list.slice(0, 6).map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item.slug || item.id)}
                    className={`group relative overflow-hidden rounded-[4px] border-2 border-[var(--line)] text-left ${i === 0 ? 'md:row-span-2 min-h-[220px]' : ''}`}
                  >
                    <CoverImage src={item.coverUrl || unsplashUrl(item.id)} seed={item.id} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      {i === 0 && <span className="viral-badge mb-1">{cat.label}</span>}
                      <h3 className={`line-clamp-2 font-[family-name:var(--font-display)] font-bold text-white ${i === 0 ? 'text-lg' : 'text-sm'}`}>{item.title}</h3>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {layout === 'numbered' && (
              <div className="grid gap-4 md:grid-cols-2">
                <button type="button" onClick={() => onOpen(featured.slug || featured.id)} className="overflow-hidden rounded-[4px] border-2 text-left" style={{ borderColor: cat.accent }}>
                  <div className="grid sm:grid-cols-2">
                    <CoverImage src={featured.coverUrl || unsplashUrl(featured.id)} seed={featured.id} alt="" className="min-h-[220px] w-full object-cover" />
                    <div className="bg-[rgba(26,15,46,0.9)] p-4 text-white">
                      <span className="font-[family-name:var(--font-display)] text-3xl font-black" style={{ color: cat.accent }}>01</span>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">{featured.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">{featured.excerpt}</p>
                    </div>
                  </div>
                </button>
                <ol className="grid gap-2">
                  {rest.slice(0, 4).map((item, i) => (
                    <li key={item.id}>
                      <button type="button" onClick={() => onOpen(item.slug || item.id)} className="flex w-full items-center gap-3 rounded-[4px] border border-[var(--line)] bg-[rgba(26,15,46,0.8)] p-1.5 text-left">
                        <em className="min-w-[1.5rem] not-italic font-[family-name:var(--font-display)] text-lg font-black" style={{ color: cat.accent }}>
                          {String(i + 2).padStart(2, '0')}
                        </em>
                        <CoverImage src={item.coverUrl || unsplashUrl(item.id)} seed={item.id} alt="" className="h-14 w-20 rounded-[3px] object-cover" />
                        <span className="min-w-0">
                          <strong className="line-clamp-2 block text-sm text-white">{item.title}</strong>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {layout === 'duo' && (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {list.slice(0, 2).map((item) => (
                    <FeatureCard key={item.id} article={item} cat={cat} onOpen={onOpen} tall />
                  ))}
                </div>
                {list.length > 2 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {list.slice(2).map((item) => (
                      <button key={item.id} type="button" onClick={() => onOpen(item.slug || item.id)} className="flex min-w-[200px] items-center gap-2 rounded-[4px] border border-[var(--line)] bg-[rgba(26,15,46,0.85)] p-1.5 text-left">
                        <CoverImage src={item.coverUrl || unsplashUrl(item.id)} seed={item.id} alt="" className="h-10 w-14 rounded-[3px] object-cover" />
                        <span className="line-clamp-2 text-xs font-bold text-white">{item.title}</span>
                      </button>
                    ))}
                    <button type="button" onClick={() => onSelectCategory(cat.id)} className="min-w-[100px] rounded-[4px] border border-dashed border-[var(--cyan)] px-3 text-xs font-extrabold text-[var(--cyan)]">
                      Tümü →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </>
  )
}

function FeatureCard({
  article,
  cat,
  onOpen,
  tall,
}: {
  article: Article
  cat: (typeof CATEGORY_META)[number]
  onOpen: (id: string) => void
  tall?: boolean
}) {
  return (
    <article className={`group relative overflow-hidden rounded-[4px] border-2 border-[var(--line)] ${tall ? 'min-h-[280px]' : 'min-h-[200px]'}`}>
      <button type="button" onClick={() => onOpen(article.slug || article.id)} className="absolute inset-0 block text-left">
        <CoverImage src={article.coverUrl || unsplashUrl(article.id)} seed={article.id} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="viral-badge mb-2">
            {cat.emoji} {cat.label}
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">{article.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{article.excerpt}</p>
          <span className="mt-3 inline-flex text-sm font-bold text-[var(--cyan)]">Devamını oku →</span>
        </div>
      </button>
    </article>
  )
}

function SideItem({ article, onOpen }: { article: Article; onOpen: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onOpen(article.slug || article.id)} className="flex w-full gap-3 rounded-[4px] border border-[var(--line)] bg-[rgba(26,15,46,0.8)] p-2 text-left hover:border-[var(--hot)]/50">
      <CoverImage src={article.coverUrl || unsplashUrl(article.id)} seed={article.id} alt="" className="h-16 w-24 shrink-0 rounded-[3px] object-cover" />
      <span className="min-w-0">
        <strong className="line-clamp-2 block font-[family-name:var(--font-display)] text-sm text-white">{article.title}</strong>
        <span className="mt-1 block text-[10px] text-[var(--muted)]">👁 {article.views ?? 0}</span>
      </span>
    </button>
  )
}

function SlideRail({
  items,
  cat,
  onOpen,
  onMore,
}: {
  items: Article[]
  cat: (typeof CATEGORY_META)[number]
  onOpen: (id: string) => void
  onMore: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div className="mb-2 flex justify-end gap-2">
        <button type="button" aria-label="Sola" className="grid h-9 w-9 place-items-center rounded-[4px] border border-[var(--line)] text-white" onClick={() => ref.current?.scrollBy({ left: -280, behavior: 'smooth' })}>←</button>
        <button type="button" aria-label="Sağa" className="grid h-9 w-9 place-items-center rounded-[4px] border border-[var(--line)] text-white" onClick={() => ref.current?.scrollBy({ left: 280, behavior: 'smooth' })}>→</button>
      </div>
      <div ref={ref} className="hide-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x">
        {items.map((item, i) => (
          <button key={item.id} type="button" onClick={() => onOpen(item.slug || item.id)} className="relative min-w-[240px] max-w-[260px] snap-start overflow-hidden rounded-[4px] border-2 border-[var(--line)] bg-[#12081c] text-left">
            <span className="absolute left-2 top-2 z-10 rounded-[3px] px-2 py-0.5 text-[10px] font-black text-white" style={{ background: cat.accent }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <CoverImage src={item.coverUrl || unsplashUrl(item.id)} seed={item.id} alt="" className="aspect-[4/3] w-full object-cover" />
            <span className="block p-3">
              <strong className="line-clamp-2 block text-sm text-white">{item.title}</strong>
            </span>
          </button>
        ))}
        <button type="button" onClick={onMore} className="grid min-w-[180px] place-content-center rounded-[4px] border-2 border-dashed px-4 text-center text-white" style={{ borderColor: cat.accent, background: `${cat.accent}22` }}>
          <span className="text-xs text-[var(--muted)]">Daha fazla</span>
          <strong className="mt-1">{cat.label} →</strong>
        </button>
      </div>
    </div>
  )
}
