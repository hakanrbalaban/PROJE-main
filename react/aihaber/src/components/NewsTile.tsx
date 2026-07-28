import type { NewsItem } from '../types'
import { relativeTime, tileSize } from '../types'
import { CoverArt } from './CoverArt'

type Props = {
  item: NewsItem
  index: number
  onReport: (item: NewsItem) => void
}

export function NewsTile({ item, index, onReport }: Props) {
  const size = tileSize(index)
  const sizeClass =
    size === 'hero'
      ? 'md:col-span-2 md:row-span-2 min-h-[340px] md:min-h-[420px]'
      : size === 'wide'
        ? 'md:col-span-2 min-h-[240px]'
        : size === 'tall'
          ? 'md:row-span-2 min-h-[340px]'
          : 'min-h-[240px]'

  const titleClass =
    size === 'hero'
      ? 'text-[1.65rem] md:text-[2.15rem] leading-[1.08]'
      : size === 'wide' || size === 'tall'
        ? 'text-[1.25rem] md:text-[1.4rem] leading-[1.15]'
        : 'text-[1.05rem] leading-[1.2]'

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[var(--panel)] ${sizeClass} animate-rise transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[rgba(214,255,60,0.35)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]`}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex min-h-0 flex-1 flex-col"
      >
        <div className="relative h-[46%] min-h-[120px] flex-shrink-0 overflow-hidden">
          <CoverArt category={item.category} seed={item.coverSeed} title={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--panel)] via-transparent to-transparent opacity-90" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className="rounded-md px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
              style={{
                background: 'rgba(4,24,20,0.7)',
                color: 'var(--volt)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item.categoryLabel}
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-3 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.14em] text-[rgba(216,239,232,0.55)]">
            <span>{item.source}</span>
            <span>{relativeTime(item.publishedAt)}</span>
          </div>
          <h2
            className={`${titleClass} font-semibold text-[var(--mist)] transition-colors group-hover:text-[var(--volt)]`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.title}
          </h2>
          {item.snippet && (size === 'hero' || size === 'wide' || size === 'tall') && (
            <p className="line-clamp-3 text-[0.92rem] leading-relaxed text-[rgba(216,239,232,0.68)]">
              {item.snippet}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between pt-1 text-[0.8rem] text-[rgba(216,239,232,0.5)]">
            <span>Kaynağa git</span>
            <span className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </a>

      <button
        type="button"
        onClick={() => onReport(item)}
        className="absolute right-3 top-3 z-10 rounded-md px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[rgba(216,239,232,0.7)] transition hover:text-[var(--volt)]"
        style={{
          background: 'rgba(4,24,20,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Telif
      </button>
    </article>
  )
}
