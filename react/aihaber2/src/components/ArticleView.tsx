import { useEffect, useState } from 'react'
import type { Article } from '../types'
import { formatCount } from '../types'
import { apiHeaders, postJson } from '../lib/api'
import { CoverImage } from './CoverImage'
import { ReactionBar } from './ReactionBar'
import { CommentSection } from './CommentSection'
import { RelatedArticles, ArticleSidebar } from './RelatedArticles'

interface Props {
  article: Article
  onBack: () => void
  onOpen: (id: string) => void
  onReport: (a: Article) => void
}

type Block =
  | { type: 'h2' | 'h3' | 'p'; text: string }
  | { type: 'ul'; items: string[] }

/** Markdown işaretlerini (* ve #) metinden tamamen temizler */
function cleanInline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*#`]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function renderBody(body: string): Block[] {
  const blocks: Block[] = []

  function pushList(text: string) {
    const last = blocks[blocks.length - 1]
    if (last && last.type === 'ul') last.items.push(text)
    else blocks.push({ type: 'ul', items: [text] })
  }

  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue
      const cells = line
        .split('|')
        .map((c) => cleanInline(c))
        .filter(Boolean)
      if (cells.length) pushList(cells.join(' · '))
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const text = cleanInline(heading[2])
      if (text) blocks.push({ type: heading[1].length >= 3 ? 'h3' : 'h2', text })
      continue
    }

    if (/^[-*+]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const text = cleanInline(line.replace(/^([-*+]|\d+[.)])\s+/, ''))
      if (text) pushList(text)
      continue
    }

    const text = cleanInline(line)
    if (text) blocks.push({ type: 'p', text })
  }

  return blocks
}

export function ArticleView({ article, onBack, onOpen, onReport }: Props) {
  const blocks = renderBody(article.body)
  const [views, setViews] = useState(article.views || 0)
  const [likes, setLikes] = useState(article.likes || 0)
  const [reactions, setReactions] = useState(article.reactions || {})
  const [related, setRelated] = useState<Article[]>([])
  const [trending, setTrending] = useState<Article[]>([])

  useEffect(() => {
    setViews(article.views || 0)
    setLikes(article.likes || 0)
    setReactions(article.reactions || {})
    const title = `${article.title} · AİORA`
    document.title = title
    const desc = article.metaDescription || article.excerpt || ''
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', desc.slice(0, 160))

    postJson<{ engagement: { views: number; likes: number; reactions: Record<string, number> } }>(
      `/api/articles/${article.id}/view`,
    )
      .then((data) => {
        setViews(data.engagement.views)
        setLikes(data.engagement.likes)
        setReactions(data.engagement.reactions)
      })
      .catch(() => {})

    fetch(`/api/articles/${article.id}/related?limit=6`)
      .then((r) => r.json())
      .then((d) => setRelated(d.items || []))
      .catch(() => setRelated([]))

    fetch('/api/trending?limit=6', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => setTrending(d.items || []))
      .catch(() => setTrending([]))
  }, [article.id, article.title, article.excerpt, article.metaDescription])

  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
      <article>
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-[var(--muted)] hover:text-[var(--hot)]"
        >
          ← Yazılara dön
        </button>

        <div className="overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_20px_60px_rgba(255,45,106,0.12)]">
          <CoverImage
            src={article.coverUrl}
            seed={article.id}
            alt=""
            className="aspect-[16/9] w-full object-cover"
            loading="eager"
          />
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(0,229,192,0.18)] px-3 py-1 text-xs font-bold text-[var(--cyan)]">
              {article.categoryLabel}
            </span>
            <span className="viral-badge">🔥 Magazin</span>
            <span className="text-xs text-[var(--muted)]">
              👁 {formatCount(views)} · ❤️ {formatCount(likes)} · {article.readMinutes} dk
            </span>
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {article.author} ·{' '}
            {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {article.aiGenerated ? ' · AI destekli' : ' · Editöryel'}
          </p>
          <p className="mt-4 rounded-xl border border-[var(--line)] bg-[rgba(255,45,106,0.08)] px-4 py-3 text-sm text-[rgba(243,232,255,0.85)]">
            {article.sourceNote}
          </p>
        </div>

        <div className="prose-aiora mt-8">
          {blocks.map((b, i) => {
            if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
            if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>
            if (b.type === 'ul')
              return (
                <ul key={i}>
                  {b.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )
            return <p key={i}>{b.text}</p>
          })}
        </div>

        {article.authorNote && (
          <aside className="mt-10 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[rgba(255,45,106,0.12)] to-[rgba(0,229,192,0.08)] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--hot)]">
              Yazar yorumu
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mist)]">
              “{article.authorNote}”
            </p>
            <p className="mt-3 text-sm font-semibold text-white">— {article.author}</p>
          </aside>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--cyan)]"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-8" id="tepkiler">
          <ReactionBar
            key={article.id}
            articleId={article.id}
            likes={likes}
            views={views}
            reactions={reactions}
            onUpdate={(d) => {
              setLikes(d.likes)
              setViews(d.views)
              setReactions(d.reactions)
            }}
          />
        </div>

        <CommentSection articleId={article.id} />

        <RelatedArticles articleId={article.id} onOpen={onOpen} />

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => onReport(article)}
            className="rounded-full border border-[var(--hot)]/40 px-4 py-2 text-sm text-[var(--hot)]"
          >
            Telif bildir
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--lime)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
          >
            Ana sayfa ✨
          </button>
        </div>
      </article>

      <ArticleSidebar related={related} trending={trending} onOpen={onOpen} />
    </div>
  )
}
