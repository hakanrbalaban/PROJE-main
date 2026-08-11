import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function CompletionScreen({ minutes, onHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-5 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 14 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/40 to-indigo-600/40 text-violet-100"
      >
        <Sparkles size={32} />
      </motion.div>

      <h2 className="text-2xl font-semibold text-white sm:text-3xl">Harika iş çıkardın!</h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-violet-200/75">
        Bu seans {minutes < 1 ? 'bir dakikadan az' : `${minutes} dakika`} meditasyon yaptın.
        Zihnini dinlendirmek için her zaman buradasın.
      </p>

      <button
        type="button"
        onClick={onHome}
        className="mt-10 w-full max-w-xs rounded-2xl bg-violet-500/90 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.35)] transition hover:bg-violet-400"
      >
        Ana sayfaya dön
      </button>
    </motion.div>
  )
}
