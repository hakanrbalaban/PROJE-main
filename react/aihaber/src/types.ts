export type CategoryId =
  | 'tumu'
  | 'dunya'
  | 'teknoloji'
  | 'bilim'
  | 'ekonomi'
  | 'spor'
  | 'kultur'

export type NewsItem = {
  id: string
  title: string
  snippet: string
  source: string
  sourceId: string
  category: Exclude<CategoryId, 'tumu'>
  categoryLabel: string
  publishedAt: string | null
  url: string
  coverSeed: string
  imagePolicy: 'original-cover'
}

export type NewsResponse = {
  updatedAt: string
  count: number
  policy: {
    text: string
    images: string
    links: string
  }
  errors: { feed: string; message: string }[]
  items: NewsItem[]
}

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'dunya', label: 'Dünya' },
  { id: 'teknoloji', label: 'Teknoloji' },
  { id: 'bilim', label: 'Bilim' },
  { id: 'ekonomi', label: 'Ekonomi' },
  { id: 'spor', label: 'Spor' },
]

export const TONE: Record<string, { from: string; to: string; accent: string }> = {
  dunya: { from: '#0b3d4a', to: '#1a7a6d', accent: '#2ec4b6' },
  teknoloji: { from: '#14301f', to: '#3d5a12', accent: '#d6ff3c' },
  bilim: { from: '#0f2744', to: '#1d4e89', accent: '#7dd3fc' },
  ekonomi: { from: '#3a2a12', to: '#8a5a18', accent: '#ffb347' },
  spor: { from: '#3a1512', to: '#8f2f22', accent: '#ff6b4a' },
  kultur: { from: '#2a1840', to: '#5a3a8a', accent: '#c4a1ff' },
}

export function relativeTime(iso: string | null): string {
  if (!iso) return 'az önce'
  const diff = Date.now() - Date.parse(iso)
  if (Number.isNaN(diff) || diff < 0) return 'az önce'
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} sa`
  const d = Math.floor(h / 24)
  return `${d} g`
}

export function tileSize(index: number): 'hero' | 'wide' | 'tall' | 'std' {
  const pattern = ['hero', 'std', 'tall', 'wide', 'std', 'std', 'tall', 'std', 'wide', 'std'] as const
  return pattern[index % pattern.length]
}
