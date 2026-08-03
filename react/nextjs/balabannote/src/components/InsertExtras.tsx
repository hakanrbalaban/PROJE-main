"use client";

import {
  IconCamera,
  IconClose,
  IconEmoji,
  IconFile,
  IconGlobe,
  IconImage,
  IconLink,
  IconMic,
  IconSymbols,
  IconVideo,
  IconWebcam,
  IconYoutube,
} from "@/components/Icons";
import { Tip } from "@/components/Tip";
import { CameraCaptureDialog } from "@/components/CameraCaptureDialog";
import { StockImageDialog } from "@/components/StockImageDialog";
import { ScreenshotRegionDialog } from "@/components/ScreenshotRegionDialog";
import { YoutubeSearchDialog } from "@/components/YoutubeSearchDialog";
import { EMOJI_GROUPS, SYMBOL_GROUPS } from "@/lib/insertCatalog";
import { wrapEmbedHtml } from "@/lib/embedShell";
import { youtubeEmbedHtml } from "@/lib/youtube";
import { useEffect, useRef, useState } from "react";

export type UploadedMedia = {
  id: string;
  kind: "image" | "video" | "audio" | "file";
  name: string;
  url: string;
  attribution?: string;
};

type Panel = "emoji" | "symbol" | "link" | null;

type InsertExtrasProps = {
  onRememberSelection?: () => void;
  onInsertHtml: (html: string) => void;
  onInsertText: (text: string) => void;
};

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mediaHtml(m: UploadedMedia, alt?: string) {
  const url = escapeAttr(m.url);
  const name = escapeAttr(m.name);
  const id = escapeAttr(m.id);
  if (m.kind === "image") {
    const caption = m.attribution
      ? `<span class="bn-media-credit" contenteditable="false">${escapeAttr(m.attribution)}</span>`
      : "";
    return (
      wrapEmbedHtml(
        "image",
        `<img class="bn-media bn-media-img" src="${url}" alt="${escapeAttr(alt || name)}" data-media-id="${id}" />${caption}`,
      ) + "<p><br/></p>"
    );
  }
  if (m.kind === "video") {
    return (
      wrapEmbedHtml(
        "video",
        `<video class="bn-media bn-media-video" src="${url}" data-media-id="${id}" controls playsinline></video>`,
      ) + "<p><br/></p>"
    );
  }
  if (m.kind === "audio") {
    return (
      wrapEmbedHtml(
        "audio",
        `<audio class="bn-media bn-media-audio" src="${url}" data-media-id="${id}" controls></audio>`,
      ) + "<p><br/></p>"
    );
  }
  return (
    wrapEmbedHtml(
      "file",
      `<a class="bn-media bn-media-file" href="${url}" data-media-id="${id}" download="${name}">📎 ${name}</a>`,
    ) + "&nbsp;"
  );
}

async function uploadFile(file: File): Promise<UploadedMedia> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/media", { method: "POST", body });
  const data = (await res.json()) as UploadedMedia & { error?: string };
  if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
  return data;
}

