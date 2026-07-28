import { useEffect, useState } from 'react'
import type { WidgetsData } from '../types'

export function useWidgets() {
  const [data, setData] = useState<WidgetsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/widgets', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return { data, loading }
}
