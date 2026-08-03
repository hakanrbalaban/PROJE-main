"use client";

import { IconClose, IconSearch, IconTemplate } from "@/components/Icons";
import type { TemplateMeta } from "@/lib/templates/types";
import { useCallback, useEffect, useState } from "react";

type TemplateGalleryProps = {
  open: boolean;
  onClose: () => void;
  onUse: (templateId: string) => Promise<void> | void;
};

type ListPayload = {
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  items: TemplateMeta[];
  ready: boolean;
  root?: string;
};

export function TemplateGallery({ open, onClose, onUse }: TemplateGalleryProps) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [kind, setKind] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingId, setUsingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "24",
        category,
        kind,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/templates?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Şablon listesi alınamadı");
      const json = (await res.json()) as ListPayload;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, [page, category, kind, q]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/templates/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1000 }),
      });
      const json = (await res.json()) as { error?: string; count?: number; root?: string };
      if (!res.ok) throw new Error(json.error ?? "Üretim başarısız");
      setPage(1);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Üretim hatası");
    } finally {
      setGenerating(false);
    }
  };

  const useTemplate = async (id: string) => {
    setUsingId(id);
    setError(null);
    try {
      await onUse(id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şablon uygulanamadı");
    } finally {
      setUsingId(null);
    }
  };

  return (
    <div className="tpl-overlay" role="dialog" aria-modal="true" aria-label="Şablon galerisi">
      <div className="tpl-sheet">
        <header className="tpl-head">
          <div className="tpl-head-left">
            <IconTemplate size={22} />
            <div>
              <h2>Şablon galerisi</h2>
              <p>
                {data?.ready
                  ? `${data.total} şablon · D: disk API`
                  : "Henüz üretilmedi — D:\\BalabanNote\\templates"}
              </p>
            </div>
          </div>
          <button type="button" className="formula-close" onClick={onClose} aria-label="Kapat">
            <IconClose size={18} />
          </button>
        </header>

        <div className="tpl-toolbar">
          <div className="tpl-search-wrap">
            <IconSearch size={15} />
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Ara: toplantı, swot, kanban…"
              aria-label="Şablon ara"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            aria-label="Kategori"
          >
            <option value="all">Tüm kategoriler</option>
            {(data?.categories ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={kind}
            onChange={(e) => {
              setPage(1);
              setKind(e.target.value);
            }}
            aria-label="Tür"
          >
            <option value="all">Tüm türler</option>
            <option value="note">Not</option>
            <option value="board">Board</option>
            <option value="todo">Todo</option>
          </select>
          <button
            type="button"
            className="tpl-gen-btn"
            disabled={generating}
            onClick={() => void generate()}
          >
            {generating ? "Üretiliyor…" : data?.ready ? "Yeniden üret (1000)" : "1000 şablon üret"}
          </button>
        </div>

        {error && <p className="tpl-error">{error}</p>}

        <div className="tpl-grid-wrap">
          {loading && !data && <p className="tpl-muted">Yükleniyor…</p>}
          {!loading && data && !data.ready && (
            <div className="tpl-empty">
              <p>Kütüphane boş. D: diske 1000 renkli / diyagramlı şablon üret.</p>
              <button type="button" className="tpl-gen-btn" onClick={() => void generate()}>
                Şimdi üret
              </button>
            </div>
          )}
          <div className="tpl-grid">
            {(data?.items ?? []).map((t) => (
              <article
                key={t.id}
                className="tpl-card"
                style={{
                  ["--tpl-a" as string]: t.accent,
                  ["--tpl-b" as string]: t.accent2,
                }}
              >
                <div className="tpl-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/templates/${t.id}/thumb`}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="tpl-card-body">
                  <span className={`tpl-kind kind-${t.kind}`}>{t.kind}</span>
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>
                  <div className="tpl-tags">
                    <span>{t.category}</span>
                    {t.tags.slice(0, 2).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="tpl-use"
                    disabled={usingId === t.id}
                    onClick={() => void useTemplate(t.id)}
                  >
                    {usingId === t.id ? "Ekleniyor…" : "Kullan"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {data && data.ready && data.total > 0 && (
          <footer className="tpl-pager">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
