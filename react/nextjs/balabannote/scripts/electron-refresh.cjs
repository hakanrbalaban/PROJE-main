/**
 * Next'i yeniden derleyip unpacked Electron uygulamasına kopyalar.
 * Kod değişince: npm run electron:refresh
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

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

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

console.log("1/3 Next build…");
run("npm", ["run", "build"]);

console.log("2/3 Electron prepare…");
run("npm", ["run", "electron:prepare"]);

const unpackedStandalones = [
  path.join(root, "dist-electron", "win-unpacked", "resources", "standalone"),
  path.join(root, "dist-electron", "linux-unpacked", "resources", "standalone"),
  path.join(
    root,
    "dist-electron",
    "mac",
    "Balaban Note.app",
    "Contents",
    "Resources",
    "standalone",
  ),
];

const src = path.join(root, ".next", "standalone");
let copied = 0;
for (const dest of unpackedStandalones) {
  const parent = path.dirname(dest);
  if (!fs.existsSync(parent)) continue;
  console.log("3/3 Kopyalanıyor →", dest);
  fs.rmSync(dest, { recursive: true, force: true });
  copyDir(src, dest);
  copied += 1;
}

if (copied === 0) {
  console.log(
    "Unpacked uygulama yok. İlk kez için: npm run electron:pack\n" +
      "Standalone hazır (.next/standalone). electron:dev ile canlı güncelleme kullan.",
  );
} else {
  console.log(
    `OK: ${copied} hedef güncellendi. Uygulamayı kapatıp aç (veya Yenile).`,
  );
}
