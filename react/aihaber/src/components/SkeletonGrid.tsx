export function SkeletonGrid() {
  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 md:grid-cols-3 md:gap-5 md:px-8 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`skeleton min-h-[240px] rounded-[1.35rem] ${
            i === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-[420px]' : i === 3 ? 'md:col-span-2' : ''
          }`}
        />
      ))}
    </div>
  )
}
