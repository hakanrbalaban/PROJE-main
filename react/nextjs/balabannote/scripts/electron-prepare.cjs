/**
 * Next standalone çıktısını Electron paketleme için hazırlar:
 * - .next/static → standalone/.next/static
 * - public → standalone/public
 * - .env.local → standalone/.env.local (varsa)
 */
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const serverJs = path.join(standalone, "server.js");

if (!fs.existsSync(serverJs)) {
  console.error("Hata: .next/standalone yok. Önce `npm run build` çalıştır.");
  process.exit(1);
}

copyDir(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
copyDir(path.join(root, "public"), path.join(standalone, "public"));

// Önceki paket çıktıları / gereksiz kaynaklar — şişmeyi önle
for (const junk of [
  "dist-electron",
  "node_modules/.cache",
  ".git",
  "src",
  "electron",
  "scripts",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "eslint.config.mjs",
  "tsconfig.json",
  "postcss.config.mjs",
  "package-lock.json",
  "THIRD_PARTY_NOTICES.md",
]) {
  const junkPath = path.join(standalone, junk);
  if (fs.existsSync(junkPath)) {
    fs.rmSync(junkPath, { recursive: true, force: true });
  }
}

// sql.js (WASM sqlite) — native derleme yok
const sqlJsSrc = path.join(root, "node_modules", "sql.js");
const sqlJsDest = path.join(standalone, "node_modules", "sql.js");
if (fs.existsSync(sqlJsSrc)) {
  copyDir(sqlJsSrc, sqlJsDest);
}

const nextPkg = path.join(standalone, "node_modules", "next", "package.json");
if (!fs.existsSync(nextPkg)) {
  console.error("Hata: standalone içinde next yok. `npm run build` tekrar çalıştır.");
  process.exit(1);
}

for (const envName of [".env.local", ".env"]) {
  const envSrc = path.join(root, envName);
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, path.join(standalone, envName));
  }
}

console.log("OK: Electron standalone hazır (.next/standalone) — next + sql.js dahil");
