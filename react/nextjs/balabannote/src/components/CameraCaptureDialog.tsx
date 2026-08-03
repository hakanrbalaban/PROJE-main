"use client";

import { IconClose } from "@/components/Icons";
import { useEffect, useRef, useState } from "react";

type CameraCaptureDialogProps = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

export function CameraCaptureDialog({
  open,
  onClose,
  onCapture,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function start() {
      setError(null);
      setReady(false);
      stopStream();
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Kamera bu ortamda desteklenmiyor");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError("Kamera izni reddedildi");
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setError("Kamera bulunamadı");
        } else {
          setError(err instanceof Error ? err.message : "Kamera açılamadı");
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  const close = () => {
    stopStream();
    onClose();
  };

  const snap = async () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    setBusy(true);
    try {
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas yok");
      // Ön kamera için aynalamayı düzelt (kullanıcıya doğal görünsün diye preview mirrored olabilir)
      ctx.drawImage(video, 0, 0, w, h);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Fotoğraf oluşturulamadı"))),
          "image/jpeg",
          0.92,
        );
      });
      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      stopStream();
      onCapture(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Çekim hatası");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="stock-dialog-backdrop" role="presentation" onMouseDown={close}>
      <div
        className="stock-dialog camera-dialog"
        role="dialog"
        aria-label="Kameradan fotoğraf"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stock-dialog-head">
          <div>
            <h2>Kamera</h2>
            <p>Fotoğraf çek ve nota ekle</p>
          </div>
          <button
            type="button"
            className="icon-tool"
            onClick={close}
            aria-label="Kapat"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className={`camera-preview ${facing === "user" ? "mirror" : ""}`}>
          <video ref={videoRef} playsInline muted autoPlay />
          {!ready && !error && <p className="camera-wait">Kamera açılıyor…</p>}
        </div>

        {error && <p className="stock-msg error">{error}</p>}

        <div className="camera-actions">
          <button
            type="button"
            className="shot-crop-secondary"
            onClick={() =>
              setFacing((f) => (f === "user" ? "environment" : "user"))
            }
            disabled={busy}
          >
            Kamerayı çevir
          </button>
          <button
            type="button"
            className="insert-primary shot-crop-primary"
            onClick={() => void snap()}
            disabled={!ready || busy}
          >
            {busy ? "…" : "Çek"}
          </button>
        </div>
      </div>
    </div>
  );
}
