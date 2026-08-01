"use client";

import { GOOGLE_FONTS_HREF } from "@/lib/fonts";
import { useEffect } from "react";

/** Google Fonts kütüphanesini bir kez yükler (not yazı tipleri için). */
export function NoteFontsLoader() {
  useEffect(() => {
    const id = "balaban-note-google-fonts";
    if (document.getElementById(id)) return;
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_HREF;
    document.head.append(pre1, pre2, link);
  }, []);

  return null;
}
