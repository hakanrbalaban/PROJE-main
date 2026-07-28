type Props = {
  headlines: string[]
}

export function Ticker({ headlines }: Props) {
  if (!headlines.length) return null
  const loop = [...headlines, ...headlines]

  return (
    <div className="relative overflow-hidden border-y border-[var(--line)] bg-[rgba(6,42,38,0.75)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#041814] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#041814] to-transparent" />
      <div className="ticker-track flex w-max gap-10 whitespace-nowrap py-3 text-[0.82rem] tracking-wide text-[rgba(216,239,232,0.75)]">
        {loop.map((h, i) => (
          <span key={`${i}-${h.slice(0, 24)}`} className="inline-flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--volt)]" />
            {h}
          </span>
        ))}
      </div>
    </div>
  )
}
