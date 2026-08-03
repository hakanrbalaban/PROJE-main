import fs from "fs";
import path from "path";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settings";

const DEFAULT_TEMPLATES_DIR = "D:\\BalabanNote\\templates";

export function resolveTemplatesDir(): string {
  const settings = loadSettings();
  const fromEnv = process.env.TEMPLATES_PATH?.trim();
  const fromSettings = settings.templatesDir?.trim();
  const dir = path.resolve(
    fromEnv || fromSettings || DEFAULT_TEMPLATES_DIR,
  );
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "pages"), { recursive: true });
  fs.mkdirSync(path.join(dir, "thumbs"), { recursive: true });
  return dir;
}

export function ensureTemplatesDirSetting(): string {
  const dir = resolveTemplatesDir();
  const settings = loadSettings();
  if (!settings.templatesDir) {
    saveSettings({ templatesDir: dir } satisfies AppSettings);
  }
  return dir;
}

export function templatesIndexPath(root = resolveTemplatesDir()) {
  return path.join(root, "index.json");
}

export function templatePagePath(id: string, root = resolveTemplatesDir()) {
  return path.join(root, "pages", `${id}.json`);
}

export function templateThumbPath(id: string, root = resolveTemplatesDir()) {
  return path.join(root, "thumbs", `${id}.svg`);
}
