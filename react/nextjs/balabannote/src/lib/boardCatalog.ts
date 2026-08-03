import type { BoardShapeKind, BoardLineStyle, BoardArrowEnds } from "./types";

export type BoardLibTab = "shapes" | "lines" | "notes" | "charts";

export type BoardToolItem = {
  /** Unique catalog key */
  key: string;
  id: BoardShapeKind;
  label: string;
  tab: BoardLibTab;
  lineStyle?: BoardLineStyle;
  arrowEnds?: BoardArrowEnds;
  fill?: string;
};

export const BOARD_LIB_TABS: { id: BoardLibTab; label: string }[] = [
  { id: "shapes", label: "Şekiller" },
  { id: "lines", label: "Çizgiler" },
  { id: "notes", label: "Not / Metin" },
  { id: "charts", label: "Chart" },
];

export const BOARD_TOOLS: BoardToolItem[] = [
  { key: "rect", id: "rect", label: "Kutu", tab: "shapes" },
  {
    key: "roundRect",
    id: "roundRect",
    label: "Yuvarlak",
    tab: "shapes",
    fill: "#E0F2FE",
  },
  { key: "ellipse", id: "ellipse", label: "Oval", tab: "shapes" },
  { key: "diamond", id: "diamond", label: "Elmas", tab: "shapes" },
  { key: "triangle", id: "triangle", label: "Üçgen", tab: "shapes" },
  { key: "hexagon", id: "hexagon", label: "Altıgen", tab: "shapes" },
  {
    key: "parallelogram",
    id: "parallelogram",
    label: "Paralelkenar",
    tab: "shapes",
  },
  {
    key: "process",
    id: "process",
    label: "Süreç",
    tab: "shapes",
    fill: "#CCFBF1",
  },
  {
    key: "cylinder",
    id: "cylinder",
    label: "Silindir",
    tab: "shapes",
    fill: "#DBEAFE",
  },
  { key: "cloud", id: "cloud", label: "Bulut", tab: "shapes", fill: "#F3E8FF" },
  { key: "star", id: "star", label: "Yıldız", tab: "shapes", fill: "#FEF3C7" },
  {
    key: "callout",
    id: "callout",
    label: "Konuşma",
    tab: "shapes",
    fill: "#FFEDD5",
  },
  {
    key: "document",
    id: "document",
    label: "Belge",
    tab: "shapes",
    fill: "#F1F5F9",
  },

  {
    key: "line-solid",
    id: "line",
    label: "Çizgi",
    tab: "lines",
    arrowEnds: "none",
  },
  {
    key: "line-dash",
    id: "line",
    label: "Kesikli",
    tab: "lines",
    lineStyle: "dashed",
    arrowEnds: "none",
  },
  {
    key: "line-dot",
    id: "line",
    label: "Noktalı",
    tab: "lines",
    lineStyle: "dotted",
    arrowEnds: "none",
  },
  {
    key: "arrow-end",
    id: "arrow",
    label: "Ok",
    tab: "lines",
    arrowEnds: "end",
  },
  {
    key: "arrow-both",
    id: "arrow",
    label: "Çift ok",
    tab: "lines",
    arrowEnds: "both",
  },
  {
    key: "connector",
    id: "connector",
    label: "Elbow",
    tab: "lines",
    arrowEnds: "end",
  },

  {
    key: "sticky",
    id: "sticky",
    label: "Sticky",
    tab: "notes",
    fill: "#FEF08A",
  },
  { key: "text", id: "text", label: "Metin", tab: "notes" },

  {
    key: "chartBar",
    id: "chartBar",
    label: "Bar",
    tab: "charts",
    fill: "#ffffff",
  },
  {
    key: "chartPie",
    id: "chartPie",
    label: "Pie",
    tab: "charts",
    fill: "#ffffff",
  },
  {
    key: "chartLine",
    id: "chartLine",
    label: "Line",
    tab: "charts",
    fill: "#ffffff",
  },
];
