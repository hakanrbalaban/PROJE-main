import { useEffect, useState } from 'react'

const KEY = 'aiora_cookie_ok'

interface Props {
  onOpenPrivacy: () => void
}

export function CookieBanner({ onOpenPrivacy }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgba(10,6,18,0.96)] p-4 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--mist)]">
          Deneyimi iyileştirmek için çerez ve benzeri teknolojiler kullanabiliriz. Detay:{' '}
          <button type="button" className="text-[var(--cyan)] underline" onClick={onOpenPrivacy}>
            Çerez politikası
          </button>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(KEY, '1')
              setShow(false)
            }}
            className="rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] px-4 py-2 text-sm font-bold text-white"
          >
            Kabul et
          </button>
        </div>
      </div>
    </div>
  )
}
