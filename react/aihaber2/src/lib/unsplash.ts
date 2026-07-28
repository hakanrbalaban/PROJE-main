/** Deterministic Unsplash covers (curated photo IDs — no API key). */

const PHOTOS = [
  '1500530855697-b586d89ba3ee',
  '1497366216548-37526070297c',
  '1469474968028-56623f02e42e',
  '1506905925346-21bda4d32df4',
  '1519681393784-d120267933ba',
  '1470071459604-3b5ec3a7fe05',
  '1441974231531-c6227db76b6e',
  '1504674900247-0877df9cc836',
  '1517248135467-4c7eded6e7c0',
  '1528164344705-ba810fc98ed4',
  '1488646953014-85cb44e25828',
  '1518770660439-4636190af475',
  '1517694712202-14dd9538aa97',
  '1451187580459-43490279c0fa',
  '1532094349884-543bc11b234d',
  '1571019613454-1cb2f99b2d8b',
  '1516321318423-f06f85e504b3',
  '1499750310107-5fef28a66643',
  '1432821596592-e2c18b78144f',
  '1522202176988-66273c2fd55f',
  '1511988617331-a931d97d5b5a',
  '1475724017909-c28c8ac76bcb',
  '1492691527719-9d1e07e534b4',
  '1470225620780-dba8ba36b745',
  '1485846234645-a62644f84728',
  '1511632765486-a01980e58a9d',
  '1544367567-0f2fcb009e0b',
  '1507003211169-0a1dd7228f2d',
  '1551836022-d5d88e9218df',
  '1529626455594-4ff0802cfb7e',
]

function hashSeed(seed: string | number) {
  const s = String(seed || 'aiora')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function unsplashUrl(seed: string | number, w = 1280, h = 720) {
  const id = PHOTOS[hashSeed(seed) % PHOTOS.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
}

export function unsplashGallery(count = 12, prefix = 'gallery') {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    src: unsplashUrl(`${prefix}-${i}`, 800, 600),
    title: `Galeri ${i + 1}`,
  }))
}
