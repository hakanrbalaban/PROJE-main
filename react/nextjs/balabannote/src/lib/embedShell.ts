/** İçerikteki resim / video / YouTube kabuğu — taşı + sil */

export type EmbedKind = "image" | "video" | "audio" | "youtube" | "file";

function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function embedBarHtml() {
  return (
    `<div class="bn-embed-bar" contenteditable="false">` +
    `<button type="button" class="bn-embed-drag" title="Sürükle" aria-label="Taşı">⠿</button>` +
    `<button type="button" class="bn-embed-del" title="Sil" aria-label="Sil">✕</button>` +
    `</div>`
  );
}

export function wrapEmbedHtml(kind: EmbedKind, inner: string) {
  return (
    `<div class="bn-embed" contenteditable="false" data-bn-kind="${escapeAttr(kind)}">` +
    embedBarHtml() +
    inner +
    `</div>`
  );
}

function ensureBar(el: HTMLElement) {
  if (el.querySelector(":scope > .bn-embed-bar")) return;
  el.insertAdjacentHTML("afterbegin", embedBarHtml());
}

function wrapNode(node: HTMLElement, kind: EmbedKind) {
  if (node.closest(".bn-embed")) {
    ensureBar(node.closest(".bn-embed") as HTMLElement);
    return;
  }
  const shell = document.createElement("div");
  shell.className = "bn-embed";
  shell.contentEditable = "false";
  shell.dataset.bnKind = kind;
  shell.innerHTML = embedBarHtml();
  const parent = node.parentNode;
  if (!parent) return;
  parent.insertBefore(shell, node);
  shell.appendChild(node);
  // kredi satırı hemen sonra geliyorsa içeri al
  const next = shell.nextSibling;
  if (
    next instanceof HTMLElement &&
    next.classList.contains("bn-media-credit")
  ) {
    shell.appendChild(next);
  }
}

/** Eski / çıplak medyayı kabuk + araç çubuğu ile sar */
export function ensureMediaEmbeds(root: HTMLElement) {
  root.querySelectorAll(".bn-yt").forEach((n) => {
    const el = n as HTMLElement;
    if (el.classList.contains("bn-embed")) {
      el.dataset.bnKind = el.dataset.bnKind || "youtube";
      ensureBar(el);
      return;
    }
    wrapNode(el, "youtube");
  });
  root
    .querySelectorAll("img.bn-media-img")
    .forEach((n) => wrapNode(n as HTMLElement, "image"));
  root
    .querySelectorAll("video.bn-media-video")
    .forEach((n) => wrapNode(n as HTMLElement, "video"));
  root
    .querySelectorAll("audio.bn-media-audio")
    .forEach((n) => wrapNode(n as HTMLElement, "audio"));
  root
    .querySelectorAll("a.bn-media-file")
    .forEach((n) => wrapNode(n as HTMLElement, "file"));

  // Eski bn-yt tek başına kaldıysa (wrap sonrası sınıf taşındı mı?)
  root.querySelectorAll(".bn-embed").forEach((n) => ensureBar(n as HTMLElement));
}

export function selectEmbed(root: HTMLElement, el: HTMLElement | null) {
  root.querySelectorAll(".bn-embed.is-selected").forEach((n) => {
    n.classList.remove("is-selected");
  });
  if (el) el.classList.add("is-selected");
}
