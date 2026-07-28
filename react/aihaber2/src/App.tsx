import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react'
import { Header } from './components/Header'
import { EmojiNav } from './components/EmojiNav'
import { HeadlineSlider } from './components/HeadlineSlider'
import { ArticleCard } from './components/ArticleCard'
import { ArticleView } from './components/ArticleView'
import { Sidebar } from './components/Sidebar'
import { SiteFooter } from './components/SiteFooter'
import { SkeletonGrid } from './components/SkeletonGrid'
import { ReportModal } from './components/ReportModal'
import { HorizontalScroller } from './components/HorizontalScroller'
import { EditorPanel } from './components/EditorPanel'
import { CookieBanner } from './components/CookieBanner'
import { PhotoGallery, VideoGallery } from './components/MediaGalleries'
import { CategoryIconGrid, CategoryMagazineBlocks, MagazineMosaic } from './components/MagazineHome'
import {
  AboutPage,
  ContactPage,
  CookiePage,
  CopyrightPage,
  DmcaPage,
  KvkkPage,
  PrivacyPage,
  PublishingStandardsPage,
} from './components/pages/StaticPages'
import { useArticle, useArticles } from './hooks/useArticles'
import { useWidgets } from './hooks/useWidgets'
import {
  applyViralFilter,
  CATEGORY_META,
  VIRAL_FILTERS,
  type AppView,
  type Article,
  type CategoryId,
  type ViralFilterId,
} from './types'

const STATIC_VIEWS = new Set<AppView>([
  'hakkimizda',
  'iletisim',
  'telif',
  'dmca',
  'gizlilik',
  'kvkk',
  'cerez',
  'yayin',
  'editor',
])

