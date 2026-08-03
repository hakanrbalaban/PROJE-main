import type { BoardShape, BoardShapeKind } from "./types";

export function shapePath(s: BoardShape): string | null {
  const { x, y, w, h, kind } = s;
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (kind === "diamond") {
    return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`;
  }
  if (kind === "triangle") {
    return `M ${cx} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  if (kind === "hexagon") {
    const dx = w * 0.25;
    return `M ${x + dx} ${y} L ${x + w - dx} ${y} L ${x + w} ${cy} L ${x + w - dx} ${y + h} L ${x + dx} ${y + h} L ${x} ${cy} Z`;
  }
  if (kind === "parallelogram" || kind === "process") {
    const skew = Math.min(w * 0.22, 36);
    return `M ${x + skew} ${y} L ${x + w} ${y} L ${x + w - skew} ${y + h} L ${x} ${y + h} Z`;
  }
  if (kind === "star") {
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.45;
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(`${cx + Math.cos(ang) * r} ${cy + Math.sin(ang) * r}`);
    }
    return `M ${pts.join(" L ")} Z`;
  }
  if (kind === "callout") {
    const tip = Math.min(28, h * 0.28);
    const bodyH = h - tip;
    return `M ${x + 12} ${y} L ${x + w - 12} ${y} Q ${x + w} ${y} ${x + w} ${y + 12} L ${x + w} ${y + bodyH - 12} Q ${x + w} ${y + bodyH} ${x + w - 12} ${y + bodyH} L ${x + w * 0.38} ${y + bodyH} L ${x + w * 0.22} ${y + h} L ${x + w * 0.28} ${y + bodyH} L ${x + 12} ${y + bodyH} Q ${x} ${y + bodyH} ${x} ${y + bodyH - 12} L ${x} ${y + 12} Q ${x} ${y} ${x + 12} ${y} Z`;
  }
  if (kind === "document") {
    const fold = Math.min(28, w * 0.22, h * 0.22);
    return `M ${x} ${y} L ${x + w - fold} ${y} L ${x + w} ${y + fold} L ${x + w} ${y + h} L ${x} ${y + h} Z M ${x + w - fold} ${y} L ${x + w - fold} ${y + fold} L ${x + w} ${y + fold}`;
  }
  if (kind === "cloud") {
    const r1 = w * 0.18;
    const r2 = w * 0.14;
    const r3 = w * 0.16;
    return [
      `M ${x + w * 0.25} ${y + h * 0.62}`,
      `A ${r1} ${r1} 0 1 1 ${x + w * 0.28} ${y + h * 0.38}`,
      `A ${r2} ${r2} 0 1 1 ${x + w * 0.55} ${y + h * 0.28}`,
      `A ${r3} ${r3} 0 1 1 ${x + w * 0.78} ${y + h * 0.42}`,
      `A ${r2} ${r2} 0 1 1 ${x + w * 0.82} ${y + h * 0.65}`,
      `A ${r1} ${r1} 0 1 1 ${x + w * 0.25} ${y + h * 0.62}`,
      "Z",
    ].join(" ");
  }
  if (kind === "cylinder") {
    const ey = Math.min(h * 0.18, 28);
    return [
      `M ${x} ${y + ey}`,
      `L ${x} ${y + h - ey}`,
      `A ${w / 2} ${ey} 0 0 0 ${x + w} ${y + h - ey}`,
      `L ${x + w} ${y + ey}`,
      `A ${w / 2} ${ey} 0 0 0 ${x} ${y + ey}`,
      "Z",
    ].join(" ");
  }
  return null;
}

export function cylinderTopEllipse(s: BoardShape) {
  const ey = Math.min(s.h * 0.18, 28);
  return {
    cx: s.x + s.w / 2,
    cy: s.y + ey,
    rx: s.w / 2,
    ry: ey,
  };
}

export function isLineKind(kind: BoardShapeKind): boolean {
  return kind === "arrow" || kind === "line" || kind === "connector";
}

export function isChartKind(kind: BoardShapeKind): boolean {
  return kind === "chartBar" || kind === "chartPie" || kind === "chartLine";
}

export function isConnectorKind(kind: BoardShapeKind): boolean {
  return kind === "connector";
}

export function isFlatText(kind: BoardShapeKind): boolean {
  return kind === "text";
}

export function hasEditableLabel(kind: BoardShapeKind): boolean {
  if (isLineKind(kind) || isChartKind(kind)) return false;
  return true;
}

export function defaultShapeText(kind: BoardShapeKind): string | undefined {
  if (kind === "text") return "Metin";
  if (kind === "sticky") return "Not";
  if (kind === "callout") return "Not";
  if (kind === "document") return "Belge";
  if (isChartKind(kind)) return undefined;
  if (isLineKind(kind)) return undefined;
  return "";
}

export function defaultChartData(kind: BoardShapeKind) {
  const colors = ["#0D9488", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
  if (kind === "chartPie") {
    return {
      labels: ["A", "B", "C", "D"],
      values: [32, 24, 28, 16],
      colors,
    };
  }
  if (kind === "chartLine") {
    return {
      labels: ["Pzt", "Sal", "Çar", "Per", "Cum"],
      values: [12, 18, 14, 22, 19],
      colors: ["#2563EB"],
    };
  }
  return {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    values: [40, 65, 48, 72],
    colors,
  };
}

export function dashArray(style?: string): string | undefined {
  if (style === "dashed") return "8 6";
  if (style === "dotted") return "2 5";
  return undefined;
}

export function defaultArrowEnds(
  kind: BoardShapeKind,
): "none" | "end" | "start" | "both" {
  if (kind === "arrow") return "end";
  if (kind === "connector") return "end";
  return "none";
}

export function elbowPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { x: number; y: number }[] {
  const mx = (x1 + x2) / 2;
  return [
    { x: x1, y: y1 },
    { x: mx, y: y1 },
    { x: mx, y: y2 },
    { x: x2, y: y2 },
  ];
}
