"use client";

import { useCallback, useEffect, useState } from "react";

type DataFolderInfo = {
  dataDir: string;
  dbPath: string;
};

export function DataFolderControl() {
  const [info, setInfo] = useState<DataFolderInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isElectron = typeof window !== "undefined" && !!window.balabanDesktop;

  const refresh = useCallback(async () => {
    try {
      if (window.balabanDesktop) {
        const data = await window.balabanDesktop.getDataFolder();
        setInfo(data);
        return;
      }
      const res = await fetch("/api/settings", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as DataFolderInfo;
      setInfo(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!window.balabanDesktop?.onDataFolderChanged) return;
    return window.balabanDesktop.onDataFolderChanged((payload) => {
      setInfo(payload);
      void fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dataDir: payload.dataDir }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setMessage(err.error ?? "Klasör API’ye yazılamadı");
          return;
        }
        setMessage("Kayıt klasörü güncellendi");
      });
    });
  }, [refresh]);

  const pickFolder = async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (window.balabanDesktop) {
        const result = await window.balabanDesktop.selectDataFolder();
        if (result.canceled) return;
        setInfo({ dataDir: result.dataDir, dbPath: result.dbPath });
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dataDir: result.dataDir }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setMessage(err.error ?? "Klasör kaydedilemedi");
          return;
        }
        setMessage(`Kayıt: ${result.dataDir}`);
        return;
      }

      // Tarayıcı: yol elle
      const typed = window.prompt(
        "Notların kaydedileceği klasör yolu (ör. D:\\\\BalabanNotes)",
        info?.dataDir ?? "D:\\BalabanNotes",
      );
      if (!typed?.trim()) return;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dataDir: typed.trim() }),
      });
      const data = (await res.json()) as DataFolderInfo & { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Klasör ayarlanamadı");
        return;
      }
      setInfo({ dataDir: data.dataDir, dbPath: data.dbPath });
      setMessage(`Kayıt: ${data.dataDir}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="data-folder-control">
      <button
        type="button"
        className="folder-btn"
        disabled={busy}
        onClick={() => void pickFolder()}
        title={info?.dataDir ?? "Kayıt klasörü seç"}
      >
        {busy ? "…" : "Klasör"}
      </button>
      {info?.dataDir && (
        <span className="folder-path" title={info.dbPath}>
          {info.dataDir}
        </span>
      )}
      {message && <span className="folder-msg">{message}</span>}
      {!isElectron && (
        <span className="folder-hint">ör. D:\BalabanNotes</span>
      )}
    </div>
  );
}
