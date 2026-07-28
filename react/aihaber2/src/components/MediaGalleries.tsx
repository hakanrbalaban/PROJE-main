import { useState } from 'react'
import { unsplashGallery } from '../lib/unsplash'
import { HorizontalScroller } from './HorizontalScroller'
import { CoverImage } from './CoverImage'

const VIDEOS = [
  { id: 'v1', title: 'Şehirde sabah yürüyüşü', embed: 'https://www.youtube.com/embed/aqz-KE-bpKQ', poster: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg' },
  { id: 'v2', title: 'Doğa ve sessizlik', embed: 'https://www.youtube.com/embed/5qap5aO4i9A', poster: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg' },
  { id: 'v3', title: 'Mutfak ritüeli', embed: 'https://www.youtube.com/embed/jfKfPfyJRdk', poster: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
  { id: 'v4', title: 'Odak müziği', embed: 'https://www.youtube.com/embed/DWcJFNfaw9c', poster: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg' },
]

type Lightbox =
  | { kind: 'photo'; src: string; title: string }
  | { kind: 'video'; embed: string; title: string }
  | null

function MediaLightbox({
  data,
  onClose,
}: {
  data: Exclude<Lightbox, null>
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,2,10,0.88)] p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[#12081c] shadow-[0_24px_80px_rgba(255,45,106,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-[16/10] bg-black">
          {data.kind === 'photo' ? (
            <img src={data.src} alt={data.title} className="h-full w-full object-contain" />
          ) : (
            <iframe
              title={data.title}
              src={data.embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-white">{data.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--mist)]"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

export function PhotoGallery() {
  const items = unsplashGallery(10, 'foto')
  const [lightbox, setLightbox] = useState<Lightbox>(null)

  return (
    <div id="foto-galeri" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
      <HorizontalScroller
        title="Foto galeri"
        emoji="📷"
        subtitle="Kaydır · tıkla · büyük gör"
        viewAllLabel="Tüm fotoğraflar"
        onViewAll={() => document.getElementById('foto-galeri')?.scrollIntoView({ behavior: 'smooth' })}
      >
        {items.map((item) => (
          <figure
            key={item.id}
            className="min-w-[220px] max-w-[240px] snap-start overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.75)]"
          >
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => setLightbox({ kind: 'photo', src: item.src, title: item.title })}
            >
              <CoverImage
                src={item.src}
                seed={item.id}
                alt={item.title}
                className="aspect-[4/3] w-full object-cover transition hover:scale-[1.04]"
              />
            </button>
            <figcaption className="px-3 py-2 text-xs font-semibold text-[var(--mist)]">{item.title}</figcaption>
          </figure>
        ))}
      </HorizontalScroller>
      {lightbox && <MediaLightbox data={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}

export function VideoGallery() {
  const [lightbox, setLightbox] = useState<Lightbox>(null)

  return (
    <div id="video-galeri" className="mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-8 md:px-6">
      <HorizontalScroller
        title="Video galeri"
        emoji="▶️"
        subtitle="Popup veya kapaktan izle"
        viewAllLabel="Tüm videolar"
        onViewAll={() => document.getElementById('video-galeri')?.scrollIntoView({ behavior: 'smooth' })}
      >
        {VIDEOS.map((v) => (
          <div
            key={v.id}
            className="min-w-[280px] max-w-[300px] snap-start overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.85)] shadow-[0_12px_40px_rgba(255,45,106,0.12)]"
          >
            <button
              type="button"
              className="relative block aspect-video w-full bg-black text-left"
              onClick={() => setLightbox({ kind: 'video', embed: v.embed, title: v.title })}
            >
              <img src={v.poster} alt="" className="h-full w-full object-cover opacity-90" />
              <span className="absolute inset-0 grid place-items-center bg-black/35">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--hot)] text-2xl text-white shadow-lg">
                  ▶
                </span>
              </span>
            </button>
            <p className="px-3 py-2.5 text-sm font-semibold text-white">{v.title}</p>
          </div>
        ))}
      </HorizontalScroller>
      {lightbox && <MediaLightbox data={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
