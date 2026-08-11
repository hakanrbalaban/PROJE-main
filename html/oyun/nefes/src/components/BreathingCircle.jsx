import { motion } from 'framer-motion'

export default function BreathingCircle({ phase, countdown, isPaused }) {
  const scale = phase?.scale ?? 1
  const duration = phase?.duration ?? 4

  return (
    <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
      <motion.div
        className="absolute inset-0 rounded-full bg-violet-500/10 blur-2xl"
        animate={{
          scale: isPaused ? 1 : [0.9, 1.15, 0.9],
          opacity: isPaused ? 0.35 : [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute h-[85%] w-[85%] rounded-full border border-violet-300/20"
        animate={{ scale: isPaused ? 1 : scale * 0.92 }}
        transition={{ duration, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative flex h-[70%] w-[70%] items-center justify-center rounded-full bg-gradient-to-br from-violet-400/40 via-indigo-500/35 to-purple-700/40 shadow-[0_0_60px_rgba(139,92,246,0.35)]"
        animate={{ scale: isPaused ? 1 : scale }}
        transition={{ duration, ease: 'easeInOut' }}
      >
        <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-white/15 to-transparent" />
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-5xl font-semibold tabular-nums text-white drop-shadow-lg sm:text-6xl">
            {countdown}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
