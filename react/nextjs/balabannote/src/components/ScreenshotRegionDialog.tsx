"use client";

import { IconClose } from "@/components/Icons";
import { useCallback, useEffect, useRef, useState } from "react";

type Rect = { x: number; y: number; w: number; h: number };

type ScreenshotRegionDialogProps = {
  open: boolean;
  /** Kaynak görsel (data URL veya blob URL) */
  src: string | null;
  naturalWidth: number;
  naturalHeight: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

async function cropToFile(
  src: string,
  naturalW: number,
  naturalH: number,
  rect: Rect | null,
): Promise<File> {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Görsel yüklenemedi"));
    img.src = src;
  });

  const sx = rect ? Math.round(rect.x) : 0;
  const sy = rect ? Math.round(rect.y) : 0;
  const sw = rect ? Math.round(rect.w) : naturalW;
  const sh = rect ? Math.round(rect.h) : naturalH;
  if (sw < 2 || sh < 2) throw new Error("Bölge çok küçük");

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas yok");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG oluşturulamadı"))),
      "image/png",
    );
  });
  return new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" });
}

export function ScreenshotRegionDialog({
  open,
  src,
  naturalWidth,
  naturalHeight,
  onCancel,
  onConfirm,
}: ScreenshotRegionDialogProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) return;
    setSelection(null);
    setError(null);
    setBusy(false);
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = stageRef.current;
      if (!el || !naturalWidth) return;
      const maxW = el.clientWidth;
      const maxH = Math.min(window.innerHeight * 0.62, 560);
      const s = Math.min(maxW / naturalWidth, maxH / naturalHeight, 1);
      setScale(s > 0 ? s : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, naturalWidth, naturalHeight]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && selection && selection.w > 2 && selection.h > 2) {
        e.preventDefault();
        void confirm(selection);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selection, src]);

  const toImageCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = stageRef.current;
      if (!el) return { x: 0, y: 0 };
      const box = el.getBoundingClientRect();
      const x = clamp((clientX - box.left) / scale, 0, naturalWidth);
      const y = clamp((clientY - box.top) / scale, 0, naturalHeight);
      return { x, y };
    },
    [scale, naturalWidth, naturalHeight],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !src) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toImageCoords(e.clientX, e.clientY);
    dragStart.current = p;
    setDragging(true);
    setSelection({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const p = toImageCoords(e.clientX, e.clientY);
    setSelection(normalizeRect(dragStart.current, p));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(false);
    dragStart.current = null;
    setSelection((cur) => {
      if (!cur || cur.w < 3 || cur.h < 3) return null;
      return cur;
    });
  };

  const confirm = async (rect: Rect | null) => {
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      const file = await cropToFile(src, naturalWidth, naturalHeight, rect);
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kırpma hatası");
      setBusy(false);
    }
  };

  if (!open || !src) return null;

  const dispW = naturalWidth * scale;
  const dispH = naturalHeight * scale;
  const selStyle = selection
    ? {
        left: selection.x * scale,
        top: selection.y * scale,
        width: selection.w * scale,
        height: selection.h * scale,
      }
    : undefined;

  return (
    <div className="shot-crop-backdrop" role="presentation">
      <div
        className="shot-crop-dialog"
        role="dialog"
        aria-label="Ekran bölgesi seç"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="shot-crop-head">
          <div>
            <h2>Bölge seç</h2>
            <p>Sürükleyerek alan seç · Esc iptal · Enter onay</p>
          </div>
          <button
            type="button"
            className="icon-tool"
            onClick={onCancel}
            aria-label="Kapat"
            disabled={busy}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div
          ref={stageRef}
          className="shot-crop-stage"
          style={{ width: dispW, height: dispH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Ekran yakalama"
            width={dispW}
            height={dispH}
            draggable={false}
          />
          <div className="shot-crop-dim" aria-hidden />
          {selection && selection.w > 0 && selection.h > 0 && (
            <div className="shot-crop-sel" style={selStyle} aria-hidden>
              <span className="shot-crop-size">
                {Math.round(selection.w)} × {Math.round(selection.h)}
              </span>
            </div>
          )}
        </div>

        {error && <p className="shot-crop-error">{error}</p>}

        <div className="shot-crop-actions">
          <button
            type="button"
            className="shot-crop-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            İptal
          </button>
          <button
            type="button"
            className="shot-crop-secondary"
            disabled={busy}
            onClick={() => void confirm(null)}
          >
            Tümünü ekle
          </button>
          <button
            type="button"
            className="insert-primary shot-crop-primary"
            disabled={
              busy || !selection || selection.w < 3 || selection.h < 3
            }
            onClick={() => void confirm(selection)}
          >
            {busy ? "…" : "Seçilen bölgeyi ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
