/** YouTube URL / id yardımcıları */

export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      if (
        (parts[0] === "embed" ||
          parts[0] === "shorts" ||
          parts[0] === "live") &&
        parts[1] &&
        /^[\w-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    /* ignore */
  }
  const loose = raw.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  return loose?.[1] ?? null;
}

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function youtubeEmbedHtml(videoId: string) {
  const id = escapeAttr(videoId);
  const src = `https://www.youtube-nocookie.com/embed/${id}`;
  const inner =
    `<div class="bn-yt" data-youtube-id="${id}">` +
    `<iframe class="bn-yt-frame" src="${src}" title="YouTube video" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>` +
    `</div>`;
  // Dinamik import döngüsü olmasın diye kabuğu burada kur
  return (
    `<div class="bn-embed" contenteditable="false" data-bn-kind="youtube">` +
    `<div class="bn-embed-bar" contenteditable="false">` +
    `<button type="button" class="bn-embed-drag" title="Sürükle" aria-label="Taşı">⠿</button>` +
    `<button type="button" class="bn-embed-del" title="Sil" aria-label="Sil">✕</button>` +
    `</div>${inner}</div><p><br/></p>`
  );
}
