/** @typedef {{ id: string, label: string, tone: string, blurb: string, emoji: string }} Category */

/** Haber / finans / hukuk kategorisi YOK — telif ve risk nedeniyle. */
export const CATEGORIES = /** @type {Record<string, Category>} */ ({
  tumu: { id: 'tumu', label: 'Tümü', tone: 'ink', blurb: 'Tüm özgün yazılar', emoji: '✨' },
  teknoloji: { id: 'teknoloji', label: 'Teknoloji', tone: 'teal', blurb: 'Yazılım, cihazlar, dijital yaşam', emoji: '💻' },
  bilim: { id: 'bilim', label: 'Bilim', tone: 'sky', blurb: 'Keşifler, uzay, doğa bilimleri', emoji: '🔬' },
  yasam: { id: 'yasam', label: 'Yaşam', tone: 'sand', blurb: 'Üretkenlik, alışkanlıklar, denge', emoji: '🌟' },
  kultur: { id: 'kultur', label: 'Kültür', tone: 'rose', blurb: 'Sanat, kitap, sinema, müzik', emoji: '🎬' },
  saglik: { id: 'saglik', label: 'Sağlık', tone: 'mint', blurb: 'Wellness, hareket, zihin', emoji: '💪' },
  seyahat: { id: 'seyahat', label: 'Seyahat', tone: 'ocean', blurb: 'Rotalar, ipuçları, kültür', emoji: '✈️' },
  yemek: { id: 'yemek', label: 'Yemek', tone: 'amber', blurb: 'Tarifler, mutfak kültürü', emoji: '🍜' },
  astroloji: { id: 'astroloji', label: 'Astroloji', tone: 'violet', blurb: 'Burçlar ve gökyüzü notları', emoji: '🔮' },
  din: { id: 'din', label: 'Din & Maneviyat', tone: 'gold', blurb: 'İlham, bilgi, tefekkür', emoji: '🕌' },
  egitim: { id: 'egitim', label: 'Eğitim', tone: 'blue', blurb: 'Öğrenme, kariyer, beceri', emoji: '📚' },
  doga: { id: 'doga', label: 'Doğa', tone: 'leaf', blurb: 'Çevre, ekoloji, açık hava', emoji: '🌿' },
  tasarim: { id: 'tasarim', label: 'Tasarım', tone: 'coral', blurb: 'UI, mimari, yaratıcılık', emoji: '🎨' },
  psikoloji: { id: 'psikoloji', label: 'Psikoloji', tone: 'plum', blurb: 'Davranış, duygular, ilişkiler', emoji: '🧠' },
})

export const CATEGORY_IDS = Object.keys(CATEGORIES).filter((id) => id !== 'tumu')

export function imageUrl(prompt, seed = 1) {
  // Unsplash (ücretsiz, anahtarsız) — istemci CoverImage ile yedekler
  const photos = [
    '1500530855697-b586d89ba3ee',
    '1497366216548-37526070297c',
    '1469474968028-56623f02e42e',
    '1506905925346-21bda4d32df4',
    '1519681393784-d120267933ba',
    '1470071459604-3b5ec3a7fe05',
    '1441974231531-c6227db76b6e',
    '1504674900247-0877df9cc836',
    '1517248135467-4c7eded6e7c0',
    '1518770660439-4636190af475',
    '1517694712202-14dd9538aa97',
    '1451187580459-43490279c0fa',
    '1571019613454-1cb2f99b2d8b',
    '1499750310107-5fef28a66643',
    '1475724017909-c28c8ac76bcb',
    '1492691527719-9d1e07e534b4',
    '1485846234645-a62644f84728',
    '1544367567-0f2fcb009e0b',
  ]
  const h = [...String(prompt || seed)].reduce((a, c) => a + c.charCodeAt(0), Number(seed) || 0)
  const id = photos[Math.abs(h) % photos.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1280&h=720&q=80`
}
