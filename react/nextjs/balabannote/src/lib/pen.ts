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
      out[out.length - 1] = {
        ...prev,
        p: cur.p ?? prev.p,
      };
    }
  }
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
  const spaced = filterSpacing(raw, 1.1);
  const captured = smoothCapture(spaced, 0.55);
  const averaged = movingAverage(captured, 3);
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
    const t = Math.min(1, Math.max(0.35, 1 - dist / 40));
    return baseWidth * (minScale + (maxScale - minScale) * t);
  });

  const smoothed = raw.slice();
  for (let pass = 0; pass < 2; pass++) {
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
  // Live points are already stabilized online — skip expensive re-smoothing.
  const points = opts?.live
    ? stroke.points
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

  // Batch segments with similar width into fewer stroke() calls.
  ctx.strokeStyle = color;
  let runStart = 0;
  let runWidth = (widths[0] + widths[1]) / 2;

  const flushRun = (end: number) => {
    if (end <= runStart) return;
    ctx.beginPath();
    ctx.lineWidth = runWidth;
    ctx.moveTo(points[runStart].x, points[runStart].y);
    for (let i = runStart + 1; i <= end; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  for (let i = 1; i < points.length; i++) {
    const w = (widths[i - 1] + widths[i]) / 2;
    if (Math.abs(w - runWidth) > 0.35) {
      flushRun(i - 1);
      runStart = i - 1;
      runWidth = w;
    }
  }
  flushRun(points.length - 1);

  ctx.restore();
}

/** Live preview: use online-stabilized points as-is. */
export function drawLiveStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
): void {
  drawStroke(ctx, stroke, undefined, { live: true });
}

/** Distance from point to segment AB. */
function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-8) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** True if (x,y) is within width-aware distance of the stroke polyline. */
export function strokeHitTest(
  stroke: InkStroke,
  x: number,
  y: number,
  pad = 0,
): boolean {
  const pts = stroke.points;
  if (pts.length === 0) return false;
  const thresh = Math.max(10, stroke.width * 1.6) + pad;
  if (pts.length === 1) {
    return Math.hypot(pts[0].x - x, pts[0].y - y) <= thresh;
  }
  for (let i = 1; i < pts.length; i++) {
    if (
      distToSegment(x, y, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y) <=
      thresh
    ) {
      return true;
    }
  }
  return false;
}

/** True if eraser path intersects stroke (segment–segment approx via samples). */
export function strokeIntersectsEraser(
  stroke: InkStroke,
  eraser: Point[],
  radius = 16,
): boolean {
  const r = Math.max(radius, stroke.width * 1.2);
  for (const ep of eraser) {
    if (strokeHitTest(stroke, ep.x, ep.y, r * 0.35)) return true;
  }
  // also sample midpoints of eraser segments for sparse paths
  for (let i = 1; i < eraser.length; i++) {
    const mx = (eraser[i - 1].x + eraser[i].x) / 2;
    const my = (eraser[i - 1].y + eraser[i].y) / 2;
    if (strokeHitTest(stroke, mx, my, r * 0.35)) return true;
  }
  return false;
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

/** Mutable state for OneNote-style velocity-adaptive stabilization. */
export type StabilizerState = {
  sx: number;
  sy: number;
  initialized: boolean;
};

export function createStabilizer(): StabilizerState {
  return { sx: 0, sy: 0, initialized: false };
}

export function resetStabilizer(
  state: StabilizerState,
  point: Point,
): void {
  state.sx = point.x;
  state.sy = point.y;
  state.initialized = true;
}

/**
 * Append a stabilized sample in-place (no array copy).
 * Fast strokes track the tip closely; slow/jittery strokes are damped.
 * `responsiveness` (0.35–1.75): lower = smoother/laggier, higher = snappier.
 * Returns true when a point was added.
 */
export function appendStabilizedPoint(
  points: Point[],
  next: Point,
  state: StabilizerState,
  responsiveness = 1,
): boolean {
  if (!state.initialized) {
    resetStabilizer(state, next);
    points.push(next);
    return true;
  }

  const dist = Math.hypot(next.x - state.sx, next.y - state.sy);
  if (dist < 0.45) {
    if (typeof next.p === "number" && points.length > 0) {
      points[points.length - 1] = {
        ...points[points.length - 1],
        p: next.p,
      };
    }
    return false;
  }

  // Velocity-adaptive: snappy when fast, stable when slow (OneNote-like).
  const base = dist > 10 ? 0.82 : dist > 4 ? 0.62 : dist > 1.5 ? 0.45 : 0.32;
  const alpha = Math.min(0.95, Math.max(0.12, base * responsiveness));
  state.sx = alpha * next.x + (1 - alpha) * state.sx;
  state.sy = alpha * next.y + (1 - alpha) * state.sy;

  points.push({ x: state.sx, y: state.sy, p: next.p });
  return true;
}

/** @deprecated Prefer appendStabilizedPoint with StabilizerState. */
export function appendSmoothedPoint(
  points: Point[],
  next: Point,
  alpha = 0.55,
): Point[] {
  if (points.length === 0) return [next];
  const prev = points[points.length - 1];
  const dist = Math.hypot(next.x - prev.x, next.y - prev.y);
  if (dist < 0.45) return points;
  const a = dist > 10 ? Math.max(alpha, 0.8) : dist > 4 ? alpha : alpha * 0.7;
  points.push({
    x: a * next.x + (1 - a) * prev.x,
    y: a * next.y + (1 - a) * prev.y,
    p: next.p,
  });
  return points;
}

/** Collect high-rate stylus samples when the browser provides them. */
export function coalescedPointerSamples(
  e: PointerEvent | { getCoalescedEvents?: () => PointerEvent[]; clientX: number; clientY: number; pressure?: number },
  rect: DOMRect,
): Point[] {
  const toPoint = (ev: { clientX: number; clientY: number; pressure?: number }): Point => ({
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top,
    p: estimatePressure(ev),
  });

  const coalesced =
    typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : null;
  if (coalesced && coalesced.length > 0) {
    return coalesced.map(toPoint);
  }
  return [toPoint(e)];
}
