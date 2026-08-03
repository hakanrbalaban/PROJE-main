/** Sayfa içi metin arama — geçici <mark.bn-find-hit> ile vurgular; kayda yazılmaz. */

export function clearFindMarks(root: HTMLElement) {
  const marks = root.querySelectorAll("mark.bn-find-hit");
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

export function htmlWithoutFindMarks(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  clearFindMarks(clone);
  return clone.innerHTML;
}

type TextHit = { node: Text; start: number; end: number };

function collectHits(root: HTMLElement, query: string): TextHit[] {
  const q = query.trim();
  if (!q) return [];
  const needle = q.toLocaleLowerCase("tr");
  const hits: TextHit[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode() as Text | null;
  while (node) {
    const text = node.nodeValue ?? "";
    const lower = text.toLocaleLowerCase("tr");
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx < 0) break;
      hits.push({ node, start: idx, end: idx + needle.length });
      from = idx + Math.max(1, needle.length);
    }
    node = walker.nextNode() as Text | null;
  }
  return hits;
}

/** Vurguları uygular; aktif indeks 0-based. Dönüş: eşleşme sayısı. */
export function applyFindHighlights(
  root: HTMLElement,
  query: string,
  activeIndex: number,
): { count: number; active: number } {
  clearFindMarks(root);
  const hits = collectHits(root, query);
  if (hits.length === 0) return { count: 0, active: 0 };

  const active = ((activeIndex % hits.length) + hits.length) % hits.length;

  // Sondan başa sar — offset kayması olmasın
  for (let i = hits.length - 1; i >= 0; i--) {
    const hit = hits[i];
    const range = document.createRange();
    range.setStart(hit.node, hit.start);
    range.setEnd(hit.node, hit.end);
    const mark = document.createElement("mark");
    mark.className =
      i === active ? "bn-find-hit bn-find-current" : "bn-find-hit";
    try {
      range.surroundContents(mark);
    } catch {
      // Bölünmüş düğümlerde extractContents
      const frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    }
  }

  const current = root.querySelector("mark.bn-find-current");
  current?.scrollIntoView({ block: "center", behavior: "smooth" });

  return { count: hits.length, active };
}
