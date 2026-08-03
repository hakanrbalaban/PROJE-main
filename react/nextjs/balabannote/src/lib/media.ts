import fs from "fs";
import path from "path";
import { resolveDataDir } from "@/lib/settings";

const MAX_BYTES = 40 * 1024 * 1024; // 40 MB

const IMAGE_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);

export type MediaKind = "image" | "video" | "audio" | "file";

export function mediaRootDir() {
  const dir = path.join(resolveDataDir(), "media");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function mediaMaxBytes() {
  return MAX_BYTES;
}

export function classifyExt(ext: string): MediaKind {
  const e = ext.toLowerCase();
  if (IMAGE_EXT.has(e)) return "image";
  if (VIDEO_EXT.has(e)) return "video";
  if (AUDIO_EXT.has(e)) return "audio";
  return "file";
}

export function sanitizeOriginalName(name: string) {
  return name.replace(/[^\w.\- ()ğüşıöçĞÜŞİÖÇ]+/gi, "_").slice(0, 120);
}

export function makeMediaId(originalName: string) {
  const ext = path.extname(originalName).toLowerCase().slice(0, 12) || "";
  const base = `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  return `${base}${ext}`;
}

export function resolveMediaPath(id: string) {
  const safe = path.basename(id);
  if (!safe || safe !== id || safe.includes("..")) return null;
  return path.join(mediaRootDir(), safe);
}

export function mimeFromExt(ext: string) {
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".pdf": "application/pdf",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
