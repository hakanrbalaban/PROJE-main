import type { NotePage, PageKind } from "@/lib/types";

export type TemplateMeta = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  kind: PageKind;
  accent: string;
  accent2: string;
  description: string;
  thumb: string;
  updatedAt: number;
};

export type TemplatePagePayload = Omit<
  NotePage,
  "id" | "notebookId" | "updatedAt"
> & {
  /** Snapshot title (may match meta.title) */
  title: string;
  kind: PageKind;
};

export type TemplateDetail = TemplateMeta & {
  page: TemplatePagePayload;
};

export type TemplateIndex = {
  version: 1;
  root: string;
  generatedAt: number;
  count: number;
  categories: string[];
  items: TemplateMeta[];
};

export type TemplateListResponse = {
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  items: TemplateMeta[];
};
