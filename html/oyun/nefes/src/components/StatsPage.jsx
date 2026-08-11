import { motion } from 'framer-motion'
import { Flame, Clock, CheckCircle2, ArrowLeft } from 'lucide-react'
import { getLast7Days } from '../utils/storage'

export default function StatsPage({ stats, onBack }) {
  const days = getLast7Days(stats)
  const maxMinutes = Math.max(1, ...days.map((d) => d.minutes))

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
        <h2 className="text-xl font-semibold text-white">İstatistikler</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Egzersiz"
          value={stats.totalSessions}
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Seri"
          value={`${stats.streak}g`}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Toplam"
          value={`${Math.round(stats.totalMinutes)}dk`}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <h3 className="mb-5 text-sm font-medium text-violet-200">Son 7 gün</h3>
        <div className="flex h-40 items-end justify-between gap-2">
          {days.map((day) => {
            const barPx = day.minutes === 0 ? 4 : Math.max(10, Math.round((day.minutes / maxMinutes) * 112))
            return (
              <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] tabular-nums text-violet-300/70">
                  {day.minutes > 0 ? Math.round(day.minutes) : ''}
                </span>
                <motion.div
                  initial={{ height: 4 }}
                  animate={{ height: barPx }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-violet-600/80 to-violet-300/90"
                />
                <span className="text-[11px] capitalize text-violet-300/80">{day.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-violet-300/60">
        Verilerin yalnızca bu cihazda saklanır.
      </p>
    </motion.div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
      <div className="mb-2 flex justify-center text-violet-300">{icon}</div>
      <p className="text-lg font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-violet-300/70">{label}</p>
    </div>
  )
}
