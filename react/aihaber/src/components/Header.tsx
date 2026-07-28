import type { CategoryId } from '../types'
import { CATEGORIES } from '../types'

type Props = {
  category: CategoryId
  onCategory: (c: CategoryId) => void
  query: string
  onQuery: (q: string) => void
  onRefresh: () => void
  updatedAt?: string
  loading?: boolean
  onHome?: () => void
  compact?: boolean
}

export function Header({
  category,
  onCategory,
  query,
  onQuery,
  onRefresh,
  updatedAt,
  loading,
  onHome,
  compact,
}: Props) {
  return (
    <header className="relative overflow-hidden px-4 pb-8 pt-6 md:px-8 md:pt-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.28em] text-[var(--volt)]">
              Canlı RSS akışı
            </p>
            <button
              type="button"
              onClick={onHome}
              className="text-left"
              aria-label="NABIZ ana sayfa"
            >
              <h1
                className={`${compact ? 'text-[clamp(2.4rem,7vw,4rem)]' : 'text-[clamp(3.2rem,9vw,6.5rem)]'} leading-[0.9] tracking-[-0.04em] text-[var(--mist)] transition hover:text-[var(--volt)]`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                NABIZ
              </h1>
            </button>
            <div className="mt-3 h-1 w-28 rounded-full bg-[var(--volt)] pulse-line" />
            {!compact && (
              <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-[rgba(216,239,232,0.72)]">
                Dünya haberlerinin nabzı — başlıklar ve kısa özetler, özgün kapaklarla. Telifli
                fotoğraflar yok; okumak için kaynağa gidin.
              </p>
            )}
          </div>

          {!compact && (
            <div className="flex flex-col items-end gap-3">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="rounded-full border border-[rgba(214,255,60,0.35)] bg-[rgba(214,255,60,0.1)] px-5 py-2.5 text-sm font-semibold text-[var(--volt)] transition hover:bg-[var(--volt)] hover:text-[var(--ink)] disabled:opacity-50"
              >
                {loading ? 'Yenileniyor…' : 'Yenile'}
              </button>
              {updatedAt && (
                <span className="text-[0.75rem] text-[rgba(216,239,232,0.45)]">
                  Güncellendi{' '}
                  {new Date(updatedAt).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap gap-2" aria-label="Kategoriler">
              {CATEGORIES.map((c) => {
                const active = c.id === category
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCategory(c.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-[var(--volt)] text-[var(--ink)]'
                        : 'border border-[var(--line)] bg-[rgba(10,47,41,0.6)] text-[rgba(216,239,232,0.75)] hover:border-[rgba(214,255,60,0.3)] hover:text-[var(--mist)]'
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </nav>

            <label className="relative block w-full md:max-w-xs">
              <span className="sr-only">Haber ara</span>
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Başlık veya kaynak ara…"
                className="w-full rounded-xl border border-[var(--line)] bg-[rgba(4,24,20,0.55)] px-4 py-2.5 text-sm text-[var(--mist)] outline-none ring-[var(--volt)] placeholder:text-[rgba(216,239,232,0.35)] focus:ring-2"
              />
            </label>
          </div>
        )}
      </div>
    </header>
  )
}
