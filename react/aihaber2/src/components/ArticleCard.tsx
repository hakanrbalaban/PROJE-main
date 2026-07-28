import type { Article } from '../types'
import { formatCount } from '../types'
import { CoverImage } from './CoverImage'
import { ReactionBar } from './ReactionBar'

interface Props {
  article: Article
  index?: number
  onOpen: (id: string) => void
  onReport?: (a: Article) => void
  compact?: boolean
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

export function ArticleCard({ article, index = 0, onOpen, onReport, compact }: Props) {
  const viral = (article.views || 0) > 2500 || (article.likes || 0) > 200

  return (
    <article
      className={`animate-rise group overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.75)] transition hover:border-[var(--hot)]/40 hover:shadow-[0_12px_40px_rgba(255,45,106,0.15)] ${
        compact ? 'min-w-[260px] max-w-[280px] snap-start' : ''
      }`}
      style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
    >
      <button type="button" onClick={() => onOpen(article.slug || article.id)} className="block w-full text-left">
        <div className={`relative overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[16/10]'}`}>
          <CoverImage
            src={article.coverUrl}
            seed={article.id}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
          <span className="absolute left-3 top-3 rounded-full bg-[rgba(10,6,18,0.8)] px-2.5 py-1 text-[11px] font-semibold text-[var(--cyan)] backdrop-blur">
            {article.categoryLabel}
          </span>
          {viral && (
            <span className="viral-badge absolute right-3 top-3">🔥 Viral</span>
          )}
          <div className="absolute bottom-3 left-3 flex gap-2 text-[11px] font-semibold text-white">
            <span className="rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
              👁 {formatCount(article.views)}
            </span>
            <span className="rounded-full bg-black/45 px-2 py-0.5 backdrop-blur">
              ❤️ {formatCount(article.likes)}
            </span>
          </div>
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-snug text-white">
            {article.title}
          </h3>
          {!compact && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{article.excerpt}</p>
          )}
          <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>
              {formatDate(article.publishedAt)} · {article.readMinutes} dk
            </span>
            {article.aiGenerated && <span className="text-[var(--sun)]">AI ✨</span>}
          </div>
        </div>
      </button>

      <div className="border-t border-[var(--line)] px-3 py-2.5">
        <ReactionBar
          articleId={article.id}
          likes={article.likes || 0}
          views={article.views || 0}
          reactions={article.reactions}
          compact
        />
      </div>

      {onReport && (
        <div className="flex justify-end border-t border-[var(--line)] px-3 py-2">
          <button
            type="button"
            onClick={() => onReport(article)}
            className="text-[11px] text-[var(--muted)] hover:text-[var(--hot)]"
          >
            Telif bildir
          </button>
        </div>
      )}
    </article>
  )
}
