import type { InkStroke, PenKind, Point } from "./types";
import { PEN_PRESETS } from "./types";

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Drop micro-jitter: keep points only when they move enough. */
export function filterSpacing(points: Point[], minDist = 1.35): Point[] {
  if (points.length < 2) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1];
    const cur = points[i];
    if (Math.hypot(cur.x - prev.x, cur.y - prev.y) >= minDist) {
      out.push(cur);
    } else {
      // keep latest pressure on last point
      out[out.length - 1] = {
        ...prev,
        p: cur.p ?? prev.p,
      };
    }
  }
  // always keep the true end for clean tips
  const last = points[points.length - 1];
  const tip = out[out.length - 1];
  if (tip.x !== last.x || tip.y !== last.y) out.push(last);
  return out;
}

/** Exponential moving average — kills hand / mouse tremor. */
export function smoothCapture(points: Point[], alpha = 0.32): Point[] {
  if (points.length < 3) return points;
  const out: Point[] = [points[0]];
  let sx = points[0].x;
  let sy = points[0].y;
  for (let i = 1; i < points.length; i++) {
    sx = alpha * points[i].x + (1 - alpha) * sx;
    sy = alpha * points[i].y + (1 - alpha) * sy;
    out.push({ x: sx, y: sy, p: points[i].p });
  }
  // blend end toward real last sample so strokes don't lag behind cursor
  const last = points[points.length - 1];
  out[out.length - 1] = {
    x: (out[out.length - 1].x + last.x) / 2,
    y: (out[out.length - 1].y + last.y) / 2,
    p: last.p,
  };
  return out;
}

/** Chaikin corner-cutting for silky curves. */
function chaikin(points: Point[], iterations = 2): Point[] {
  let pts = points;
  for (let n = 0; n < iterations; n++) {
    if (pts.length < 3) break;
    const next: Point[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      next.push({
        x: 0.75 * p.x + 0.25 * q.x,
        y: 0.75 * p.y + 0.25 * q.y,
        p: p.p,
      });
      next.push({
        x: 0.25 * p.x + 0.75 * q.x,
        y: 0.25 * p.y + 0.75 * q.y,
        p: q.p,
      });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

function movingAverage(points: Point[], window = 3): Point[] {
  if (points.length <= window) return points;
  const half = Math.floor(window / 2);
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    let sx = 0;
    let sy = 0;
    let sp = 0;
    let c = 0;
    for (let j = -half; j <= half; j++) {
      const k = Math.min(points.length - 1, Math.max(0, i + j));
      sx += points[k].x;
      sy += points[k].y;
      sp += points[k].p ?? 0.55;
      c++;
    }
    out.push({ x: sx / c, y: sy / c, p: sp / c });
  }
  out[0] = points[0];
  out[out.length - 1] = points[points.length - 1];
  return out;
}

/** Prepare raw pointer samples into a clean stroke path. */
export function finalizeStrokePoints(raw: Point[]): Point[] {
  const spaced = filterSpacing(raw, 1.25);
  const captured = smoothCapture(spaced, 0.45);
  const averaged = movingAverage(captured, 3);
  // single Chaikin pass — enough silk, keeps letter shapes
  return chaikin(averaged, 1);
}

function widthsAlong(
  points: Point[],
  baseWidth: number,
  minScale: number,
  maxScale: number,
  variable: boolean,
): number[] {
  if (!variable) {
    return points.map(() => baseWidth);
  }

  const raw: number[] = points.map((pt, i) => {
    if (typeof pt.p === "number" && pt.p > 0.05) {
      const t = Math.min(1, Math.max(0.2, pt.p));
      return baseWidth * (minScale + (maxScale - minScale) * t);
    }
    if (i === 0) return baseWidth * ((minScale + maxScale) / 2);
    const prev = points[i - 1];
    const dist = Math.hypot(pt.x - prev.x, pt.y - prev.y);
    // gentle: speed barely affects thickness
    const t = Math.min(1, Math.max(0.35, 1 - dist / 40));
    return baseWidth * (minScale + (maxScale - minScale) * t);
  });

  // heavy smooth on width so edges don't wobble
  const smoothed = raw.slice();
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < smoothed.length - 1; i++) {
      smoothed[i] = (smoothed[i - 1] + smoothed[i] + smoothed[i + 1]) / 3;
    }
  }
  return smoothed.map((w) => Math.max(0.7, w));
}

function strokePath(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    return;
  }

  // Mid-point quadratic chain — continuous single path
  ctx.lineTo(
    (points[0].x + points[1].x) / 2,
    (points[0].y + points[1].y) / 2,
  );
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

/**
 * Draw a clean ink stroke: stroke-only (no fill), stable width.
 * Points should already be smoothed via finalizeStrokePoints when saved.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  overrideOpacity?: number,
  opts?: { live?: boolean },
): void {
  if (stroke.points.length < 2) return;

  const preset = PEN_PRESETS[stroke.pen] ?? PEN_PRESETS.ballpoint;
  // Live: light smooth. Saved: trust stored points; only tiny polish.
  const points = opts?.live
    ? smoothCapture(filterSpacing(stroke.points, 1.15), 0.5)
    : stroke.points.length < 8
      ? movingAverage(stroke.points, 3)
      : stroke.points;
  if (points.length < 2) return;

  const opacity = overrideOpacity ?? preset.opacity;
  const color = hexToRgba(stroke.color, opacity);
  const variable = stroke.pen === "fountain" || stroke.pen === "brush";
  const widths = widthsAlong(
    points,
    stroke.width,
    preset.minScale,
    preset.maxScale,
    variable,
  );

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.globalCompositeOperation =
    stroke.pen === "highlighter" ? "multiply" : "source-over";

  if (stroke.pen === "pencil") {
    ctx.shadowColor = hexToRgba(stroke.color, opacity * 0.35);
    ctx.shadowBlur = 0.35;
  }

  if (!variable) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.8, stroke.width);
    if (stroke.pen === "highlighter") {
      ctx.lineCap = "butt";
      ctx.lineWidth = Math.max(8, stroke.width);
    }
    strokePath(ctx, points);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = color;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    ctx.beginPath();
    ctx.lineWidth = (widths[i - 1] + widths[i]) / 2;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.restore();
}

/** Live preview: responsive smoothing without double-processing. */
export function drawLiveStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
): void {
  drawStroke(ctx, stroke, undefined, { live: true });
}

export function estimatePressure(e: { pressure?: number }): number {
  if (typeof e.pressure === "number" && e.pressure > 0) {
    return Math.min(1, Math.max(0.2, e.pressure));
  }
  return 0.55;
}

export function defaultWidthForPen(pen: PenKind): number {
  return PEN_PRESETS[pen].baseWidth;
}

/** Online point: dampen tremor while drawing. */
export function appendSmoothedPoint(
  points: Point[],
  next: Point,
  alpha = 0.42,
): Point[] {
  if (points.length === 0) return [next];
  const prev = points[points.length - 1];
  const dist = Math.hypot(next.x - prev.x, next.y - prev.y);
  if (dist < 0.85) {
    // ignore micro jitter
    return points;
  }
  const smoothed: Point = {
    x: alpha * next.x + (1 - alpha) * prev.x,
    y: alpha * next.y + (1 - alpha) * prev.y,
    p: next.p,
  };
  return [...points, smoothed];
}
