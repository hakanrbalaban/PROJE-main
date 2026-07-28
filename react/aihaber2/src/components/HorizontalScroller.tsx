import { useRef, type ReactNode } from 'react'

interface Props {
  title: string
  emoji?: string
  subtitle?: string
  children: ReactNode
  className?: string
  viewAllLabel?: string
  onViewAll?: () => void
}

export function HorizontalScroller({
  title,
  emoji,
  subtitle,
  children,
  className = '',
  viewAllLabel = 'Tümünü gör',
  onViewAll,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: -1 | 1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.75), behavior: 'smooth' })
  }

  return (
    <section className={`relative ${className}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">
            {emoji ? <span className="mr-2">{emoji}</span> : null}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="rounded-full border border-[var(--line)] bg-[rgba(26,15,46,0.85)] px-3 py-2 text-xs font-extrabold text-[var(--cyan)] transition hover:border-[var(--cyan)] hover:bg-[rgba(0,229,192,0.12)]"
            >
              {viewAllLabel} →
            </button>
          )}
          <button
            type="button"
            aria-label="Sola kaydır"
            onClick={() => scroll(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-lg text-white transition hover:border-[var(--hot)] hover:bg-[var(--hot)]"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Sağa kaydır"
            onClick={() => scroll(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-lg text-white transition hover:border-[var(--cyan)] hover:bg-[var(--cyan)] hover:text-[var(--ink)]"
          >
            →
          </button>
        </div>
      </div>
      <div ref={ref} className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {children}
      </div>
    </section>
  )
}
