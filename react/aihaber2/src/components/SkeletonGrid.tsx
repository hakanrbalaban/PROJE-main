export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgba(18,26,43,0.5)]"
        >
          <div
            className="aspect-[16/10]"
            style={{
              background: 'linear-gradient(90deg,#121a2b 25%,#1a2438 50%,#121a2b 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s linear infinite',
            }}
          />
          <div className="space-y-2 p-4">
            <div className="h-4 w-4/5 rounded bg-[var(--panel-2)]" />
            <div className="h-3 w-full rounded bg-[var(--panel-2)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--panel-2)]" />
          </div>
        </div>
      ))}
    </div>
  )
}
