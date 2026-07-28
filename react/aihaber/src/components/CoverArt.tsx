import { TONE } from '../types'

type Props = {
  category: string
  seed: string
  title: string
}

/** Deterministic original cover art — never uses publisher photos. */
export function CoverArt({ category, seed, title }: Props) {
  const tone = TONE[category] || TONE.dunya
  const n = hash(seed)
  const rot = (n % 48) - 24
  const x = 20 + (n % 55)
  const y = 25 + ((n >> 3) % 45)
  const r1 = 40 + (n % 50)
  const r2 = 70 + ((n >> 5) % 80)
  const letters = title
    .replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/g, '')
    .slice(0, 2)
    .toUpperCase() || 'NB'

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden
      style={{
        background: `linear-gradient(145deg, ${tone.from}, ${tone.to})`,
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`g-${seed}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor={tone.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={tone.from} stopOpacity="0" />
          </radialGradient>
          <pattern id={`p-${seed}`} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
            <circle cx="2" cy="2" r="1.4" fill={tone.accent} opacity="0.22" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#p-${seed})`} />
        <circle cx={x * 2} cy={y * 2} r={r1} fill={`url(#g-${seed})`} />
        <circle cx={400 - x * 1.5} cy={300 - y} r={r2} fill={tone.accent} opacity="0.12" />
        <path
          d={`M0 ${180 + (n % 40)} Q 120 ${90 + (n % 60)} 220 ${150 + (n % 30)} T 400 ${110 + (n % 50)}`}
          fill="none"
          stroke={tone.accent}
          strokeWidth="3"
          opacity="0.45"
        />
        <path
          d={`M0 ${210 + (n % 20)} Q 140 ${140 + (n % 40)} 260 ${190} T 400 ${160}`}
          fill="none"
          stroke="#d8efe8"
          strokeWidth="1.5"
          opacity="0.2"
        />
      </svg>
      <div
        className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold tracking-tight"
        style={{
          background: 'rgba(4, 24, 20, 0.45)',
          color: tone.accent,
          fontFamily: 'var(--font-display)',
          backdropFilter: 'blur(6px)',
          border: `1px solid ${tone.accent}33`,
        }}
      >
        {letters}
      </div>
    </div>
  )
}

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}