async function captureScreenshotFrame(): Promise<{
  src: string;
  width: number;
  height: number;
}> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Bu tarayıcı ekran yakalamayı desteklemiyor");
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
  try {
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    await new Promise((r) => setTimeout(r, 180));
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas yok");
    ctx.drawImage(video, 0, 0, w, h);
    const src = canvas.toDataURL("image/png");
    return { src, width: w, height: h };
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

export function InsertExtras({
  onRememberSelection,
  onInsertHtml,
  onInsertText,
}: InsertExtrasProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [shotCrop, setShotCrop] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [panel]);

  const remember = () => onRememberSelection?.();

  const toggle = (p: Panel) => {
    remember();
    setError(null);
    setPanel((cur) => (cur === p ? null : p));
  };

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    remember();
    setBusy(true);
    setError(null);
    try {
      const media = await uploadFile(file);
      onInsertHtml(mediaHtml(media));
      setPanel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setBusy(false);
    }
  };

  const insertLink = () => {
    remember();
    let href = linkUrl.trim();
    if (!href) return;
    if (
      !/^https?:\/\//i.test(href) &&
      !href.startsWith("/") &&
      !href.startsWith("mailto:")
    ) {
      href = `https://${href}`;
    }
    const label = (linkText.trim() || href).replace(/</g, "");
    onInsertHtml(
      `<a class="bn-link" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeAttr(label)}</a>&nbsp;`,
    );
    setPanel(null);
    setLinkText("");
    setLinkUrl("https://");
  };

  const takeScreenshot = async () => {
    remember();
    setBusy(true);
    setError(null);
    try {
      const frame = await captureScreenshotFrame();
      setShotCrop(frame);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Ekran paylaşımı iptal edildi");
      } else {
        setError(err instanceof Error ? err.message : "Ekran yakalama hatası");
      }
    } finally {
      setBusy(false);
    }
  };

  const finishScreenshot = async (file: File) => {
    setShotCrop(null);
    setBusy(true);
    setError(null);
    try {
      const media = await uploadFile(file);
      onInsertHtml(mediaHtml(media, "Ekran görüntüsü"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="insert-extras" ref={rootRef}>
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        hidden
        onChange={pick}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        hidden
        onChange={pick}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={pick}
      />
      <input ref={fileRef} type="file" hidden onChange={pick} />

      <Tip label="Resim (dosya)">
        <button
          type="button"
          className="icon-tool tone-high"
          aria-label="Resim ekle"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            imageRef.current?.click();
          }}
        >
          <IconImage size={16} />
        </button>
      </Tip>
      <Tip label="Kameradan çek">
        <button
          type="button"
          className={`icon-tool tone-diamond ${cameraOpen ? "active" : ""}`}
          aria-label="Kameradan fotoğraf"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            setCameraOpen(true);
          }}
        >
          <IconWebcam size={16} />
        </button>
      </Tip>
      <Tip label="İnternetten ara (Pexels / Pixabay / Unsplash)">
        <button
          type="button"
          className="icon-tool tone-ellipse"
          aria-label="Stok görsel ara"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            setStockOpen(true);
          }}
        >
          <IconGlobe size={16} />
        </button>
      </Tip>
      <Tip label="Ekran görüntüsü (bölge seç)">
        <button
          type="button"
          className="icon-tool tone-rect"
          aria-label="Ekran görüntüsü"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            void takeScreenshot();
          }}
        >
          <IconCamera size={16} />
        </button>
      </Tip>
      <Tip label="Video (dosya)">
        <button
          type="button"
          className="icon-tool tone-fountain"
          aria-label="Video ekle"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            videoRef.current?.click();
          }}
        >
          <IconVideo size={16} />
        </button>
      </Tip>
      <Tip label="YouTube ara / göm">
        <button
          type="button"
          className={`icon-tool tone-marker ${youtubeOpen ? "active" : ""}`}
          aria-label="YouTube video ekle"
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            setYoutubeOpen(true);
          }}
        >
          <IconYoutube size={16} />
        </button>
      </Tip>
      <Tip label="Ses">
        <button
          type="button"
          className="icon-tool tone-pen"
          aria-label="Ses ekle"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            audioRef.current?.click();
          }}
        >
          <IconMic size={16} />
        </button>
      </Tip>
      <Tip label="Dosya">
        <button
          type="button"
          className="icon-tool tone-pencil"
          aria-label="Dosya ekle"
          disabled={busy}
          onMouseDown={(e) => {
            e.preventDefault();
            remember();
            fileRef.current?.click();
          }}
        >
          <IconFile size={16} />
        </button>
      </Tip>
      <Tip label="Bağlantı">
        <button
          type="button"
          className={`icon-tool ${panel === "link" ? "active" : ""}`}
          aria-label="Bağlantı ekle"
          onMouseDown={(e) => {
            e.preventDefault();
            toggle("link");
          }}
        >
          <IconLink size={16} />
        </button>
      </Tip>
      <Tip label="Emoji">
        <button
          type="button"
          className={`icon-tool tone-brush ${panel === "emoji" ? "active" : ""}`}
          aria-label="Emoji ekle"
          onMouseDown={(e) => {
            e.preventDefault();
            toggle("emoji");
          }}
        >
          <IconEmoji size={16} />
        </button>
      </Tip>
      <Tip label="Simge">
        <button
          type="button"
          className={`icon-tool ${panel === "symbol" ? "active" : ""}`}
          aria-label="Simge ekle"
          onMouseDown={(e) => {
            e.preventDefault();
            toggle("symbol");
          }}
        >
          <IconSymbols size={16} />
        </button>
      </Tip>

      {busy && <span className="insert-busy">Yükleniyor…</span>}
      {error && <span className="insert-error">{error}</span>}

      {panel === "link" && (
        <div className="insert-panel insert-link-panel">
          <div className="insert-panel-head">
            <strong>Bağlantı</strong>
            <button
              type="button"
              className="icon-tool"
              onClick={() => setPanel(null)}
              aria-label="Kapat"
            >
              <IconClose size={14} />
            </button>
          </div>
          <label>
            Adres
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              autoFocus
            />
          </label>
          <label>
            Metin
            <input
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Görünen yazı (opsiyonel)"
            />
          </label>
          <button type="button" className="insert-primary" onClick={insertLink}>
            Ekle
          </button>
        </div>
      )}

      {panel === "emoji" && (
        <div className="insert-panel insert-emoji-panel">
          <div className="insert-panel-head">
            <strong>Emoji</strong>
            <button
              type="button"
              className="icon-tool"
              onClick={() => setPanel(null)}
              aria-label="Kapat"
            >
              <IconClose size={14} />
            </button>
          </div>
          <div className="insert-emoji-scroll">
            {EMOJI_GROUPS.map((g) => (
              <div key={g.label} className="insert-emoji-group">
                <p>{g.label}</p>
                <div className="insert-emoji-grid">
                  {g.items.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="insert-emoji-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        remember();
                        onInsertText(em);
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {panel === "symbol" && (
        <div className="insert-panel insert-emoji-panel">
          <div className="insert-panel-head">
            <strong>Simge</strong>
            <button
              type="button"
              className="icon-tool"
              onClick={() => setPanel(null)}
              aria-label="Kapat"
            >
              <IconClose size={14} />
            </button>
          </div>
          <div className="insert-emoji-scroll">
            {SYMBOL_GROUPS.map((g) => (
              <div key={g.label} className="insert-emoji-group">
                <p>{g.label}</p>
                <div className="insert-emoji-grid">
                  {g.items.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className="insert-emoji-btn symbol"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        remember();
                        onInsertText(sym);
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <YoutubeSearchDialog
        open={youtubeOpen}
        onClose={() => setYoutubeOpen(false)}
        onPickId={(id) => {
          onInsertHtml(youtubeEmbedHtml(id));
        }}
      />

      <CameraCaptureDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => {
          void (async () => {
            setBusy(true);
            setError(null);
            try {
              const media = await uploadFile(file);
              onInsertHtml(mediaHtml(media, "Kamera fotoğrafı"));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Yükleme hatası");
            } finally {
              setBusy(false);
            }
          })();
        }}
      />

      <StockImageDialog
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        onPick={async ({ url, name, attribution, alt }) => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch("/api/stock/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url, name, attribution }),
            });
            const data = (await res.json()) as UploadedMedia & {
              error?: string;
            };
            if (!res.ok) throw new Error(data.error || "İçe aktarma hatası");
            onInsertHtml(mediaHtml({ ...data, attribution }, alt));
          } finally {
            setBusy(false);
          }
        }}
      />

      <ScreenshotRegionDialog
        open={Boolean(shotCrop)}
        src={shotCrop?.src ?? null}
        naturalWidth={shotCrop?.width ?? 0}
        naturalHeight={shotCrop?.height ?? 0}
        onCancel={() => setShotCrop(null)}
        onConfirm={(file) => {
          void finishScreenshot(file);
        }}
      />
    </div>
  );
}
