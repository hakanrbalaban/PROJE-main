import fs from "fs";
import path from "path";

export type AppSettings = {
  /** Notların kaydedildiği klasör (SQLite burada tutulur) */
  dataDir?: string;
};

function dataRoot() {
  const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function settingsFilePath() {
  const fromEnv = process.env.SETTINGS_PATH;
  if (fromEnv) return fromEnv;
  return path.join(dataRoot(), "settings.json");
}

export function loadSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(settingsFilePath(), "utf8");
    return JSON.parse(raw) as AppSettings;
  } catch {
    return {};
  }
}

export function saveSettings(next: AppSettings): AppSettings {
  const file = settingsFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const merged = { ...loadSettings(), ...next };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export function resolveDataDir(): string {
  const settings = loadSettings();
  if (settings.dataDir?.trim()) {
    const dir = path.resolve(settings.dataDir.trim());
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  if (process.env.SQLITE_PATH) {
    return path.dirname(path.resolve(process.env.SQLITE_PATH));
  }
  const dir = dataRoot();
  return dir;
}

export function resolveDbFilePath(): string {
  const settings = loadSettings();
  if (settings.dataDir?.trim()) {
    const dir = path.resolve(settings.dataDir.trim());
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "balaban-note.db");
  }
  if (process.env.SQLITE_PATH) {
    const file = path.resolve(process.env.SQLITE_PATH);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return file;
  }
  return path.join(dataRoot(), "balaban-note.db");
}
