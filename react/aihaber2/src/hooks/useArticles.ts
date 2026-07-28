import { useEffect, useState } from 'react'
import type { Article, CategoryId } from '../types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: Article[]; updatedAt: string }

export function useArticles(category: CategoryId, query: string) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    const params = new URLSearchParams({ category, q: query })
    fetch(`/api/articles?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setState({ status: 'ready', items: data.items, updatedAt: data.updatedAt })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ status: 'error', message: err.message || 'Yüklenemedi' })
      })
    return () => controller.abort()
  }, [category, query, tick])

  return {
    state,
    refresh: () => setTick((t) => t + 1),
  }
}

export function useArticle(id: string | null) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setArticle(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetch(`/api/articles/${id}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Makale bulunamadı')
        return res.json()
      })
      .then((data) => setArticle(data.item))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setArticle(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [id])

  return { article, loading, error }
}
