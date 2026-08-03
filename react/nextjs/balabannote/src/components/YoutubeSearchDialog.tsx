"use client";

import { IconClose, IconSearch, IconYoutube } from "@/components/Icons";
import { parseYouTubeId } from "@/lib/youtube";
import { useEffect, useState } from "react";

type YoutubeHit = {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  publishedAt: string;
};

type YoutubeSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onPickId: (videoId: string) => void;
};

export function YoutubeSearchDialog({
  open,
  onClose,
  onPickId,
}: YoutubeSearchDialogProps) {
  const [tab, setTab] = useState<"search" | "url">("search");
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const [hits, setHits] = useState<YoutubeHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setHint(null);
  }, [open]);

  if (!open) return null;

  const search = async () => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    setHint(null);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`,
      );
      const data = (await res.json()) as {
        hits?: YoutubeHit[];
        hint?: string | null;
        configured?: boolean;
        error?: string;
      };
      if (!res.ok && data.error) throw new Error(data.error);
      setHits(data.hits || []);
      setHint(data.hint || null);
      setConfigured(data.configured ?? null);
      if (data.error) setError(data.error);
    } catch (err) {
      setHits([]);
      setError(err instanceof Error ? err.message : "Arama başarısız");
    } finally {
      setLoading(false);
    }
  };

  const insertFromUrl = () => {
    const id = parseYouTubeId(url);
    if (!id) {
      setError("Geçerli bir YouTube bağlantısı girin");
      return;
    }
    onPickId(id);
    onClose();
    setUrl("");
  };

  return (
    <div
      className="stock-dialog-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="stock-dialog yt-search-dialog"
        role="dialog"
        aria-label="YouTube ara"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stock-dialog-head">
          <div>
            <h2>
              <IconYoutube size={20} /> YouTube
            </h2>
            <p>Video ara veya bağlantı yapıştır</p>
          </div>
          <button
            type="button"
            className="icon-tool"
            onClick={onClose}
            aria-label="Kapat"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="stock-source-row yt-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "search"}
            className={`stock-source-chip ${tab === "search" ? "active" : ""}`}
            onClick={() => setTab("search")}
          >
            Ara
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "url"}
            className={`stock-source-chip ${tab === "url" ? "active" : ""}`}
            onClick={() => setTab("url")}
          >
            Bağlantı
          </button>
        </div>

        {tab === "search" ? (
          <>
            <div className="stock-search-row">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void search();
                }}
                placeholder="örn. ders, müzik, tanıtım…"
                autoFocus
                aria-label="YouTube ara"
              />
              <button
                type="button"
                className="insert-primary stock-search-btn"
                onClick={() => void search()}
                disabled={loading}
              >
                <IconSearch size={16} />
                {loading ? "…" : "Ara"}
              </button>
            </div>

            {configured === false && (
              <p className="stock-msg">
                API anahtarı yok. <code>YOUTUBE_API_KEY</code> →{" "}
                <code>.env.local</code> (Google Cloud → YouTube Data API v3)
              </p>
            )}
            {error && <p className="stock-msg error">{error}</p>}
            {hint && !error && <p className="stock-msg">{hint}</p>}

            <div className="yt-hit-list">
              {hits.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  className="yt-hit"
                  onClick={() => {
                    onPickId(hit.id);
                    onClose();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hit.thumb} alt="" loading="lazy" />
                  <span className="yt-hit-meta">
                    <strong>{hit.title}</strong>
                    <em>{hit.channel}</em>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="insert-link-panel yt-url-panel">
            <label>
              Video bağlantısı
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertFromUrl();
                  }
                }}
                placeholder="https://youtube.com/watch?v=… veya youtu.be/…"
                autoFocus
              />
            </label>
            {error && <p className="stock-msg error">{error}</p>}
            <button
              type="button"
              className="insert-primary"
              onClick={insertFromUrl}
            >
              Göm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
