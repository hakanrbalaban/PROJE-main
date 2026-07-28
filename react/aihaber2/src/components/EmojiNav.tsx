import { CATEGORY_META, VIRAL_FILTERS, type CategoryId, type ViralFilterId } from '../types'

const SECTIONS = [
  { id: 'trendler', emoji: '🔥', label: 'Trend' },
  { id: 'cok-okunan', emoji: '👁', label: 'Çok okunan' },
  { id: 'son-yazilar', emoji: '🆕', label: 'Son' },
  { id: 'kategoriler', emoji: '🎯', label: 'Kategori' },
  { id: 'foto-galeri', emoji: '📷', label: 'Foto' },
  { id: 'video-galeri', emoji: '▶️', label: 'Video' },
  { id: 'yazilar', emoji: '📰', label: 'Yazılar' },
] as const

interface Props {
  category: CategoryId
  onCategory: (c: CategoryId) => void
  viralFilter: ViralFilterId
  onViralFilter: (f: ViralFilterId) => void
  onSection: (sectionId: string) => void
}

export function EmojiNav({
  category,
  onCategory,
  viralFilter,
  onViralFilter,
  onSection,
}: Props) {
  return (
    <nav
      aria-label="Hızlı emoji menü"
      className="sticky top-[68px] z-30 border-b border-[var(--line)] bg-[rgba(10,6,18,0.92)] backdrop-blur-xl"
    >
      <div className="hide-scrollbar mx-auto flex max-w-[1280px] items-center gap-1.5 overflow-x-auto px-4 py-2 md:px-6">
        <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Git
        </span>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onClick={() => onSection(s.id)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]"
          >
            <span className="text-base leading-none">{s.emoji}</span>
            <span className="hidden text-[11px] font-semibold text-[var(--mist)] sm:inline">
              {s.label}
            </span>
          </button>
        ))}

        <span className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" aria-hidden />

        <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Viral
        </span>
        {VIRAL_FILTERS.filter((f) => f.id !== 'all').map((f) => {
          const active = viralFilter === f.id
          return (
            <button
              key={f.id}
              type="button"
              title={f.hint}
              onClick={() => onViralFilter(active ? 'all' : f.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm transition ${
                active
                  ? 'scale-[1.05] bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] text-white shadow-md'
                  : 'border border-[var(--line)] bg-[var(--panel)] hover:scale-105'
              }`}
            >
              <span className="text-base leading-none">{f.emoji}</span>
              <span
                className={`hidden text-[11px] font-semibold sm:inline ${
                  active ? 'text-white' : 'text-[var(--mist)]'
                }`}
              >
                {f.label}
              </span>
            </button>
          )
        })}

        <span className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" aria-hidden />

        <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Kategori
        </span>
        {CATEGORY_META.map((c) => {
          const active = category === c.id
          return (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => onCategory(c.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm transition ${
                active
                  ? 'scale-[1.05] text-[var(--ink)] shadow-md'
                  : 'border border-[var(--line)] bg-[var(--panel)] hover:scale-105'
              }`}
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`,
                      boxShadow: `0 4px 14px ${c.accent}55`,
                    }
                  : undefined
              }
            >
              <span className="text-base leading-none">{c.emoji}</span>
              <span
                className={`hidden text-[11px] font-semibold sm:inline ${
                  active ? 'text-[var(--ink)]' : 'text-[var(--mist)]'
                }`}
              >
                {c.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
