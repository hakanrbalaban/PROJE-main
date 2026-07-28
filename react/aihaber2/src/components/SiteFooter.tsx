import type { AppView } from '../types'

interface Props {
  onNavigate: (v: AppView) => void
  count?: number
}

export function SiteFooter({ onNavigate, count }: Props) {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[rgba(10,6,18,0.85)]">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white">
            AİORA
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Editöryel magazin. Özgün yazılar, yazar kutusu, emoji tepkiler. Haber ajansı yok —
            kaliteli magazin var.
          </p>
          {typeof count === 'number' && (
            <p className="mt-3 text-xs font-semibold text-[var(--hot)]">{count} yazı yayında</p>
          )}
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--hot)]">
            Sayfalar
          </p>
          <ul className="space-y-2 text-sm text-[var(--mist)]">
            {(
              [
                ['hakkimizda', 'Hakkımızda'],
                ['iletisim', 'İletişim'],
                ['gizlilik', 'Gizlilik'],
                ['kvkk', 'KVKK'],
                ['cerez', 'Çerez'],
                ['yayin', 'Yayın standartları'],
                ['telif', 'Telif & Politika'],
                ['dmca', 'DMCA'],
                ['editor', '✍️ Editör'],
              ] as const
            ).map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  className="hover:text-[var(--cyan)]"
                  onClick={() => onNavigate(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cyan)]">
            SEO / yasal
          </p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>
              <a className="hover:text-[var(--cyan)]" href="/sitemap.xml">
                sitemap.xml
              </a>
            </li>
            <li>
              <a className="hover:text-[var(--cyan)]" href="/robots.txt">
                robots.txt
              </a>
            </li>
            <li>Kalıcı yazı URL: #/yazi/slug</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} AİORA · Editöryel magazin
      </div>
    </footer>
  )
}
