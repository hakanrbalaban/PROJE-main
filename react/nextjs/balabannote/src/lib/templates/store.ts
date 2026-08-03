import fs from "fs";
import {
  generateOneTemplate,
  listCategories,
  TEMPLATE_TARGET_COUNT,
} from "./generate";
import {
  ensureTemplatesDirSetting,
  resolveTemplatesDir,
  templatePagePath,
  templatesIndexPath,
  templateThumbPath,
} from "./paths";
import type {
  TemplateDetail,
  TemplateIndex,
  TemplateMeta,
  TemplatePagePayload,
} from "./types";

export function writeTemplateLibrary(count = TEMPLATE_TARGET_COUNT): TemplateIndex {
  const root = ensureTemplatesDirSetting();
  const items: TemplateMeta[] = [];

  for (let i = 0; i < count; i++) {
    const { meta, page, thumbSvg } = generateOneTemplate(i);
    fs.writeFileSync(
      templatePagePath(meta.id, root),
      JSON.stringify(page, null, 0),
      "utf8",
    );
    fs.writeFileSync(templateThumbPath(meta.id, root), thumbSvg, "utf8");
    items.push(meta);
  }

  const index: TemplateIndex = {
    version: 1,
    root,
    generatedAt: Date.now(),
    count: items.length,
    categories: listCategories(),
    items,
  };

  fs.writeFileSync(templatesIndexPath(root), JSON.stringify(index), "utf8");
  return index;
}

export function readTemplateIndex(): TemplateIndex | null {
  try {
    const root = resolveTemplatesDir();
    const raw = fs.readFileSync(templatesIndexPath(root), "utf8");
    return JSON.parse(raw) as TemplateIndex;
  } catch {
    return null;
  }
}

export function queryTemplates(opts: {
  q?: string;
  category?: string;
  kind?: string;
  page?: number;
  pageSize?: number;
}): {
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  items: TemplateMeta[];
  root: string;
  ready: boolean;
} {
  const index = readTemplateIndex();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 24));

  if (!index) {
    return {
      total: 0,
      page,
      pageSize,
      categories: listCategories(),
      items: [],
      root: resolveTemplatesDir(),
      ready: false,
    };
  }

  const q = opts.q?.trim().toLowerCase() ?? "";
  const category = opts.category?.trim() ?? "";
  const kind = opts.kind?.trim() ?? "";

  let filtered = index.items;
  if (category && category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }
  if (kind && kind !== "all") {
    filtered = filtered.filter((t) => t.kind === kind);
  }
  if (q) {
    filtered = filtered.filter((t) => {
      const hay = `${t.title} ${t.category} ${t.description} ${t.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    total: filtered.length,
    page,
    pageSize,
    categories: index.categories,
    items,
    root: index.root,
    ready: true,
  };
}

export function readTemplateDetail(id: string): TemplateDetail | null {
  const index = readTemplateIndex();
  if (!index) return null;
  const meta = index.items.find((t) => t.id === id);
  if (!meta) return null;
  try {
    const raw = fs.readFileSync(templatePagePath(id), "utf8");
    const page = JSON.parse(raw) as TemplatePagePayload;
    return { ...meta, page };
  } catch {
    return null;
  }
}

export function templateLibraryStats() {
  const index = readTemplateIndex();
  return {
    ready: Boolean(index),
    count: index?.count ?? 0,
    root: index?.root ?? resolveTemplatesDir(),
    generatedAt: index?.generatedAt ?? null,
    categories: index?.categories ?? listCategories(),
  };
}
