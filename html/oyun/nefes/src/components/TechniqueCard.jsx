import { Moon, Square, Wind } from 'lucide-react'
import { motion } from 'framer-motion'

const ICONS = {
  moon: Moon,
  box: Square,
  wind: Wind,
}

export default function TechniqueCard({ technique, onSelect, index }) {
  const Icon = ICONS[technique.icon] || Wind

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + index * 0.08, duration: 0.4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(technique)}
      className={`w-full text-left rounded-2xl border border-white/10 bg-gradient-to-br ${technique.accent} backdrop-blur-sm p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-white/20 hover:bg-white/5 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-200">
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-white">{technique.name}</h3>
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-violet-200">
              ~{technique.estimatedMinutes} dk
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-violet-200/75">{technique.description}</p>
          <p className="mt-2 text-xs font-medium tracking-wide text-violet-300/80 uppercase">
            {technique.benefit}
          </p>
        </div>
      </div>
    </motion.button>
  )
}
