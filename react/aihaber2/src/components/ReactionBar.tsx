import { useEffect, useState, type MouseEvent } from 'react'
import { postJson } from '../lib/api'
import { formatCount } from '../types'

export const REACTION_EMOJIS = ['🔥', '😍', '😂', '😮', '👏', '💯'] as const

const EMPTY_REACTIONS: Record<string, number> = {}

interface Props {
  articleId: string
  likes: number
  views: number
  reactions?: Record<string, number>
  compact?: boolean
  onUpdate?: (data: {
    likes: number
    views: number
    reactions: Record<string, number>
  }) => void
}

export function ReactionBar({
  articleId,
  likes,
  views,
  reactions,
  compact,
  onUpdate,
}: Props) {
  const reactsIn = reactions ?? EMPTY_REACTIONS
  const [likeCount, setLikeCount] = useState(likes)
  const [liked, setLiked] = useState(false)
  const [reacts, setReacts] = useState(reactsIn)
  const [myReaction, setMyReaction] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLikeCount(likes)
    setReacts(reactsIn)
    setLiked(false)
    setMyReaction(null)
    setError(null)
  }, [articleId])

  useEffect(() => {
    setLikeCount(likes)
  }, [likes])

  async function handleLike(e?: MouseEvent) {
    e?.stopPropagation()
    e?.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const prevLiked = liked
    const prevCount = likeCount
    setLiked(!prevLiked)
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)
    try {
      const data = await postJson<{
        likes: number
        liked: boolean
        reactions: Record<string, number>
        views: number
      }>(`/api/articles/${articleId}/like`)
      setLikeCount(data.likes)
      setLiked(data.liked)
      onUpdate?.({ likes: data.likes, views: data.views, reactions: data.reactions })
    } catch {
      setLiked(prevLiked)
      setLikeCount(prevCount)
      setError('Beğeni kaydedilemedi — API çalışıyor mu?')
    } finally {
      setBusy(false)
    }
  }

  async function handleReact(emoji: string, e?: MouseEvent) {
    e?.stopPropagation()
    e?.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const prev = myReaction
    const prevReacts = { ...reacts }
    const next = { ...reacts }
    if (prev === emoji) {
      next[emoji] = Math.max(0, (next[emoji] || 0) - 1)
      setMyReaction(null)
    } else {
      if (prev) next[prev] = Math.max(0, (next[prev] || 0) - 1)
      next[emoji] = (next[emoji] || 0) + 1
      setMyReaction(emoji)
    }
    setReacts(next)
    try {
      const data = await postJson<{
        likes: number
        views: number
        reactions: Record<string, number>
        myReaction: string | null
      }>(`/api/articles/${articleId}/react`, { emoji })
      setReacts(data.reactions)
      setMyReaction(data.myReaction)
      onUpdate?.({ likes: data.likes, views: data.views, reactions: data.reactions })
    } catch {
      setReacts(prevReacts)
      setMyReaction(prev)
      setError('Tepki kaydedilemedi — API çalışıyor mu?')
    } finally {
      setBusy(false)
    }
  }

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={busy}
          onClick={handleLike}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition disabled:opacity-60 ${
            liked
              ? 'bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] text-white'
              : 'border border-[var(--line)] bg-[var(--panel)] text-white hover:border-[var(--hot)]'
          }`}
          aria-label="Beğen"
        >
          {liked ? '❤️' : '🤍'} {formatCount(likeCount)}
        </button>
        {REACTION_EMOJIS.map((emoji) => {
          const count = reacts[emoji] || 0
          const active = myReaction === emoji
          return (
            <button
              key={emoji}
              type="button"
              disabled={busy}
              onClick={(ev) => handleReact(emoji, ev)}
              className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-sm transition disabled:opacity-60 ${
                active
                  ? 'bg-[var(--hot)] text-white shadow-md shadow-[rgba(255,45,106,0.35)]'
                  : 'border border-[var(--line)] bg-[var(--panel)] hover:scale-105'
              }`}
              aria-label={`${emoji} tepki`}
            >
              <span>{emoji}</span>
              {count > 0 && <span className="text-[10px] font-semibold">{formatCount(count)}</span>}
            </button>
          )
        })}
        {error && <span className="w-full text-[10px] text-[var(--hot)]">{error}</span>}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[rgba(255,45,106,0.12)] to-[rgba(0,229,192,0.08)] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          disabled={busy}
          onClick={handleLike}
          className={`rounded-full px-4 py-2 font-bold transition disabled:opacity-60 ${
            liked
              ? 'bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] text-white'
              : 'border border-[var(--line)] bg-[var(--panel)] text-white hover:border-[var(--hot)]'
          }`}
        >
          {liked ? '❤️ Beğenildi' : '🤍 Beğen'} · {formatCount(likeCount)}
        </button>
        <span className="text-[var(--muted)]">👁 {formatCount(views)} görüntülenme</span>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--hot)]">
        Emoji tepkiler — tıkla!
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTION_EMOJIS.map((emoji) => {
          const count = reacts[emoji] || 0
          const active = myReaction === emoji
          return (
            <button
              key={emoji}
              type="button"
              disabled={busy}
              onClick={(ev) => handleReact(emoji, ev)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition disabled:opacity-60 ${
                active
                  ? 'bg-[var(--hot)] text-white shadow-md shadow-[rgba(255,45,106,0.35)]'
                  : 'border border-[var(--line)] bg-[var(--panel)] hover:scale-105'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-semibold">{formatCount(count)}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="mt-2 text-xs text-[var(--hot)]">{error}</p>}
    </div>
  )
}
