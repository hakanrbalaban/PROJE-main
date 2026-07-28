import express from 'express'
import cors from 'cors'
import Parser from 'rss-parser'
import { createHash } from 'crypto'

const app = express()
const PORT = process.env.PORT || 5174
const CACHE_MS = 5 * 60 * 1000

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'NabizNewsAggregator/1.0 (+local; headlines-only)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
})

const FEEDS = [
  { id: 'bbc-world', name: 'BBC World', category: 'dunya', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'bbc-tech', name: 'BBC Tech', category: 'teknoloji', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { id: 'bbc-science', name: 'BBC Science', category: 'bilim', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  { id: 'bbc-business', name: 'BBC Business', category: 'ekonomi', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { id: 'bbc-sport', name: 'BBC Sport', category: 'spor', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
  { id: 'npr', name: 'NPR', category: 'dunya', url: 'https://feeds.npr.org/1001/rss.xml' },
  { id: 'guardian', name: 'The Guardian', category: 'dunya', url: 'https://www.theguardian.com/world/rss' },
  { id: 'guardian-tech', name: 'Guardian Tech', category: 'teknoloji', url: 'https://www.theguardian.com/technology/rss' },
  { id: 'nasa', name: 'NASA', category: 'bilim', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
  { id: 'aljazeera', name: 'Al Jazeera', category: 'dunya', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'techcrunch', name: 'TechCrunch', category: 'teknoloji', url: 'https://techcrunch.com/feed/' },
  { id: 'wired', name: 'Wired', category: 'teknoloji', url: 'https://www.wired.com/feed/rss' },
  { id: 'ars', name: 'Ars Technica', category: 'teknoloji', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { id: 'cnbc', name: 'CNBC', category: 'ekonomi', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
  { id: 'espn', name: 'ESPN', category: 'spor', url: 'https://www.espn.com/espn/rss/news' },
]

const CATEGORY_META = {
  tumu: { label: 'Tümü', tone: 'ink' },
  dunya: { label: 'Dünya', tone: 'ocean' },
  teknoloji: { label: 'Teknoloji', tone: 'volt' },
  bilim: { label: 'Bilim', tone: 'aurora' },
  ekonomi: { label: 'Ekonomi', tone: 'amber' },
  spor: { label: 'Spor', tone: 'coral' },
  kultur: { label: 'Kültür', tone: 'plum' },
}

/** Strip HTML and keep a short fair-use snippet (headline aggregation). */
function cleanSnippet(html, max = 160) {
  if (!html) return ''
  const text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
}

function makeId(link, title) {
  return createHash('sha1').update(`${link || ''}|${title || ''}`).digest('hex').slice(0, 16)
}

/**
 * Publisher photos are typically copyrighted.
 * We never proxy or display them — only original category artwork seeds.
 */
function coverSeed(category, id) {
  return `${category}-${id}`
}

let cache = { at: 0, items: [], errors: [] }

async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url)
    return (result.items || []).slice(0, 12).map((item) => {
      const title = (item.title || '').trim()
      const link = item.link || item.guid || ''
      const id = makeId(link, title)
      return {
        id,
        title,
        snippet: cleanSnippet(item.contentSnippet || item.summary || item.content || ''),
        source: feed.name,
        sourceId: feed.id,
        category: feed.category,
        categoryLabel: CATEGORY_META[feed.category]?.label || feed.category,
        publishedAt: item.isoDate || item.pubDate || null,
        url: link,
        // Explicit: no publisher image — original cover only
        coverSeed: coverSeed(feed.category, id),
        imagePolicy: 'original-cover',
      }
    })
  } catch (err) {
    return { error: { feed: feed.id, message: err.message } }
  }
}

async function refreshNews() {
  const settled = await Promise.all(FEEDS.map(fetchFeed))
  const errors = []
  const items = []

  for (const part of settled) {
    if (part?.error) {
      errors.push(part.error)
      continue
    }
    items.push(...part)
  }

  // De-dupe by normalized title
  const seen = new Set()
  const unique = []
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9ğüşıöç\s]/gi, '').slice(0, 80)
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(item)
  }

  unique.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return tb - ta
  })

  cache = { at: Date.now(), items: unique, errors }
  return cache
}

async function getNews() {
  if (Date.now() - cache.at < CACHE_MS && cache.items.length) return cache
  return refreshNews()
}

app.use(cors())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, brand: 'NABIZ', mode: 'rss-headlines-only' })
})

app.get('/api/categories', (_req, res) => {
  res.json({
    categories: Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, ...meta })),
  })
})

app.get('/api/news', async (req, res) => {
  try {
    const data = await getNews()
    const category = String(req.query.category || 'tumu')
    const q = String(req.query.q || '').trim().toLowerCase()
    let items = data.items

    if (category && category !== 'tumu') {
      items = items.filter((i) => i.category === category)
    }
    if (q) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.snippet.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q),
      )
    }

    const limit = Math.min(Number(req.query.limit) || 60, 120)
    res.json({
      updatedAt: new Date(data.at).toISOString(),
      count: items.length,
      policy: {
        text: 'Yalnızca yayıncıların kamuya açık RSS başlıkları ve kısa özetleri gösterilir. Tam metin yok.',
        images:
          'Yayıncı fotoğrafları telifli olduğu için kullanılmaz; her haber için özgün kategori kapağı üretilir.',
        links: 'Okumak için orijinal kaynağa yönlendirilirsiniz.',
      },
      errors: data.errors,
      items: items.slice(0, limit),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/refresh', async (_req, res) => {
  try {
    const data = await refreshNews()
    res.json({ updatedAt: new Date(data.at).toISOString(), count: data.items.length, errors: data.errors })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`NABIZ API http://localhost:${PORT}`)
  refreshNews().catch((e) => console.warn('Initial fetch failed:', e.message))
})
