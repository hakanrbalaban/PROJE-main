import { useDeferredValue, useState } from 'react'
import { Header } from './components/Header'
import { NewsTile } from './components/NewsTile'
import { AboutPage, ContactPage, DmcaPage } from './components/pages/StaticPages'
import { ReportModal } from './components/ReportModal'
import { SiteFooter, type AppView } from './components/SiteFooter'
import { SkeletonGrid } from './components/SkeletonGrid'
import { Ticker } from './components/Ticker'
import { useNews } from './hooks/useNews'
import type { CategoryId, NewsItem } from './types'

export default function App() {
  const [view, setView] = useState<AppView>('home')
  const [category, setCategory] = useState<CategoryId>('tumu')
  const [query, setQuery] = useState('')
  const [report, setReport] = useState<NewsItem | null>(null)
  const deferredQuery = useDeferredValue(query)
  const { state, refresh } = useNews(category, deferredQuery)

  const items = state.status === 'ready' ? state.data.items : []
  const headlines = items.slice(0, 18).map((i) => i.title)
  const isHome = view === 'home'

  function goHome() {
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(next: AppView) {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-16">
      <Header
        category={category}
        onCategory={(c) => {
          setCategory(c)
          if (!isHome) goHome()
        }}
        query={query}
        onQuery={setQuery}
        onRefresh={refresh}
        updatedAt={state.status === 'ready' ? state.data.updatedAt : undefined}
        loading={state.status === 'loading'}
        onHome={goHome}
        compact={!isHome}
      />

      {isHome && (
        <Ticker headlines={headlines.length ? headlines : ['NABIZ yükleniyor — dünya haberlerinin nabzı']} />
      )}

      <main className="mt-8">
        {!isHome && view === 'hakkimizda' && (
          <AboutPage onBack={goHome} onNavigate={navigate} />
        )}
        {!isHome && view === 'iletisim' && (
          <ContactPage onBack={goHome} onNavigate={navigate} />
        )}
        {!isHome && view === 'dmca' && <DmcaPage onBack={goHome} onNavigate={navigate} />}

        {isHome && state.status === 'loading' && <SkeletonGrid />}

        {isHome && state.status === 'error' && (
          <div className="mx-auto max-w-lg px-4 text-center">
            <p className="text-lg text-[var(--coral)]">Akış alınamadı: {state.message}</p>
            <p className="mt-2 text-sm text-[rgba(216,239,232,0.55)]">
              API sunucusunun çalıştığından emin olun (`npm run dev`).
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 rounded-full bg-[var(--volt)] px-5 py-2 font-semibold text-[var(--ink)]"
            >
              Tekrar dene
            </button>
          </div>
        )}

        {isHome && state.status === 'ready' && items.length === 0 && (
          <p className="px-4 text-center text-[rgba(216,239,232,0.6)]">Bu filtrede haber yok.</p>
        )}

        {isHome && state.status === 'ready' && items.length > 0 && (
          <div className="mx-auto grid max-w-[1400px] auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 px-4 md:grid-cols-3 md:gap-5 md:px-8 lg:grid-cols-4">
            {items.map((item, index) => (
              <NewsTile
                key={item.id}
                item={item}
                index={index}
                onReport={(newsItem) => setReport(newsItem)}
              />
            ))}
          </div>
        )}

        <SiteFooter
          onNavigate={navigate}
          policy={isHome && state.status === 'ready' ? state.data.policy : undefined}
          count={isHome && state.status === 'ready' ? state.data.count : undefined}
        />
      </main>

      {report && <ReportModal item={report} onClose={() => setReport(null)} />}
    </div>
  )
}
