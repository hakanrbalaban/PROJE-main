import { useState, type FormEvent } from 'react'
import type { Article } from '../types'

interface Props {
  item: Article
  onClose: () => void
}

export function ReportModal({ item, onClose }: Props) {
  const [reason, setReason] = useState('telif')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: item.id, reason, email, message }),
      })
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(7,11,20,0.72)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              Telif bildir
            </h2>
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{item.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-white">
            ✕
          </button>
        </div>

        {sent ? (
          <p className="text-sm text-[var(--teal)]">Bildiriminiz alındı. Teşekkürler.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--muted)]">Gerekçe</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--ink-2)] px-3 py-2"
              >
                <option value="telif">Telif ihlali</option>
                <option value="yanlis">Yanlış / zararlı içerik</option>
                <option value="diger">Diğer</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--muted)]">E-posta</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--ink-2)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[var(--muted)]">Açıklama</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--ink-2)] px-3 py-2"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[var(--coral)] py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Gönderiliyor…' : 'Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
