import express from 'express'
import cors from 'cors'
import { CATEGORIES } from './categories.js'
import {
  deleteArticle,
  filterArticles,
  getArticle,
  getRelatedArticles,
  getTrending,
  listArticles,
  upsertArticle,
} from './store.js'
import { autoPublishOnce, generateArticle, getAiProviderInfo } from './ai.js'
import { getWidgets } from './widgets.js'
import {
  addComment,
  getEngagement,
  getReactionsList,
  listComments,
  recordView,
  setReaction,
  toggleLike,
} from './engagement.js'
import { SITE } from './siteConfig.js'

const app = express()
const PORT = process.env.PORT || 5176
/** AdSense dostu: varsayılan kapalı. Açmak için AUTO_PUBLISH_MS=43200000 (12 saat) */
const AUTO_MS = Number(process.env.AUTO_PUBLISH_MS ?? 0)
const DAILY_TARGET = Number(process.env.DAILY_ARTICLE_TARGET || 2)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

function visitorId(req) {
  return String(req.headers['x-visitor-id'] || req.body?.visitorId || 'anon').slice(0, 64)
}

function requireEditor(req, res, next) {
  const key = String(req.headers['x-editor-key'] || req.body?.editorKey || '')
  if (!key || key !== SITE.editorKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }
  next()
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    brand: SITE.name,
    mode: 'editorial-magazine',
    policy: 'no-news-feeds',
    ai: getAiProviderInfo(),
    articles: listArticles().length,
    dailyTarget: DAILY_TARGET,
    autoPublishMinutes: AUTO_MS > 0 ? Math.round(AUTO_MS / 60000) : 0,
    siteUrl: SITE.url,
  })
})

app.get('/api/site', (_req, res) => {
  res.json({
    name: SITE.name,
    url: SITE.url,
    contactEmail: SITE.contactEmail,
    copyrightEmail: SITE.copyrightEmail,
  })
})

app.get('/api/categories', (_req, res) => {
  res.json({
    categories: Object.values(CATEGORIES),
    note: 'Haber, finans ve hukuk kategorisi yok — telif ve risk güvenliği için üretilmez.',
  })
})

app.get('/api/articles', (req, res) => {
  const category = String(req.query.category || 'tumu')
  const q = String(req.query.q || '')
  const items = filterArticles({ category, q })
  res.json({
    count: items.length,
    updatedAt: new Date().toISOString(),
    policy: {
      content: 'Özgün editöryel / AI-destekli magazin yazıları',
      images: 'AI veya lisanslı kapaklar',
      news: false,
      finance: false,
      law: false,
      copyright: 'Üçüncü taraf haber metni ve yayıncı fotoğrafı kullanılmaz',
    },
    items,
  })
})

app.get('/api/trending', (req, res) => {
  const limit = Math.min(20, Number(req.query.limit) || 10)
  res.json({ items: getTrending(limit) })
})

app.get('/api/articles/:id', (req, res) => {
  const item = getArticle(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  res.json({ item })
})

app.get('/api/articles/:id/related', (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 6)
  const items = getRelatedArticles(req.params.id, limit)
  res.json({ items })
})

