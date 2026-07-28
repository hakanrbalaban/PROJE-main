import type { ReactNode } from 'react'
import type { WidgetsData } from '../types'

const WEATHER_LABEL: Record<number, string> = {
  0: 'Açık',
  1: 'Çoğunlukla açık',
  2: 'Parçalı bulutlu',
  3: 'Bulutlu',
  45: 'Sisli',
  61: 'Yağmurlu',
  80: 'Sağanak',
  95: 'Fırtına',
}

function Shell({
  title,
  emoji,
  children,
}: {
  title: string
  emoji?: string
  children: ReactNode
}) {
  return (
    <section className="widget animate-rise overflow-hidden">
      <h3 className="widget-title">
        {emoji ? <span className="mr-1.5">{emoji}</span> : null}
        {title}
      </h3>
      {children}
    </section>
  )
}

export function Sidebar({ data, loading }: { data: WidgetsData | null; loading: boolean }) {
  if (loading) {
    return (
      <aside className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-[var(--line)] bg-[rgba(18,26,43,0.5)]"
          />
        ))}
      </aside>
    )
  }

  if (!data) {
    return (
      <aside className="widget text-sm text-[var(--muted)]">Widgetler yüklenemedi.</aside>
    )
  }

  return (
    <aside className="space-y-4">
      <Shell title="Hava durumu" emoji="🌤️">
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          {Math.round(data.weather.temperature)}
          {data.weather.unit}
        </p>
        <p className="mt-1 text-sm text-[var(--mist)]">
          {data.weather.city} · {WEATHER_LABEL[data.weather.code] || 'Değişken'}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Nem %{data.weather.humidity} · Rüzgâr {data.weather.wind} km/s
        </p>
      </Shell>

      <Shell title="Döviz" emoji="💱">
        <ul className="space-y-2">
          {data.currency.pairs.map((p) => (
            <li key={p.code} className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">{p.label || p.code}</span>
              <span className="font-bold text-white">
                {p.value == null ? '—' : p.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.currency.source}</p>
      </Shell>

      <Shell title="Piyasa / borsa" emoji="📈">
        <ul className="space-y-2">
          {data.markets.items.map((m) => (
            <li key={m.symbol} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <span className="font-semibold text-white">{m.name}</span>
                <span className="ml-1 text-[10px] text-[var(--muted)]">{m.symbol}</span>
              </span>
              <span className="text-right">
                <span className="block font-bold text-white">
                  {m.value.toLocaleString('tr-TR')}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    m.change >= 0 ? 'text-[var(--lime)]' : 'text-[var(--hot)]'
                  }`}
                >
                  {m.change >= 0 ? '+' : ''}
                  {m.change}%
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.markets.note}</p>
      </Shell>

      <Shell title="Günün sözü" emoji="💬">
        <blockquote className="font-[family-name:var(--font-serif)] text-[15px] italic leading-relaxed text-[rgba(242,245,250,0.92)]">
          “{data.quote.text}”
        </blockquote>
        <p className="mt-2 text-xs text-[var(--sand)]">— {data.quote.author}</p>
      </Shell>

      <Shell title="Günün burcu" emoji="🔮">
        <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {data.horoscopes.map((h) => (
            <div key={h.id} className="border-b border-[var(--line)] pb-2 last:border-0">
              <p className="text-sm font-semibold text-white">
                {h.label}{' '}
                <span className="text-[10px] font-normal text-[var(--muted)]">{h.range}</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{h.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-[var(--muted)]">Eğlence amaçlıdır; kader değildir.</p>
      </Shell>

      <Shell title="Hadis" emoji="📿">
        <p className="font-[family-name:var(--font-serif)] text-sm leading-relaxed text-[rgba(242,245,250,0.9)]">
          {data.hadith.text}
        </p>
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.hadith.source}</p>
      </Shell>

      <Shell title="Ayet mealı" emoji="📖">
        <p className="font-[family-name:var(--font-serif)] text-sm leading-relaxed text-[rgba(242,245,250,0.9)]">
          {data.verse.text}
        </p>
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.verse.ref}</p>
      </Shell>

      <Shell title={data.religiousTip.title} emoji="✨">
        <p className="text-sm text-[var(--mist)]">{data.religiousTip.text}</p>
      </Shell>

      <Shell title="Namaz vakitleri" emoji="🕌">
        <p className="mb-2 text-xs text-[var(--muted)]">
          {data.prayer.city} · {data.prayer.date}
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(data.prayer.times).map(([k, v]) => (
            <li key={k} className="rounded-lg bg-[rgba(7,11,20,0.45)] px-2 py-1.5">
              <span className="block text-[10px] uppercase tracking-wide text-[var(--muted)]">{k}</span>
              <span className="font-semibold text-white">{v}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.prayer.note}</p>
      </Shell>

      <Shell title="Günün kelimesi" emoji="🔤">
        <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--sand)]">
          {data.word.word}
        </p>
        <p className="mt-1 text-sm text-[var(--mist)]">{data.word.meaning}</p>
      </Shell>

      <Shell title="İlginç bilgi" emoji="💡">
        <p className="text-sm leading-relaxed text-[var(--mist)]">{data.funFact}</p>
      </Shell>
    </aside>
  )
}
