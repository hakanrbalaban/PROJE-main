"use client";

import { IconClose, IconSearch } from "@/components/Icons";
import { useEffect, useState } from "react";

type StockSource = "all" | "pexels" | "pixabay" | "unsplash";

type StockHit = {
  id: string;
  source: "pexels" | "pixabay" | "unsplash";
  thumb: string;
  full: string;
  alt: string;
  photographer: string;
  pageUrl: string;
  license: string;
};

type StockImageDialogProps = {
  open: boolean;
  onClose: () => void;
  onPick: (payload: {
    url: string;
    name: string;
    attribution: string;
    alt: string;
  }) => Promise<void>;
};

const SOURCE_LABEL: Record<StockSource, string> = {
  all: "Tümü",
  pexels: "Pexels",
  pixabay: "Pixabay",
  unsplash: "Unsplash",
};

export function StockImageDialog({ open, onClose, onPick }: StockImageDialogProps) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<StockSource>("all");
  const [licensedOnly, setLicensedOnly] = useState(true);
  const [hits, setHits] = useState<StockHit[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [configured, setConfigured] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  if (!open) return null;

  const search = async () => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const params = new URLSearchParams({
        q: query,
        source,
        licensed: licensedOnly ? "1" : "0",
      });
      const res = await fetch(`/api/stock/search?${params}`);
      const data = (await res.json()) as {
        hits?: StockHit[];
        hint?: string | null;
        configured?: Record<string, boolean>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Arama hatası");
      setHits(data.hits || []);
      setHint(data.hint || null);
      setConfigured(data.configured || {});
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Arama başarısız");
      setHits([]);
    } finally {
      setLoading(false);
    }
  };

  const choose = async (hit: StockHit) => {
    setImporting(hit.id);
    setError(null);
    try {
      const attribution = `${hit.photographer} · ${SOURCE_LABEL[hit.source]} · ${hit.license}`;
      await onPick({
        url: hit.full,
        name: `${hit.source}-${hit.id}.jpg`,
        attribution,
        alt: hit.alt,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eklenemedi");
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="stock-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="stock-dialog"
        role="dialog"
        aria-label="Stok görsel ara"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stock-dialog-head">
          <div>
            <h2>İnternetten görsel</h2>
            <p>Telif filtreli stok: Pexels · Pixabay · Unsplash</p>
          </div>
          <button type="button" className="icon-tool" onClick={onClose} aria-label="Kapat">
            <IconClose size={16} />
          </button>
        </div>

        <div className="stock-dialog-tools">
          <div className="stock-search-row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void search();
              }}
              placeholder="örn. ofis, doğa, kahve…"
              autoFocus
              aria-label="Görsel ara"
            />
            <button type="button" className="insert-primary stock-search-btn" onClick={() => void search()} disabled={loading}>
              <IconSearch size={16} />
              {loading ? "…" : "Ara"}
            </button>
          </div>

          <div className="stock-source-row" role="tablist" aria-label="Kaynak">
            {(Object.keys(SOURCE_LABEL) as StockSource[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={source === s}
                className={`stock-source-chip ${source === s ? "active" : ""}`}
                onClick={() => setSource(s)}
              >
                {SOURCE_LABEL[s]}
                {s !== "all" && configured[s] === false ? " ·" : ""}
              </button>
            ))}
          </div>

          <label className="stock-license">
            <input
              type="checkbox"
              checked={licensedOnly}
              onChange={(e) => setLicensedOnly(e.target.checked)}
            />
            Telif filtreli (yalnızca ücretsiz stok lisansları)
          </label>
        </div>

        {error && <p className="stock-msg error">{error}</p>}
        {hint && !error && <p className="stock-msg">{hint}</p>}

        <div className="stock-grid">
          {hits.map((hit) => (
            <button
              key={hit.id}
              type="button"
              className="stock-card"
              disabled={Boolean(importing)}
              onClick={() => void choose(hit)}
              title={`${hit.photographer} · ${hit.license}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hit.thumb} alt={hit.alt} loading="lazy" />
              <span className="stock-card-meta">
                <strong>{SOURCE_LABEL[hit.source]}</strong>
                <em>{hit.photographer}</em>
                {importing === hit.id ? " · ekleniyor…" : ""}
              </span>
            </button>
          ))}
        </div>

        <p className="stock-foot">
          API anahtarları: <code>PEXELS_API_KEY</code>, <code>PIXABAY_API_KEY</code>,{" "}
          <code>UNSPLASH_ACCESS_KEY</code> → <code>.env.local</code>
        </p>
      </div>
    </div>
  );
}
