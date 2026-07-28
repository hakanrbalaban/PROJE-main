export type AppView = 'home' | 'hakkimizda' | 'iletisim' | 'dmca'

type Props = {
  onNavigate: (view: AppView) => void
  policy?: { text: string; images: string; links: string }
  count?: number
}

const LINKS: { id: AppView; label: string }[] = [
  { id: 'hakkimizda', label: 'Hakkımızda' },
  { id: 'iletisim', label: 'İletişim' },
  { id: 'dmca', label: 'DMCA / Telif' },
]

export function SiteFooter({ onNavigate, policy, count }: Props) {
  return (
    <footer className="mx-auto mt-14 max-w-[1400px] space-y-5 px-4 text-[0.82rem] leading-relaxed text-[rgba(216,239,232,0.45)] md:px-8">
      {policy && (
        <div className="space-y-2">
          <p>{policy.text}</p>
          <p>{policy.images}</p>
          <p>{policy.links}</p>
        </div>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Yasal sayfalar">
        {LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onNavigate(link.id)}
            className="rounded-lg border border-[var(--line)] bg-[rgba(10,47,41,0.45)] px-3.5 py-2 text-[0.8rem] text-[rgba(216,239,232,0.7)] transition hover:border-[rgba(214,255,60,0.3)] hover:text-[var(--volt)]"
          >
            {link.label}
          </button>
        ))}
      </nav>

      <p className="pt-1 text-[rgba(216,239,232,0.3)]">
        NABIZ{count != null ? ` · ${count} başlık` : ''} · kaynaklar kamuya açık RSS
      </p>
    </footer>
  )
}