app.post('/api/articles/:id/view', (req, res) => {
  const item = getArticle(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  const engagement = recordView(item.id, visitorId(req))
  res.json({ ok: true, engagement })
})

app.post('/api/articles/:id/like', (req, res) => {
  const item = getArticle(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  const result = toggleLike(item.id, visitorId(req))
  res.json({ ok: true, ...result })
})

app.post('/api/articles/:id/react', (req, res) => {
  try {
    const item = getArticle(req.params.id)
    if (!item) return res.status(404).json({ error: 'not_found' })
    const emoji = String(req.body?.emoji || '')
    const result = setReaction(item.id, visitorId(req), emoji)
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

app.get('/api/articles/:id/comments', (req, res) => {
  const item = getArticle(req.params.id)
  if (!item) return res.status(404).json({ error: 'not_found' })
  res.json({
    items: listComments(item.id),
    reactions: getReactionsList(),
    engagement: getEngagement(item.id),
  })
})

app.post('/api/articles/:id/comments', (req, res) => {
  try {
    const item = getArticle(req.params.id)
    if (!item) return res.status(404).json({ error: 'not_found' })
    const comment = addComment(item.id, {
      name: req.body?.name,
      text: req.body?.text,
    })
    res.json({ ok: true, comment })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

/** Editör: liste (taslaklar dahil) */
app.get('/api/editor/articles', requireEditor, (_req, res) => {
  res.json({ items: listArticles({ includeDrafts: true }) })
})

app.get('/api/editor/articles/:id', requireEditor, (req, res) => {
  const item = getArticle(req.params.id, { includeDrafts: true })
  if (!item) return res.status(404).json({ error: 'not_found' })
  res.json({ item })
})

app.post('/api/editor/articles', requireEditor, (req, res) => {
  try {
    const b = req.body || {}
    if (!String(b.title || '').trim() || !String(b.body || '').trim()) {
      return res.status(400).json({ ok: false, error: 'title_and_body_required' })
    }
    if (b.category && !CATEGORIES[b.category]) {
      return res.status(400).json({ ok: false, error: 'invalid_category' })
    }
    const item = upsertArticle({
      id: b.id,
      title: String(b.title).trim().slice(0, 160),
      excerpt: String(b.excerpt || '').trim().slice(0, 400),
      metaDescription: String(b.metaDescription || b.excerpt || '').trim().slice(0, 160),
      body: String(b.body),
      category: b.category && CATEGORIES[b.category] ? b.category : 'yasam',
      tags: Array.isArray(b.tags)
        ? b.tags.map(String).slice(0, 8)
        : String(b.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 8),
      author: String(b.author || 'AİORA Editör').slice(0, 80),
      authorNote: String(b.authorNote || '').slice(0, 1200),
      coverUrl: b.coverUrl ? String(b.coverUrl).slice(0, 800) : undefined,
      coverPrompt: b.coverPrompt ? String(b.coverPrompt).slice(0, 300) : undefined,
      slug: b.slug ? String(b.slug) : undefined,
      status: b.status === 'draft' ? 'draft' : 'published',
      aiGenerated: Boolean(b.aiGenerated),
      sourceNote: b.sourceNote
        ? String(b.sourceNote).slice(0, 240)
        : 'Editöryel özgün içerik — haber ajansı metni içermez.',
      publishedAt: b.publishedAt || undefined,
    })
    res.json({ ok: true, item })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.delete('/api/editor/articles/:id', requireEditor, (req, res) => {
  const ok = deleteArticle(req.params.id)
  if (!ok) return res.status(404).json({ ok: false, error: 'not_found' })
  res.json({ ok: true })
})

app.post('/api/editor/auth', (req, res) => {
  const key = String(req.body?.editorKey || '')
  if (key && key === SITE.editorKey) return res.json({ ok: true })
  res.status(401).json({ ok: false, error: 'unauthorized' })
})

app.post('/api/editor/ai-draft', requireEditor, async (req, res) => {
  req.setTimeout?.(180000)
  res.setTimeout?.(180000)
  try {
    const category = req.body?.category
    const draft = await generateArticle(
      category && CATEGORIES[category] ? category : undefined,
      { persist: false, status: 'draft' },
    )
    const words = String(draft.body || '')
      .split(/\s+/)
      .filter(Boolean).length
    res.json({ ok: true, draft, words, readMinutes: Math.max(4, Math.round(words / 180)) })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'generate_failed' })
  }
})

app.post('/api/generate', async (req, res) => {
  req.setTimeout?.(180000)
  res.setTimeout?.(180000)
  try {
    const category = req.body?.category
    const item = await generateArticle(category && CATEGORIES[category] ? category : undefined)
    const words = String(item.body || '')
      .split(/\s+/)
      .filter(Boolean).length
    res.json({ ok: true, item, words, readMinutes: item.readMinutes })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'generate_failed' })
  }
})

app.get('/api/widgets', async (_req, res) => {
  try {
    const data = await getWidgets()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/report', (req, res) => {
  const { articleId, reason, email, message } = req.body || {}
  console.log('[report]', { articleId, reason, email, message: String(message || '').slice(0, 500) })
  res.json({ ok: true, message: 'Bildiriminiz alındı. Telif ekibi inceleyecek.' })
})

app.get('/robots.txt', (_req, res) => {
  const base = SITE.url.replace(/\/$/, '')
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /#/editor\nSitemap: ${base}/sitemap.xml\n`,
  )
})

app.get('/sitemap.xml', (_req, res) => {
  const base = SITE.url.replace(/\/$/, '')
  const items = listArticles()
  const staticPaths = ['', 'hakkimizda', 'iletisim', 'telif', 'dmca', 'gizlilik', 'kvkk', 'cerez', 'yayin']
  const urls = [
    ...staticPaths.map(
      (p) => `  <url><loc>${base}/${p ? `#/${p}` : ''}</loc><changefreq>weekly</changefreq><priority>${p ? '0.6' : '1.0'}</priority></url>`,
    ),
    ...items.map((a) => {
      const loc = `${base}/#/yazi/${a.slug || a.id}`
      const lastmod = (a.updatedAt || a.publishedAt || '').slice(0, 10)
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`
    }),
  ]
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
  )
})

app.listen(PORT, () => {
  console.log(`AİORA API http://localhost:${PORT}`)
  console.log(
    AUTO_MS > 0
      ? `Otomatik yayın: ~${DAILY_TARGET}/gün (her ${Math.round(AUTO_MS / 60000)} dk)`
      : 'Otomatik yayın KAPALI (editöryel kalite için) — AUTO_PUBLISH_MS ile açılır',
  )
  if (AUTO_MS > 0) {
    setInterval(() => {
      autoPublishOnce()
        .then((item) => {
          if (item) console.log('[auto-publish]', item.title)
        })
        .catch((err) => console.warn('[auto-publish]', err.message))
    }, AUTO_MS)
  }
})
