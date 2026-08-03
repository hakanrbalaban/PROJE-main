"use client";

import {
  cylinderTopEllipse,
  dashArray,
  hasEditableLabel,
  isChartKind,
  isFlatText,
  isLineKind,
  shapePath,
} from "@/lib/shapes";
import type { BoardShape } from "@/lib/types";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";

export type BoardRenderOpts = {
  selectedId: string | null;
  toolIsSelect: boolean;
  ghost?: boolean;
  active?: boolean;
  markerPrefix?: string;
  textColor?: string;
  onPointerDown: (e: ReactPointerEvent, s: BoardShape) => void;
  onLabelBlur: (id: string, text: string) => void;
};

function chartSvg(s: BoardShape): ReactNode {
  const chart = s.chart;
  if (!chart || !chart.values.length) return null;
  const pad = 14;
  const w = Math.max(s.w, 40);
  const h = Math.max(s.h, 40);
  const colors =
    chart.colors?.length
      ? chart.colors
      : ["#0D9488", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
  const max = Math.max(...chart.values, 1);

  if (s.kind === "chartBar") {
    const n = chart.values.length;
    const gap = 6;
    const barW = Math.max(8, (w - pad * 2 - gap * (n - 1)) / n);
    const baseY = s.y + h - pad;
    const usable = h - pad * 2 - 12;
    return (
      <g>
        <rect
          x={s.x}
          y={s.y}
          width={w}
          height={h}
          rx={10}
          fill={s.fill === "transparent" ? "var(--board-surface)" : s.fill}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
        />
        {chart.values.map((v, i) => {
          const bh = (v / max) * usable;
          const bx = s.x + pad + i * (barW + gap);
          return (
            <g key={i}>
              <rect
                x={bx}
                y={baseY - bh}
                width={barW}
                height={Math.max(2, bh)}
                rx={4}
                fill={colors[i % colors.length]}
              />
              <text
                x={bx + barW / 2}
                y={s.y + h - 4}
                textAnchor="middle"
                fontSize={9}
                fill="var(--ink-soft)"
              >
                {chart.labels[i] ?? `${i + 1}`}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  if (s.kind === "chartPie") {
    const cx = s.x + w / 2;
    const cy = s.y + h / 2;
    const r = Math.min(w, h) / 2 - pad;
    const total = chart.values.reduce((a, b) => a + b, 0) || 1;
    let angle = -Math.PI / 2;
    const slices = chart.values.map((v, i) => {
      const sweep = (v / total) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * r;
      const y1 = cy + Math.sin(angle) * r;
      angle += sweep;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      const large = sweep > Math.PI ? 1 : 0;
      return (
        <path
          key={i}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
          fill={colors[i % colors.length]}
          stroke="var(--board-surface)"
          strokeWidth={1.5}
        />
      );
    });
    return (
      <g>
        <rect
          x={s.x}
          y={s.y}
          width={w}
          height={h}
          rx={10}
          fill={s.fill === "transparent" ? "var(--board-surface)" : s.fill}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
        />
        {slices}
      </g>
    );
  }

  // chartLine
  {
    const n = chart.values.length;
    const usableW = w - pad * 2;
    const usableH = h - pad * 2 - 10;
    const pts = chart.values.map((v, i) => {
      const px = s.x + pad + (n <= 1 ? usableW / 2 : (i / (n - 1)) * usableW);
      const py = s.y + pad + 8 + (1 - v / max) * usableH;
      return `${px},${py}`;
    });
    return (
      <g>
        <rect
          x={s.x}
          y={s.y}
          width={w}
          height={h}
          rx={10}
          fill={s.fill === "transparent" ? "var(--board-surface)" : s.fill}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
        />
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={colors[0]}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {chart.values.map((v, i) => {
          const px =
            s.x + pad + (n <= 1 ? usableW / 2 : (i / (n - 1)) * usableW);
          const py = s.y + pad + 8 + (1 - v / max) * usableH;
          return (
            <circle key={i} cx={px} cy={py} r={3.5} fill={colors[0]} />
          );
        })}
      </g>
    );
  }
}

export function renderBoardShape(
  s: BoardShape,
  opts: BoardRenderOpts,
): ReactNode {
  const {
    selectedId,
    toolIsSelect,
    ghost = false,
    active = true,
    markerPrefix = "board",
    textColor,
    onPointerDown,
    onLabelBlur,
  } = opts;
  const isSelected = !ghost && s.id === selectedId;
  const cursor = toolIsSelect ? "move" : "crosshair";
  const style = {
    cursor,
    pointerEvents: active ? ("auto" as const) : ("none" as const),
  };
  const common = {
    fill: s.fill === "transparent" ? "none" : s.fill,
    stroke: s.stroke === "transparent" ? "none" : s.stroke,
    strokeWidth: s.strokeWidth,
    strokeDasharray: dashArray(s.lineStyle),
    opacity: ghost ? 0.5 : 1,
    onPointerDown: (e: ReactPointerEvent) => onPointerDown(e, s),
    style,
  };

  let body: ReactNode = null;
  const path = shapePath(s);

  if (isChartKind(s.kind)) {
    body = (
      <g
        onPointerDown={(e) => onPointerDown(e, s)}
        style={style}
        opacity={ghost ? 0.5 : 1}
      >
        {chartSvg(s)}
      </g>
    );
  } else if (s.kind === "text") {
    body = (
      <rect
        x={s.x}
        y={s.y}
        width={Math.max(s.w, 40)}
        height={Math.max(s.h, 24)}
        fill="transparent"
        stroke="none"
        onPointerDown={(e) => onPointerDown(e, s)}
        style={style}
      />
    );
  } else if (s.kind === "rect" || s.kind === "sticky" || s.kind === "roundRect") {
    body = (
      <rect
        x={s.x}
        y={s.y}
        width={Math.max(s.w, 40)}
        height={Math.max(s.h, 28)}
        rx={s.kind === "rect" ? 6 : s.kind === "sticky" ? 4 : 14}
        {...common}
        fill={
          s.kind === "sticky" && s.fill === "transparent"
            ? "#FEF08A"
            : common.fill
        }
      />
    );
  } else if (s.kind === "ellipse") {
    body = (
      <ellipse
        cx={s.x + s.w / 2}
        cy={s.y + s.h / 2}
        rx={s.w / 2}
        ry={s.h / 2}
        {...common}
      />
    );
  } else if (s.kind === "cylinder" && path) {
    const top = cylinderTopEllipse(s);
    body = (
      <g>
        <path d={path} {...common} />
        <ellipse
          cx={top.cx}
          cy={top.cy}
          rx={top.rx}
          ry={top.ry}
          fill={common.fill === "none" ? "rgba(255,255,255,0.35)" : common.fill}
          stroke={common.stroke}
          strokeWidth={s.strokeWidth}
          opacity={ghost ? 0.5 : 1}
          onPointerDown={(e) => onPointerDown(e, s)}
          style={style}
        />
      </g>
    );
  } else if (path) {
    body = <path d={path} {...common} />;
  } else if (s.kind === "connector") {
    const pts =
      s.points && s.points.length >= 2
        ? s.points
        : [
            { x: s.x, y: s.y },
            { x: s.x2 ?? s.x + s.w, y: s.y2 ?? s.y + s.h },
          ];
    const d = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    const ends = s.arrowEnds ?? "end";
    body = (
      <path
        d={d}
        fill="none"
        stroke={s.stroke}
        strokeWidth={s.strokeWidth}
        strokeDasharray={dashArray(s.lineStyle)}
        markerEnd={
          ends === "end" || ends === "both"
            ? `url(#${markerPrefix}-arrow-end)`
            : undefined
        }
        markerStart={
          ends === "start" || ends === "both"
            ? `url(#${markerPrefix}-arrow-start)`
            : undefined
        }
        opacity={ghost ? 0.5 : 1}
        onPointerDown={(e) => onPointerDown(e, s)}
        style={style}
      />
    );
  } else if (s.kind === "line" || s.kind === "arrow") {
    const x2 = s.x2 ?? s.x + s.w;
    const y2 = s.y2 ?? s.y + s.h;
    const ends = s.arrowEnds ?? (s.kind === "arrow" ? "end" : "none");
    body = (
      <line
        x1={s.x}
        y1={s.y}
        x2={x2}
        y2={y2}
        stroke={s.stroke}
        strokeWidth={s.strokeWidth}
        strokeDasharray={dashArray(s.lineStyle)}
        fill="none"
        markerEnd={
          ends === "end" || ends === "both"
            ? `url(#${markerPrefix}-arrow-end)`
            : undefined
        }
        markerStart={
          ends === "start" || ends === "both"
            ? `url(#${markerPrefix}-arrow-start)`
            : undefined
        }
        opacity={ghost ? 0.5 : 1}
        onPointerDown={(e) => onPointerDown(e, s)}
        style={style}
      />
    );
  }

  const showLabel =
    s.text != null && hasEditableLabel(s.kind) && !isChartKind(s.kind);

  return (
    <g key={s.id}>
      {body}
      {showLabel && (
        <foreignObject
          x={isFlatText(s.kind) ? s.x : s.x + 8}
          y={isFlatText(s.kind) ? s.y : s.y + 8}
          width={Math.max(s.w - (isFlatText(s.kind) ? 0 : 16), 40)}
          height={Math.max(s.h - (isFlatText(s.kind) ? 0 : 16), 22)}
          style={{
            pointerEvents:
              active && toolIsSelect && isSelected ? "auto" : "none",
          }}
        >
          <div
            className={`board-label ${isFlatText(s.kind) ? "flat" : ""} ${s.kind === "sticky" ? "sticky-label" : ""}`}
            contentEditable={isSelected && !ghost && active}
            suppressContentEditableWarning
            onBlur={(e) =>
              onLabelBlur(s.id, e.currentTarget.textContent || "")
            }
            style={
              isFlatText(s.kind) && textColor ? { color: textColor } : undefined
            }
          >
            {s.text}
          </div>
        </foreignObject>
      )}
      {isSelected && !isLineKind(s.kind) && (
        <rect
          x={s.x - 3}
          y={s.y - 3}
          width={s.w + 6}
          height={s.h + 6}
          fill="none"
          stroke="#3B82F6"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          pointerEvents="none"
        />
      )}
    </g>
  );
}

export function BoardArrowMarkers({
  prefix = "board",
}: {
  prefix?: string;
  color?: string;
}) {
  return (
    <>
      <marker
        id={`${prefix}-arrow-end`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="context-stroke" />
      </marker>
      <marker
        id={`${prefix}-arrow-start`}
        markerWidth="10"
        markerHeight="7"
        refX="1"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="10 0, 0 3.5, 10 7" fill="context-stroke" />
      </marker>
    </>
  );
}
