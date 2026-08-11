import { motion } from 'framer-motion'
import { BarChart3, Volume2, VolumeX } from 'lucide-react'
import TechniqueCard from './TechniqueCard'
import { TECHNIQUES } from '../data/techniques'

export default function HomePage({ onSelectTechnique, onOpenStats, soundOn, onToggleSound }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex w-full max-w-md flex-col px-5 pb-10 pt-6"
    >
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-violet-300/70 uppercase">Nefes</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Bugün nasıl hissediyorsun?
          </h1>
          <p className="mt-2 text-sm text-violet-200/70">
            Bir teknik seç ve birkaç dakika nefesine odaklan.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-violet-100 transition hover:bg-white/15"
            aria-label={soundOn ? 'Sesi kapat' : 'Sesi aç'}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            onClick={onOpenStats}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-violet-100 transition hover:bg-white/15"
            aria-label="İstatistikler"
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {TECHNIQUES.map((technique, index) => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            index={index}
            onSelect={onSelectTechnique}
          />
        ))}
      </div>
    </motion.div>
  )
}
