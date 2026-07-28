import { useEffect, useId, useState, type FormEvent } from 'react'
import type { NewsItem } from '../types'

type Props = {
  item: NewsItem
  onClose: () => void
}

const CONTACT_EMAIL = 'telif@nabiz.app'

export function ReportModal({ item, onClose }: Props) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  function submit(e: FormEvent) {
    e.preventDefault()
    const body = [
      'Tür: Telif bildirimi',
      `Başlık: ${item.title}`,
      `Kaynak: ${item.source}`,
      `URL: ${item.url}`,
      `Kategori: ${item.categoryLabel}`,
      '',
      `Ad: ${name || '—'}`,
      `E-posta: ${email || '—'}`,
      '',
      'Açıklama:',
      message || '—',
    ].join('\n')

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[NABIZ] Telif bildirimi: ${item.title.slice(0, 60)}`,
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailto
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(4,24,20,0.72)] p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-rise w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="text-xl font-semibold text-[var(--mist)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Telif bildirimi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[rgba(216,239,232,0.65)]">
              Bu haber kaydına ilişkin telif veya içerik kaldırma talebinizi iletin. DMCA süreci için
              DMCA sayfasını da inceleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-sm text-[rgba(216,239,232,0.7)] hover:border-[rgba(214,255,60,0.35)] hover:text-[var(--volt)]"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-[var(--line)] bg-[rgba(4,24,20,0.35)] p-3 text-sm">
          <p className="font-medium text-[var(--mist)] line-clamp-2">{item.title}</p>
          <p className="mt-1 text-[0.75rem] text-[rgba(216,239,232,0.45)]">
            {item.source} · {item.categoryLabel}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[rgba(216,239,232,0.55)]">Adınız</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[rgba(4,24,20,0.55)] px-3 py-2.5 text-[var(--mist)] outline-none ring-[var(--volt)] focus:ring-2"
              autoComplete="name"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[rgba(216,239,232,0.55)]">E-posta</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[rgba(4,24,20,0.55)] px-3 py-2.5 text-[var(--mist)] outline-none ring-[var(--volt)] focus:ring-2"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[rgba(216,239,232,0.55)]">Açıklama</span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-y rounded-xl border border-[var(--line)] bg-[rgba(4,24,20,0.55)] px-3 py-2.5 text-[var(--mist)] outline-none ring-[var(--volt)] focus:ring-2"
              placeholder="Hak sahipliğinizi ve talep ettiğiniz işlemi kısaca yazın…"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-[var(--volt)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:brightness-105"
            >
              E-posta ile gönder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[rgba(216,239,232,0.75)] hover:border-[rgba(214,255,60,0.3)]"
            >
              Vazgeç
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
