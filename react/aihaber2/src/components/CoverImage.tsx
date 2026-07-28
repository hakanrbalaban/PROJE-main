import { useEffect, useState } from 'react'
import { unsplashUrl } from '../lib/unsplash'

interface Props {
  src: string
  alt?: string
  className?: string
  seed?: string | number
  loading?: 'lazy' | 'eager'
}

function placeholderDataUri(seed: string | number) {
  const h = [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0)
  const c1 = `hsl(${(h * 37) % 360} 70% 42%)`
  const c2 = `hsl(${(h * 73 + 80) % 360} 65% 28%)`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="48" font-family="system-ui">AİORA</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Cover: kaynak → Unsplash → gradient SVG */
export function CoverImage({ src, alt = '', className, seed = 'aiora', loading = 'lazy' }: Props) {
  const [stage, setStage] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    setStage(0)
  }, [src, seed])

  const current =
    stage === 0 ? src || unsplashUrl(seed) : stage === 1 ? unsplashUrl(seed) : placeholderDataUri(seed)

  return (
    <img
      key={`${src}-${stage}`}
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setStage((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : s))}
    />
  )
}
