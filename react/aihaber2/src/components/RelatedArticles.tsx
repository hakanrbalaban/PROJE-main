import { useEffect, useState } from 'react'
import type { Article } from '../types'
import { formatCount } from '../types'
import { ArticleCard } from './ArticleCard'
import { CoverImage } from './CoverImage'
import { HorizontalScroller } from './HorizontalScroller'

interface Props {
  articleId: string
  onOpen: (id: string) => void
}

export function RelatedArticles({ articleId, onOpen }: Props) {
  const [items, setItems] = useState<Article[]>([])

  useEffect(() => {
    fetch(`/api/articles/${articleId}/related?limit=8`)
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
  }, [articleId])

  if (!items.length) return null

  return (
    <div className="mt-12">
      <HorizontalScroller
        title="Benzer yazılar"
        emoji="🔗"
        subtitle="Aynı vibe, farklı başlıklar"
      >
        {items.map((a, i) => (
          <ArticleCard key={a.id} article={a} index={i} onOpen={onOpen} compact />
        ))}
      </HorizontalScroller>
    </div>
  )
}

export function ArticleSidebar({
  related,
  trending,
  onOpen,
}: {
  related: Article[]
  trending: Article[]
  onOpen: (id: string) => void
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
      <section className="widget">
        <h3 className="widget-title">📈 Çok okunanlar</h3>
        <ul className="space-y-3">
          {trending.slice(0, 5).map((a, i) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onOpen(a.slug || a.id)}
                className="flex w-full gap-3 text-left transition hover:opacity-90"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[var(--hot)] to-[var(--orange)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="line-clamp-2 text-sm font-semibold text-white">{a.title}</span>
                  <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                    👁 {formatCount(a.views)} · ❤️ {formatCount(a.likes)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="widget">
        <h3 className="widget-title">✨ Benzer içerikler</h3>
        <ul className="space-y-3">
          {related.slice(0, 4).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onOpen(a.slug || a.id)}
                className="flex w-full gap-3 text-left"
              >
                <CoverImage
                  src={a.coverUrl}
                  seed={a.id}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
                <span className="line-clamp-3 text-sm font-medium text-[var(--mist)]">{a.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="widget overflow-hidden">
        <h3 className="widget-title">🎉 Viral ipucu</h3>
        <p className="text-sm leading-relaxed text-[var(--mist)]">
          Beğen, emoji bırak, yorum yaz — AİORA’da her etkileşim yazıyı yukarı taşır 🚀
        </p>
      </section>
    </aside>
  )
}
