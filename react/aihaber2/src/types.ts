export type CategoryId =
  | 'tumu'
  | 'teknoloji'
  | 'bilim'
  | 'yasam'
  | 'kultur'
  | 'saglik'
  | 'seyahat'
  | 'yemek'
  | 'astroloji'
  | 'din'
  | 'egitim'
  | 'doga'
  | 'tasarim'
  | 'psikoloji'

export type AppView =
  | 'home'
  | 'article'
  | 'editor'
  | 'hakkimizda'
  | 'iletisim'
  | 'dmca'
  | 'telif'
  | 'gizlilik'
  | 'kvkk'
  | 'cerez'
  | 'yayin'

export interface Category {
  id: CategoryId | string
  label: string
  tone: string
  blurb: string
  emoji?: string
}

export interface Article {
  id: string
  slug?: string
  title: string
  excerpt: string
  body: string
  category: string
  categoryLabel: string
  tags: string[]
  author: string
  authorNote?: string
  metaDescription?: string
  status?: 'published' | 'draft'
  publishedAt: string
  updatedAt?: string
  readMinutes: number
  coverPrompt: string
  coverUrl: string
  aiGenerated: boolean
  copyrightSafe: boolean
  sourceNote: string
  views?: number
  likes?: number
  reactions?: Record<string, number>
  commentCount?: number
}

export interface Comment {
  id: string
  name: string
  text: string
  createdAt: string
  likes: number
}

export interface WidgetsData {
  updatedAt: string
  quote: { text: string; author: string }
  hadith: { text: string; source: string }
  verse: { text: string; ref: string }
  funFact: string
  word: { word: string; meaning: string }
  horoscopes: { id: string; label: string; range: string; text: string }[]
  weather: {
    city: string
    temperature: number
    humidity: number
    wind: number
    code: number
    unit: string
    source: string
    offline?: boolean
  }
  currency: {
    base: string
    pairs: { code: string; value: number | null; label: string }[]
    source: string
    offline?: boolean
  }
  markets: {
    note: string
    items: { symbol: string; name: string; value: number; change: number }[]
    source: string
  }
  prayer: {
    city: string
    date: string
    times: Record<string, string>
    note: string
  }
  religiousTip: { title: string; text: string }
}

export const CATEGORY_META: {
  id: CategoryId
  label: string
  emoji: string
  accent: string
}[] = [
  { id: 'tumu', label: 'Tümü', emoji: '✨', accent: '#ff2d6a' },
  { id: 'teknoloji', label: 'Teknoloji', emoji: '💻', accent: '#00e5c0' },
  { id: 'bilim', label: 'Bilim', emoji: '🔬', accent: '#4dabff' },
  { id: 'yasam', label: 'Yaşam', emoji: '🌟', accent: '#ffd23f' },
  { id: 'kultur', label: 'Kültür', emoji: '🎬', accent: '#ff6b9d' },
  { id: 'saglik', label: 'Sağlık', emoji: '💪', accent: '#7dffb3' },
  { id: 'seyahat', label: 'Seyahat', emoji: '✈️', accent: '#5ce1ff' },
  { id: 'yemek', label: 'Yemek', emoji: '🍜', accent: '#ff9f1c' },
  { id: 'astroloji', label: 'Astroloji', emoji: '🔮', accent: '#c77dff' },
  { id: 'din', label: 'Din', emoji: '🕌', accent: '#f4c95f' },
  { id: 'egitim', label: 'Eğitim', emoji: '📚', accent: '#6ea8fe' },
  { id: 'doga', label: 'Doğa', emoji: '🌿', accent: '#52d681' },
  { id: 'tasarim', label: 'Tasarım', emoji: '🎨', accent: '#ff7a59' },
  { id: 'psikoloji', label: 'Psikoloji', emoji: '🧠', accent: '#ff8fab' },
]

/** Üst arama yanındaki viral / tepki filtreleri */
export type ViralFilterId =
  | 'all'
  | 'viral'
  | 'liked'
  | 'viewed'
  | '😍'
  | '😂'
  | '😮'
  | '👏'
  | '💯'

export const VIRAL_FILTERS: {
  id: ViralFilterId
  emoji: string
  label: string
  hint: string
}[] = [
  { id: 'all', emoji: '✨', label: 'Tümü', hint: 'Tüm yazılar' },
  { id: 'viral', emoji: '🔥', label: 'Viral', hint: 'En viral yazılar' },
  { id: 'liked', emoji: '❤️', label: 'Beğeni', hint: 'En çok beğenilen' },
  { id: 'viewed', emoji: '👁', label: 'Okunan', hint: 'En çok görüntülenen' },
  { id: '😍', emoji: '😍', label: 'Aşk', hint: '😍 tepkili yazılar' },
  { id: '😂', emoji: '😂', label: 'Güldüren', hint: '😂 tepkili yazılar' },
  { id: '😮', emoji: '😮', label: 'Şaşırtan', hint: '😮 tepkili yazılar' },
  { id: '👏', emoji: '👏', label: 'Alkış', hint: '👏 tepkili yazılar' },
  { id: '💯', emoji: '💯', label: 'Tam puan', hint: '💯 tepkili yazılar' },
]

export function viralScore(a: Article) {
  return (a.views || 0) + (a.likes || 0) * 3
}

export function applyViralFilter(items: Article[], filter: ViralFilterId): Article[] {
  if (filter === 'all') return items

  if (filter === 'viral') {
    return [...items]
      .filter((a) => viralScore(a) > 2000 || (a.likes || 0) > 120 || (a.views || 0) > 1800)
      .sort((a, b) => viralScore(b) - viralScore(a))
  }
  if (filter === 'liked') {
    return [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }
  if (filter === 'viewed') {
    return [...items].sort((a, b) => (b.views || 0) - (a.views || 0))
  }

  const emoji = filter
  return [...items]
    .filter((a) => (a.reactions?.[emoji] || 0) > 0)
    .sort((a, b) => (b.reactions?.[emoji] || 0) - (a.reactions?.[emoji] || 0))
}

export function formatCount(n?: number) {
  const v = n ?? 0
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}B`
  return String(v)
}

export function getVisitorId() {
  const key = 'aiora_visitor'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = `v_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return 'anon'
  }
}
