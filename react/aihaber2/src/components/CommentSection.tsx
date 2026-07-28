import { useEffect, useState, type FormEvent } from 'react'
import type { Comment } from '../types'
import { apiHeaders, postJson } from '../lib/api'

interface Props {
  articleId: string
}

export function CommentSection({ articleId }: Props) {
  const [items, setItems] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/articles/${articleId}/comments`, { headers: apiHeaders() })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [articleId])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError(null)
    try {
      const data = await postJson<{ comment: Comment }>(`/api/articles/${articleId}/comments`, {
        name: name || 'Anonim 💬',
        text,
      })
      setItems((prev) => [data.comment, ...prev])
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.6)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
        💬 Yorumlar ({items.length})
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Viral sohbet — nazik kal, emoji serbest 🔥</p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adın + emoji (ör. Elif ✨)"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm outline-none focus:border-[var(--hot)]"
          maxLength={40}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ne düşünüyorsun? 😍🔥😂"
          rows={3}
          required
          className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--ink)] px-3 py-2 text-sm outline-none focus:border-[var(--cyan)]"
          maxLength={500}
        />
        {error && <p className="text-sm text-[var(--hot)]">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {sending ? 'Gönderiliyor…' : 'Yorum yap 🚀'}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-[var(--muted)]">Yorumlar yükleniyor…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-[var(--muted)]">İlk yorumu sen yaz ✨</p>
        )}
        {items.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[var(--line)] bg-[rgba(10,6,18,0.45)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-white">{c.name}</p>
              <span className="text-[10px] text-[var(--muted)]">
                {new Date(c.createdAt).toLocaleString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[rgba(243,232,255,0.9)]">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
