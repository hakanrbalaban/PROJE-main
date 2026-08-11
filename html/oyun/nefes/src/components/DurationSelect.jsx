import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { DURATION_OPTIONS, getTotalRounds } from '../data/techniques'

export default function DurationSelect({ technique, onBack, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex w-full max-w-md flex-col px-5 pb-10 pt-6"
    >
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-violet-100 transition hover:bg-white/15"
          aria-label="Geri"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs text-violet-300/70">{technique.name}</p>
          <h2 className="text-xl font-semibold text-white">Süre seç</h2>
        </div>
      </div>

      <p className="mb-6 text-sm text-violet-200/70">
        Egzersize başlamadan önce ne kadar meditasyon yapmak istediğini seç.
      </p>

      <div className="flex flex-col gap-3">
        {DURATION_OPTIONS.map((minutes, index) => {
          const rounds = getTotalRounds(technique, minutes)
          return (
            <motion.button
              key={minutes}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart(minutes)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-sm transition hover:border-violet-300/30 hover:bg-white/10"
            >
              <div>
                <p className="text-lg font-semibold text-white">{minutes} dakika</p>
                <p className="mt-0.5 text-sm text-violet-300/70">{rounds} tur</p>
              </div>
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-200">
                Başla
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
