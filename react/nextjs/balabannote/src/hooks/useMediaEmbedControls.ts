"use client";

import { ensureMediaEmbeds, selectEmbed } from "@/lib/embedShell";
import { useEffect, type RefObject } from "react";

/**
 * contenteditable içindeki .bn-embed öğelerini seç / sürükle / sil.
 * Web + Electron aynı DOM etkileşimi.
 */
export function useMediaEmbedControls(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onMutate: () => void,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    ensureMediaEmbeds(root);

    const observer = new MutationObserver(() => {
      ensureMediaEmbeds(root);
    });
    observer.observe(root, { childList: true, subtree: true });

    type DragState = {
      el: HTMLElement;
      startX: number;
      startY: number;
      origLeft: number;
      origTop: number;
      moved: boolean;
    };
    let drag: DragState | null = null;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;

      const del = t.closest(".bn-embed-del");
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        const shell = del.closest(".bn-embed") as HTMLElement | null;
        if (shell) {
          shell.remove();
          selectEmbed(root, null);
          onMutate();
        }
        return;
      }

      const handle = t.closest(".bn-embed-drag");
      const shell = t.closest(".bn-embed") as HTMLElement | null;
      if (!shell || !root.contains(shell)) return;

      selectEmbed(root, shell);

      if (!handle) {
        // tıklama: seç; iframe'e geçmesin diye youtube'da bar dışına da capture
        if (shell.dataset.bnKind === "youtube" && !t.closest(".bn-embed-bar")) {
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      (handle as HTMLElement).setPointerCapture(e.pointerId);

      const rootBox = root.getBoundingClientRect();
      const box = shell.getBoundingClientRect();
      const cs = getComputedStyle(shell);
      const wasAbsolute = cs.position === "absolute";

      if (!wasAbsolute) {
        const width = box.width;
        shell.style.position = "absolute";
        shell.style.left = `${box.left - rootBox.left + root.scrollLeft}px`;
        shell.style.top = `${box.top - rootBox.top + root.scrollTop}px`;
        shell.style.width = `${width}px`;
        shell.style.margin = "0";
        shell.style.zIndex = "6";
      }

      const left = parseFloat(shell.style.left || "0");
      const top = parseFloat(shell.style.top || "0");
      drag = {
        el: shell,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: left,
        origTop: top,
        moved: false,
      };
      shell.classList.add("is-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 3) return;
      drag.moved = true;
      const nextLeft = Math.max(0, drag.origLeft + dx);
      const nextTop = Math.max(0, drag.origTop + dy);
      drag.el.style.left = `${nextLeft}px`;
      drag.el.style.top = `${nextTop}px`;
    };

    const onPointerUp = () => {
      if (!drag) return;
      drag.el.classList.remove("is-dragging");
      if (drag.moved) onMutate();
      drag = null;
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest(".bn-embed")) return;
      selectEmbed(root, null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const selected = root.querySelector(".bn-embed.is-selected");
      if (!selected) return;
      // içerik düzenlerken metin silmesin diye: odak gömülüdeyse veya seçiliyse
      const ae = document.activeElement;
      if (ae && root.contains(ae) && ae !== root && !selected.contains(ae)) {
        return;
      }
      e.preventDefault();
      selected.remove();
      selectEmbed(root, null);
      onMutate();
    };

    root.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    root.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      observer.disconnect();
      root.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [rootRef, enabled, onMutate]);
}
