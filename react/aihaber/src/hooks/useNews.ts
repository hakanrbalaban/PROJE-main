import { useEffect, useState } from 'react'
import type { CategoryId, NewsResponse } from '../types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: NewsResponse }

export function useNews(category: CategoryId, query: string) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    const params = new URLSearchParams({ limit: '72' })
    if (category !== 'tumu') params.set('category', category)
    if (query.trim()) params.set('q', query.trim())

    fetch(`/api/news?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API ${res.status}`)
        return res.json() as Promise<NewsResponse>
      })
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setState({ status: 'error', message: err.message || 'Yüklenemedi' })
      })

    return () => controller.abort()
  }, [category, query, tick])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  return {
    state,
    refresh: () => setTick((t) => t + 1),
  }
}
