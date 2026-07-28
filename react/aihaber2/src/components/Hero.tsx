import type { Article } from '../types'

interface Props {
  article: Article
  onOpen: (id: string) => void
}

export function Hero({ article, onOpen }: Props) {
  return (
    <section className="relative min-h-[72vh] w-full overflow-hidden">
      <img
        src={article.coverUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[rgba(7,11,20,0.55)] to-[rgba(7,11,20,0.25)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(62,207,191,0.18),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-[72vh] max-w-[1280px] flex-col justify-end px-4 pb-14 pt-28 md:px-6">
        <p
          className="animate-rise mb-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
          style={{ animationDelay: '0.05s' }}
        >
          AİORA
        </p>
        <p
          className="animate-rise mb-6 max-w-xl text-base text-[rgba(215,222,233,0.78)] sm:text-lg"
          style={{ animationDelay: '0.12s' }}
        >
          AI ile üretilmiş, haber içermeyen telifsiz magazin blogu — teknoloji, yaşam, bilim ve daha fazlası.
        </p>
        <div className="animate-rise max-w-3xl" style={{ animationDelay: '0.2s' }}>
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
            {article.categoryLabel} · {article.readMinutes} dk
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-[rgba(215,222,233,0.82)]">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onOpen(article.id)}
              className="rounded-full bg-[var(--teal)] px-6 py-2.5 font-semibold text-[var(--ink)] transition hover:brightness-110"
            >
              Yazıyı oku
            </button>
            <a
              href="#yazilar"
              className="rounded-full border border-[var(--line)] bg-[rgba(18,26,43,0.55)] px-6 py-2.5 font-medium text-[var(--mist)] backdrop-blur"
            >
              Tüm yazılar
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
