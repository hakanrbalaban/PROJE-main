/** In-memory engagement: views, likes, emoji reactions, comments */

const REACTIONS = ['🔥', '😍', '😂', '😮', '👏', '💯']

/** @type {Map<string, { views: number, likes: number, likedBy: Set<string>, viewedBy: Set<string>, reactions: Record<string, number>, reactedBy: Map<string, string>, comments: any[] }>} */
const store = new Map()

function ensure(articleId) {
  if (!store.has(articleId)) {
    const hash = [...articleId].reduce((a, c) => a + c.charCodeAt(0), 0)
    store.set(articleId, {
      views: 800 + (hash % 4200),
      likes: 40 + (hash % 380),
      likedBy: new Set(),
      viewedBy: new Set(),
      reactions: Object.fromEntries(REACTIONS.map((e, i) => [e, 5 + ((hash + i * 17) % 90)])),
      reactedBy: new Map(),
      comments: seedComments(articleId, hash),
    })
  }
  return store.get(articleId)
}

function seedComments(articleId, hash) {
  const names = ['Elif ✨', 'Can 🔥', 'Zeynep 💕', 'Mert 🚀', 'Ayşe 🌟', 'Deniz 😎']
  const texts = [
    'Bu yazı tam viral olacak 🔥🔥',
    'Kaydettim, arkadaşlara atıyorum 📲',
    'Emoji’lerle anlatmış gibi 😂💯',
    'Sidebar’daki öneriler de çok iyi!',
    'Daha fazla böyle içerik lütfen 😍',
    'Manşet slider efsane olmuş 👏',
  ]
  const count = 2 + (hash % 4)
  const out = []
  for (let i = 0; i < count; i++) {
    out.push({
      id: `${articleId}-c${i}`,
      name: names[(hash + i) % names.length],
      text: texts[(hash + i * 3) % texts.length],
      createdAt: new Date(Date.now() - (i + 1) * 3600000 * ((hash % 5) + 1)).toISOString(),
      likes: 2 + ((hash + i) % 24),
    })
  }
  return out
}

export function getEngagement(articleId) {
  const e = ensure(articleId)
  return {
    views: e.views,
    likes: e.likes,
    reactions: { ...e.reactions },
    commentCount: e.comments.length,
  }
}

export function attachEngagement(article) {
  return { ...article, ...getEngagement(article.id) }
}

export function recordView(articleId, visitorId) {
  const e = ensure(articleId)
  if (!e.viewedBy.has(visitorId)) {
    e.viewedBy.add(visitorId)
    e.views += 1
  }
  return getEngagement(articleId)
}

export function toggleLike(articleId, visitorId) {
  const e = ensure(articleId)
  let liked = false
  if (e.likedBy.has(visitorId)) {
    e.likedBy.delete(visitorId)
    e.likes = Math.max(0, e.likes - 1)
  } else {
    e.likedBy.add(visitorId)
    e.likes += 1
    liked = true
  }
  return { ...getEngagement(articleId), liked }
}

export function setReaction(articleId, visitorId, emoji) {
  const e = ensure(articleId)
  if (!REACTIONS.includes(emoji)) throw new Error('invalid_reaction')
  const prev = e.reactedBy.get(visitorId)
  if (prev === emoji) {
    e.reactions[emoji] = Math.max(0, (e.reactions[emoji] || 0) - 1)
    e.reactedBy.delete(visitorId)
    return { ...getEngagement(articleId), myReaction: null }
  }
  if (prev) e.reactions[prev] = Math.max(0, (e.reactions[prev] || 0) - 1)
  e.reactions[emoji] = (e.reactions[emoji] || 0) + 1
  e.reactedBy.set(visitorId, emoji)
  return { ...getEngagement(articleId), myReaction: emoji }
}

export function listComments(articleId) {
  return [...ensure(articleId).comments].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )
}

export function addComment(articleId, { name, text }) {
  const e = ensure(articleId)
  const cleanName = String(name || 'Anonim').trim().slice(0, 40) || 'Anonim'
  const cleanText = String(text || '').trim().slice(0, 500)
  if (cleanText.length < 2) throw new Error('empty_comment')
  const comment = {
    id: `${articleId}-${Date.now().toString(36)}`,
    name: cleanName.includes(' ') || /[\u{1F300}-\u{1FAFF}]/u.test(cleanName) ? cleanName : `${cleanName} 💬`,
    text: cleanText,
    createdAt: new Date().toISOString(),
    likes: 0,
  }
  e.comments.unshift(comment)
  return comment
}

export function getReactionsList() {
  return REACTIONS
}

export function relatedScore(a, b) {
  let score = 0
  if (a.category === b.category) score += 5
  const tagsA = new Set(a.tags || [])
  for (const t of b.tags || []) if (tagsA.has(t)) score += 2
  return score
}
