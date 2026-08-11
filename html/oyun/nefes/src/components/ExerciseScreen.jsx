import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play, X } from 'lucide-react'
import BreathingCircle from './BreathingCircle'
import { getTotalRounds } from '../data/techniques'
import { playDing, resumeAudio } from '../utils/audio'

export default function ExerciseScreen({
  technique,
  durationMinutes,
  soundOn,
  onFinish,
  onAbort,
}) {
  const totalRounds = getTotalRounds(technique, durationMinutes)
  const [round, setRound] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(technique.phases[0].duration)
  const [isPaused, setIsPaused] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const dingPlayed = useRef(false)
  const finished = useRef(false)

  const phase = technique.phases[phaseIndex]

  useEffect(() => {
    if (soundOn) resumeAudio()
  }, [soundOn])

  useEffect(() => {
    if (isPaused || finished.current) return undefined

    if (countdown === phase.duration && !dingPlayed.current) {
      dingPlayed.current = true
      if (soundOn) playDing()
    }

    if (countdown <= 0) {
      dingPlayed.current = false
      const nextPhase = phaseIndex + 1

      if (nextPhase < technique.phases.length) {
        setPhaseIndex(nextPhase)
        setCountdown(technique.phases[nextPhase].duration)
      } else if (round < totalRounds) {
        setRound((r) => r + 1)
        setPhaseIndex(0)
        setCountdown(technique.phases[0].duration)
      } else {
        finished.current = true
        const elapsed = (Date.now() - startedAt) / 60000
        onFinish(Math.max(0.1, Math.round(elapsed * 10) / 10))
      }
      return undefined
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [
    countdown,
    isPaused,
    phase,
    phaseIndex,
    round,
    totalRounds,
    technique.phases,
    soundOn,
    startedAt,
    onFinish,
  ])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex min-h-full w-full max-w-md flex-col items-center px-5 pb-10 pt-6"
    >
      <div className="mb-4 flex w-full items-center justify-between">
        <p className="text-sm text-violet-300/80">{technique.name}</p>
        <button
          type="button"
          onClick={onAbort}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-violet-100 transition hover:bg-white/15"
          aria-label="Bitir"
        >
          <X size={18} />
        </button>
      </div>

      <motion.p
        key={phase.label + phaseIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-lg font-medium tracking-wide text-violet-100"
      >
        {phase.label}
      </motion.p>

      <BreathingCircle phase={phase} countdown={Math.max(1, countdown)} isPaused={isPaused} />

      <p className="mt-8 text-sm tabular-nums text-violet-300/80">
        {round} / {totalRounds} tur
      </p>

      <div className="mt-auto flex w-full gap-3 pt-10">
        <button
          type="button"
          onClick={() => {
            setIsPaused((p) => !p)
            if (soundOn) resumeAudio()
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-sm font-medium text-white transition hover:bg-white/15"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Devam Et' : 'Duraklat'}
        </button>
        <button
          type="button"
          onClick={onAbort}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 py-3.5 text-sm font-medium text-violet-200 transition hover:bg-white/5"
        >
          Bitir
        </button>
      </div>
    </motion.div>
  )
}
