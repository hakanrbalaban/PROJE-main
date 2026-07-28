import { useState } from 'react'
import {
  CATEGORY_META,
  VIRAL_FILTERS,
  type CategoryId,
  type ViralFilterId,
} from '../types'

interface Props {
  category: CategoryId
  onCategory: (c: CategoryId) => void
  viralFilter: ViralFilterId
  onViralFilter: (f: ViralFilterId) => void
  query: string
  onQuery: (q: string) => void
  onHome: () => void
  onEditor?: () => void
  compact?: boolean
  resultCount?: number
}

const QUICK_VIRAL = VIRAL_FILTERS.filter((f) =>
  ['viral', 'liked', 'viewed', '😍', '😂', '💯'].includes(f.id),
)

export function Header({
  category,
  onCategory,
  viralFilter,
  onViralFilter,
  query,
  onQuery,
  onHome,
  onEditor,
  compact,
  resultCount,
}: Props) {
  const [open, setOpen] = useState(false)
  const activeViral = VIRAL_FILTERS.find((f) => f.id === viralFilter)
  const activeCat = CATEGORY_META.find((c) => c.id === category)
  const hasFilter = Boolean(query.trim()) || category !== 'tumu' || viralFilter !== 'all'

  function clearAll() {
    onQuery('')
    onCategory('tumu')
    onViralFilter('all')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(10,6,18,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
        <button type="button" onClick={onHome} className="group flex shrink-0 items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--hot)] to-[var(--orange)] shadow-lg shadow-[rgba(255,45,106,0.4)] transition group-hover:scale-105">
            <span className="font-[family-name:var(--font-display)] text-lg font-extrabold text-white">
              A
            </span>
          </span>
          <span className="text-left">
            <span className="block font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-white">
              AİORA
            </span>
            {!compact && (
              <span className="block text-[11px] text-[var(--muted)]">
                🔥 viral AI magazin · emojili arama
              </span>
            )}
          </span>
        </button>

        <div className="ml-auto flex min-w-0 flex-1 flex-col gap-2 sm:max-w-2xl">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Ara</span>
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder="🔍 Detaylı ara: başlık, etiket…"
                className="w-full rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--mist)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--hot)]/60"
              />
            </label>

            <div className="hide-scrollbar flex max-w-[42vw] items-center gap-1 overflow-x-auto sm:max-w-none">
              {QUICK_VIRAL.map((f) => {
                const active = viralFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    title={f.hint}
                    aria-pressed={active}
                    onClick={() => onViralFilter(active ? 'all' : f.id)}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-base transition ${
                      active
                        ? 'scale-110 bg-gradient-to-br from-[var(--hot)] to-[var(--orange)] shadow-md shadow-[rgba(255,45,106,0.35)]'
                        : 'border border-[var(--line)] bg-[var(--panel)] hover:scale-110 hover:border-[var(--hot)]'
                    }`}
                  >
                    {f.emoji}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                open || hasFilter
                  ? 'bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] text-white'
                  : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--mist)] hover:border-[var(--cyan)]'
              }`}
            >
              {open ? '✕' : '🎛️ Filtre'}
            </button>

            <button
              type="button"
              onClick={onEditor}
              className="shrink-0 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--mist)] transition hover:border-[var(--cyan)]"
            >
              ✍️ Editör
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[rgba(16,10,28,0.97)]">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--hot)]">
                  Detaylı arama
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Emoji + kategori + metin birlikte çalışır
                  {typeof resultCount === 'number' && (
                    <span className="ml-2 text-[var(--cyan)]">· {resultCount} sonuç</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasFilter && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:border-[var(--hot)] hover:text-white"
                  >
                    Filtreleri temizle
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Viral emojiler
              </p>
              <div className="flex flex-wrap gap-2">
                {VIRAL_FILTERS.map((f) => {
                  const active = viralFilter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      title={f.hint}
                      onClick={() => onViralFilter(f.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] text-white shadow-md'
                          : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--mist)] hover:border-[var(--hot)]'
                      }`}
                    >
                      <span>{f.emoji}</span>
                      <span>{f.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Kategori emojileri
              </p>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {CATEGORY_META.map((c) => {
                  const active = category === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => onCategory(c.id)}
                      className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                        active
                          ? 'scale-[1.04] text-[var(--ink)] shadow-md'
                          : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--mist)] hover:border-[var(--cyan)]'
                      }`}
                      style={
                        active
                          ? {
                              background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
                              boxShadow: `0 6px 16px ${c.accent}44`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-xl leading-none">{c.emoji}</span>
                      <span className="text-[10px] font-bold">{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {hasFilter && (
              <p className="text-xs text-[var(--mist)]">
                Aktif:{' '}
                {query.trim() && <span className="text-[var(--cyan)]">“{query.trim()}” · </span>}
                <span>
                  {activeCat?.emoji} {activeCat?.label}
                </span>
                {' · '}
                <span>
                  {activeViral?.emoji} {activeViral?.label}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