function scrollToId(id: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function parseHash(): { view: AppView; articleId: string | null } {
  const raw = window.location.hash.replace(/^#\/?/, '').trim()
  if (!raw) return { view: 'home', articleId: null }
  const [head, ...rest] = raw.split('/')
  if (head === 'yazi' && rest[0]) return { view: 'article', articleId: decodeURIComponent(rest[0]) }
  if (STATIC_VIEWS.has(head as AppView)) return { view: head as AppView, articleId: null }
  return { view: 'home', articleId: null }
}

function setHash(view: AppView, articleId?: string | null) {
  if (view === 'home') {
    history.replaceState(null, '', window.location.pathname + window.location.search)
    return
  }
  if (view === 'article' && articleId) {
    window.location.hash = `#/yazi/${encodeURIComponent(articleId)}`
    return
  }
  window.location.hash = `#/${view}`
}

export default function App() {
  const initial = parseHash()
  const [view, setView] = useState<AppView>(initial.view)
  const [category, setCategory] = useState<CategoryId>('tumu')
  const [viralFilter, setViralFilter] = useState<ViralFilterId>('all')
  const [query, setQuery] = useState('')
  const [articleId, setArticleId] = useState<string | null>(initial.articleId)
  const [report, setReport] = useState<Article | null>(null)
  const [pending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)
  const { state, refresh } = useArticles(category, deferredQuery)
  const { data: widgets, loading: widgetsLoading } = useWidgets()
  const { article, loading: articleLoading, error: articleError } = useArticle(
    view === 'article' ? articleId : null,
  )

  useEffect(() => {
    const onHash = () => {
      const next = parseHash()
      setView(next.view)
      setArticleId(next.articleId)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (view === 'home') document.title = 'AİORA · Editöryel magazin'
    else if (view === 'editor') document.title = 'Editör · AİORA'
    else if (view !== 'article') document.title = `${view} · AİORA`
  }, [view])

  const readyItems = state.status === 'ready' ? state.items : []
  const filteredItems = useMemo(
    () => applyViralFilter(readyItems, viralFilter),
    [readyItems, viralFilter],
  )

  const hasSearch = Boolean(deferredQuery.trim()) || viralFilter !== 'all' || category !== 'tumu'
  const headlines =
    category === 'tumu' && viralFilter === 'all' && !deferredQuery
      ? filteredItems.slice(0, 6)
      : []
  const listItems = headlines.length > 0 ? filteredItems.slice(headlines.length) : filteredItems
  const trendingRail = useMemo(
    () => applyViralFilter(readyItems, viralFilter === 'all' ? 'viral' : viralFilter).slice(0, 10),
    [readyItems, viralFilter],
  )
  const mostReadRail = useMemo(
    () => applyViralFilter(readyItems, 'viewed').slice(0, 10),
    [readyItems],
  )
  const latestRail = useMemo(
    () =>
      [...readyItems]
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
        .slice(0, 10),
    [readyItems],
  )

  const isHome = view === 'home'
  const activeCategory = CATEGORY_META.find((c) => c.id === category)
  const activeViral = VIRAL_FILTERS.find((f) => f.id === viralFilter)

  function goHome() {
    setView('home')
    setArticleId(null)
    setHash('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigate(next: AppView) {
    setView(next)
    setArticleId(null)
    setHash(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openArticle(id: string) {
    setArticleId(id)
    setView('article')
    setHash('article', id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectCategory(c: CategoryId) {
    startTransition(() => setCategory(c))
    if (!isHome) {
      setView('home')
      setArticleId(null)
      setHash('home')
    }
    setTimeout(() => scrollToId('yazilar'), 80)
  }

  function selectViral(f: ViralFilterId) {
    startTransition(() => setViralFilter(f))
    if (!isHome) {
      setView('home')
      setArticleId(null)
      setHash('home')
    }
    setTimeout(() => scrollToId('yazilar'), 80)
  }

  function goSection(sectionId: string) {
    if (!isHome) {
      setView('home')
      setArticleId(null)
      setHash('home')
      setTimeout(() => scrollToId(sectionId), 120)
      return
    }
    scrollToId(sectionId)
  }

  const listTitle =
    viralFilter !== 'all'
      ? `${activeViral?.emoji || ''} ${activeViral?.label || 'Filtre'} yazıları`
      : category === 'tumu'
        ? 'Son yazılar'
        : `${activeCategory?.emoji || ''} ${activeCategory?.label}`

  const listSubtitle =
    viralFilter !== 'all'
      ? activeViral?.hint || 'Emoji filtresi'
      : category === 'tumu'
        ? deferredQuery.trim()
          ? `“${deferredQuery.trim()}” araması`
          : 'Editöryel magazin — emojili detaylı arama'
        : `${activeCategory?.label} kategorisinde filtrelenmiş yazılar`

  return (
    <div className="min-h-screen">
      <Header
        category={category}
        onCategory={selectCategory}
        viralFilter={viralFilter}
        onViralFilter={selectViral}
        query={query}
        onQuery={setQuery}
        onHome={goHome}
        onEditor={() => navigate('editor')}
        compact={!isHome}
        resultCount={state.status === 'ready' ? filteredItems.length : undefined}
      />

      {isHome && (
        <EmojiNav
          category={category}
          onCategory={selectCategory}
          viralFilter={viralFilter}
          onViralFilter={selectViral}
          onSection={goSection}
        />
      )}

      {isHome && headlines.length > 0 && state.status === 'ready' && (
        <HeadlineSlider articles={headlines} onOpen={openArticle} />
      )}

      <main>
        {view === 'hakkimizda' && <AboutPage onBack={goHome} onNavigate={navigate} />}
        {view === 'iletisim' && <ContactPage onBack={goHome} onNavigate={navigate} />}
        {view === 'telif' && <CopyrightPage onBack={goHome} onNavigate={navigate} />}
        {view === 'dmca' && <DmcaPage onBack={goHome} onNavigate={navigate} />}
        {view === 'gizlilik' && <PrivacyPage onBack={goHome} onNavigate={navigate} />}
        {view === 'kvkk' && <KvkkPage onBack={goHome} onNavigate={navigate} />}
        {view === 'cerez' && <CookiePage onBack={goHome} onNavigate={navigate} />}
        {view === 'yayin' && <PublishingStandardsPage onBack={goHome} onNavigate={navigate} />}

        {view === 'editor' && (
          <EditorPanel
            onBack={goHome}
            onSaved={(item) => {
              refresh()
              openArticle(item.slug || item.id)
            }}
          />
        )}

        {view === 'article' && (
          <>
            {articleLoading && (
              <p className="px-4 py-16 text-center text-[var(--muted)]">Makale yükleniyor…</p>
            )}
            {articleError && (
              <p className="px-4 py-16 text-center text-[var(--hot)]">{articleError}</p>
            )}
            {article && (
              <ArticleView
                article={article}
                onBack={goHome}
                onOpen={(id) => openArticle(id)}
                onReport={(a) => setReport(a)}
              />
            )}
          </>
        )}

        {isHome && (
          <>
            {state.status === 'ready' && (
              <MagazineMosaic
                articles={latestRail.length ? latestRail : readyItems}
                onOpen={(id) => openArticle(id)}
                onViewAll={() => {
                  selectCategory('tumu')
                  goSection('yazilar')
                }}
              />
            )}

            {state.status === 'ready' && (
              <CategoryIconGrid
                category={category}
                articles={readyItems}
                onSelect={(id) => {
                  selectCategory(id)
                  goSection('yazilar')
                }}
              />
            )}

            {state.status === 'ready' && trendingRail.length > 0 && (
              <div id="trendler" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
                <HorizontalScroller
                  title={viralFilter === 'all' ? 'Viral / Trend' : `${activeViral?.emoji} Trend`}
                  emoji="🔥"
                  subtitle={
                    viralFilter === 'all'
                      ? 'En çok etkileşim — kaydır veya tümünü aç'
                      : activeViral?.hint
                  }
                  viewAllLabel="Tümünü gör"
                  onViewAll={() => {
                    selectViral('viral')
                    goSection('yazilar')
                  }}
                >
                  {trendingRail.map((item, index) => (
                    <ArticleCard
                      key={`trend-${item.id}`}
                      article={item}
                      index={index}
                      onOpen={(id) => openArticle(id)}
                      compact
                    />
                  ))}
                </HorizontalScroller>
              </div>
            )}

            {state.status === 'ready' && mostReadRail.length > 0 && (
              <div id="cok-okunan" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-8 md:px-6">
                <HorizontalScroller
                  title="En çok okunan"
                  emoji="👁"
                  subtitle="Görüntülenme liderleri"
                  viewAllLabel="Tümünü gör"
                  onViewAll={() => {
                    selectViral('viewed')
                    goSection('yazilar')
                  }}
                >
                  {mostReadRail.map((item, index) => (
                    <ArticleCard
                      key={`read-${item.id}`}
                      article={item}
                      index={index}
                      onOpen={(id) => openArticle(id)}
                      compact
                    />
                  ))}
                </HorizontalScroller>
              </div>
            )}

            {state.status === 'ready' && latestRail.length > 0 && (
              <div id="son-yazilar" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-8 md:px-6">
                <HorizontalScroller
                  title="En son"
                  emoji="🆕"
                  subtitle="Yeni eklenen yazılar"
                  viewAllLabel="Tümünü oku"
                  onViewAll={() => goSection('yazilar')}
                >
                  {latestRail.map((item, index) => (
                    <ArticleCard
                      key={`new-${item.id}`}
                      article={item}
                      index={index}
                      onOpen={(id) => openArticle(item.slug || id)}
                      compact
                    />
                  ))}
                </HorizontalScroller>
              </div>
            )}

            {state.status === 'ready' && <PhotoGallery />}
            {state.status === 'ready' && <VideoGallery />}

            {state.status === 'ready' && (
              <CategoryMagazineBlocks
                articles={readyItems}
                onOpen={(id) => openArticle(id)}
                onSelectCategory={(id) => {
                  selectCategory(id)
                  goSection('yazilar')
                }}
              />
            )}

            <div
              id="yazilar"
              className="mx-auto grid max-w-[1280px] scroll-mt-40 gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px] md:px-6"
            >
              <section className={pending ? 'opacity-70 transition' : ''}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                      {listTitle}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">{listSubtitle}</p>
                    {hasSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('')
                          selectCategory('tumu')
                          selectViral('all')
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--cyan)] hover:border-[var(--hot)]"
                      >
                        Filtreyi kaldır · Tümü
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={refresh}
                    className="rounded-full border border-[var(--line)] bg-[rgba(26,15,46,0.85)] px-3 py-2 text-xs font-extrabold text-[var(--cyan)] hover:border-[var(--cyan)]"
                  >
                    Tüm arşiv · Yenile
                  </button>
                </div>

                {state.status === 'loading' && <SkeletonGrid />}

                {state.status === 'error' && (
                  <div className="rounded-2xl border border-[var(--hot)]/30 bg-[rgba(255,45,106,0.08)] p-6 text-center">
                    <p className="text-[var(--hot)]">Akış alınamadı: {state.message}</p>
                    <button
                      type="button"
                      onClick={refresh}
                      className="mt-4 rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] px-5 py-2 font-semibold text-white"
                    >
                      Tekrar dene
                    </button>
                  </div>
                )}

                {state.status === 'ready' && listItems.length === 0 && (
                  <p className="text-[var(--muted)]">Bu filtrede yazı yok</p>
                )}

                {state.status === 'ready' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {listItems.map((item, index) => (
                      <ArticleCard
                        key={item.id}
                        article={item}
                        index={index}
                        onOpen={(id) => openArticle(item.slug || id)}
                        onReport={(a) => setReport(a)}
                      />
                    ))}
                  </div>
                )}
              </section>

              <Sidebar data={widgets} loading={widgetsLoading} />
            </div>
          </>
        )}

        <SiteFooter
          onNavigate={navigate}
          count={state.status === 'ready' ? filteredItems.length : undefined}
        />
      </main>

      <CookieBanner onOpenPrivacy={() => navigate('cerez')} />
      {report && <ReportModal item={report} onClose={() => setReport(null)} />}
    </div>
  )
}
