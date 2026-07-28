import { useEffect, useState, type ReactNode } from 'react'
import { CATEGORY_META, type Article, type CategoryId } from '../types'

const KEY_STORAGE = 'aiora_editor_key'

const emptyForm = {
  id: '',
  title: '',
  excerpt: '',
  metaDescription: '',
  body: '',
  category: 'psikoloji' as CategoryId | string,
  tags: '',
  author: 'Hakan Rüştü Balaban',
  authorNote: '',
  coverUrl: '',
  slug: '',
  status: 'published' as 'published' | 'draft',
  aiGenerated: false,
  sourceNote: 'Editöryel özgün içerik — haber ajansı metni içermez.',
}

interface Props {
  onBack: () => void
  onSaved: (article: Article) => void
}

export function EditorPanel({ onBack, onSaved }: Props) {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '')
  const [authed, setAuthed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Article[]>([])
  const [form, setForm] = useState(emptyForm)
  const [mode, setMode] = useState<'list' | 'edit'>('list')

  async function editorFetch(url: string, editorKey: string, init?: RequestInit) {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Editor-Key': editorKey,
        ...(init?.headers || {}),
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  }

  async function loadList(editorKey: string) {
    const data = await editorFetch('/api/editor/articles', editorKey)
    setItems(data.items || [])
  }

  async function login(rawKey?: string) {
    const editorKey = String(rawKey ?? key).trim()
    if (!editorKey) {
      setError('Şifre girin')
      return
    }
    setKey(editorKey)
    setBusy(true)
    setError(null)
    try {
      await editorFetch('/api/editor/auth', editorKey, {
        method: 'POST',
        body: JSON.stringify({ editorKey }),
      })
      localStorage.setItem(KEY_STORAGE, editorKey)
      setAuthed(true)
      try {
        await loadList(editorKey)
      } catch {
        setError('Giriş oldu ama yazı listesi yüklenemedi. API çalışıyor mu?')
      }
    } catch (err) {
      localStorage.removeItem(KEY_STORAGE)
      setAuthed(false)
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'unauthorized' || msg.includes('401')) {
        setError('Şifre hatalı')
      } else {
        setError(`Giriş başarısız (${msg || 'ağ hatası'})`)
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const saved = String(localStorage.getItem(KEY_STORAGE) || '').trim()
    if (saved) login(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startNew() {
    setForm(emptyForm)
    setMode('edit')
  }

  async function generateAiDraft() {
    const editorKey = key.trim()
    if (!editorKey) return
    setBusy(true)
    setError(null)
    try {
      const cat = mode === 'edit' && form.category !== 'tumu' ? form.category : undefined
      const data = await editorFetch('/api/editor/ai-draft', editorKey, {
        method: 'POST',
        body: JSON.stringify({ category: cat }),
      })
      const d = data.draft
      if (!d) throw new Error('empty_draft')
      setForm({
        id: '',
        title: d.title || '',
        excerpt: d.excerpt || '',
        metaDescription: String(d.excerpt || '').slice(0, 160),
        body: d.body || '',
        category: d.category || 'yasam',
        tags: Array.isArray(d.tags) ? d.tags.join(', ') : '',
        author: d.author || 'AİORA Yazım AI',
        authorNote: '',
        coverUrl: d.coverUrl || '',
        slug: '',
        status: 'draft',
        aiGenerated: true,
        sourceNote: d.sourceNote || 'AI taslak — yayın öncesi kontrol edin.',
      })
      setMode('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI taslak üretilemedi')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(a: Article) {
    setForm({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt || '',
      metaDescription: a.metaDescription || a.excerpt || '',
      body: a.body || '',
      category: a.category,
      tags: (a.tags || []).join(', '),
      author: a.author || '',
      authorNote: a.authorNote || '',
      coverUrl: a.coverUrl || '',
      slug: a.slug || '',
      status: a.status === 'draft' ? 'draft' : 'published',
      aiGenerated: Boolean(a.aiGenerated),
      sourceNote: a.sourceNote || '',
    })
    setMode('edit')
  }

  async function save() {
    const editorKey = key.trim()
    setBusy(true)
    setError(null)
    try {
      const data = await editorFetch('/api/editor/articles', editorKey, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          id: form.id || undefined,
          tags: form.tags,
        }),
      })
      await loadList(editorKey)
      setMode('list')
      if (data.item?.status === 'published') onSaved(data.item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu yazı silinsin mi?')) return
    const editorKey = key.trim()
    setBusy(true)
    try {
      await editorFetch(`/api/editor/articles/${id}`, editorKey, { method: 'DELETE' })
      await loadList(editorKey)
      if (form.id === id) {
        setForm(emptyForm)
        setMode('list')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi')
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    localStorage.removeItem(KEY_STORAGE)
    setKey('')
    setAuthed(false)
    setItems([])
    setForm(emptyForm)
    setMode('list')
    setError(null)
  }

  const cats = CATEGORY_META.filter((c) => c.id !== 'tumu')

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <button type="button" onClick={onBack} className="mb-6 text-sm text-[var(--muted)] hover:text-[var(--hot)]">
          ← Ana sayfa
        </button>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white">
          Editör girişi
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Yazı eklemek ve düzenlemek için giriş yapın.</p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            login(key)
          }}
        >
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Şifre"
            autoComplete="current-password"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-white outline-none focus:border-[var(--hot)]"
          />
          {error && <p className="mt-2 text-sm text-[var(--hot)]">{error}</p>}
          <button
            type="submit"
            disabled={busy || !key.trim()}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? 'Giriş…' : 'Giriş'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="mb-2 text-sm text-[var(--muted)] hover:text-[var(--hot)]">
            ← Ana sayfa
          </button>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white">
            Yazı editörü
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Elle yaz veya AI taslak al → düzenle → yayınla
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generateAiDraft}
            disabled={busy}
            className="rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--lime)] px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60"
          >
            {busy ? '✨ Taslak üretiliyor…' : '✨ AI Taslak'}
          </button>
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={() => setMode('list')}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--mist)]"
            >
              Listeye dön
            </button>
          ) : (
            <button
              type="button"
              onClick={startNew}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--mist)]"
            >
              + Boş yazı
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-[var(--hot)]/50 px-4 py-2 text-sm font-semibold text-[var(--hot)] hover:bg-[rgba(255,45,106,0.12)]"
          >
            Çıkış
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-[var(--hot)]">{error}</p>}

      {mode === 'list' && (
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.7)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{a.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {a.status === 'draft' ? 'Taslak' : 'Yayında'} · {a.author} · {a.categoryLabel} ·{' '}
                  {a.readMinutes} dk
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="rounded-full border border-[var(--cyan)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--cyan)]"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="rounded-full border border-[var(--hot)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--hot)]"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-[var(--muted)]">Henüz yazı yok.</p>}
        </div>
      )}

      {mode === 'edit' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <Field label="Başlık">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="field"
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Durum">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'published' | 'draft' })
                }
                className="field"
              >
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
              </select>
            </Field>
          </div>
          <Field label="Özet">
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="SEO açıklama (meta, max 160)">
            <input
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="field"
              maxLength={160}
            />
          </Field>
          <Field label="Yazı gövdesi (## başlık, - liste)">
            <textarea
              required
              rows={18}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="field font-mono text-sm"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yazar">
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="field"
              />
            </Field>
            <Field label="Etiketler (virgülle)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="field"
              />
            </Field>
          </div>
          <Field label="Yazar yorumu / kutu">
            <textarea
              rows={3}
              value={form.authorNote}
              onChange={(e) => setForm({ ...form, authorNote: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="Kapak görsel URL (opsiyonel)">
            <input
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              className="field"
              placeholder="https://..."
            />
          </Field>
          <Field label="Slug (URL, boş bırakılabilir)">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="field"
              placeholder="guzel-gunlere-yolculuk"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-[var(--mist)]">
            <input
              type="checkbox"
              checked={form.aiGenerated}
              onChange={(e) => setForm({ ...form, aiGenerated: e.target.checked })}
            />
            AI destekli / AI üretimi
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-gradient-to-r from-[var(--hot)] to-[var(--orange)] px-6 py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? 'Kaydediliyor…' : form.id ? 'Güncelle' : 'Yayınla / Kaydet'}
          </button>
        </form>
      )}

      <style>{`
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--line);
          background: var(--panel);
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
        }
        .field:focus { border-color: color-mix(in oklab, var(--hot) 60%, transparent); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  )
}
