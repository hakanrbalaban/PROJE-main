import type { BoardShape, BoardShapeKind } from "./types";

export function shapePath(s: BoardShape): string | null {
  const { x, y, w, h, kind } = s;
  if (kind === "diamond") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`;
  }
  if (kind === "triangle") {
    return `M ${x + w / 2} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  if (kind === "hexagon") {
    const dx = w * 0.25;
    return `M ${x + dx} ${y} L ${x + w - dx} ${y} L ${x + w} ${y + h / 2} L ${x + w - dx} ${y + h} L ${x + dx} ${y + h} L ${x} ${y + h / 2} Z`;
  }
  if (kind === "parallelogram") {
    const skew = Math.min(w * 0.22, 36);
    return `M ${x + skew} ${y} L ${x + w} ${y} L ${x + w - skew} ${y + h} L ${x} ${y + h} Z`;
  }
  return null;
}

export function isLineKind(kind: BoardShapeKind): boolean {
  return kind === "arrow" || kind === "line";
}

export function isFlatText(kind: BoardShapeKind): boolean {
  return kind === "text";
}

export function defaultShapeText(kind: BoardShapeKind): string | undefined {
  if (kind === "text") return "Metin";
  if (kind === "sticky") return "Not";
  if (
    kind === "rect" ||
    kind === "roundRect" ||
    kind === "ellipse" ||
    kind === "diamond" ||
    kind === "triangle" ||
    kind === "hexagon" ||
    kind === "parallelogram"
  ) {
    return "";
  }
  return undefined;
}
