/**
 * electron-builder extraResources varsayılan olarak node_modules'ü atlar.
 * afterPack ile Next standalone bağımlılıklarını elle kopyalarız.
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

exports.default = async function afterPack(context) {
  const projectDir = context.packager.projectDir;
  const appOutDir = context.appOutDir;
  const srcNm = path.join(projectDir, ".next", "standalone", "node_modules");
  const destStandalone = path.join(appOutDir, "resources", "standalone");
  const destNm = path.join(destStandalone, "node_modules");

  if (!fs.existsSync(srcNm)) {
    throw new Error(
      `afterPack: .next/standalone/node_modules yok. Önce npm run electron:prepare çalıştır.`,
    );
  }
  if (!fs.existsSync(destStandalone)) {
    throw new Error(`afterPack: ${destStandalone} yok — extraResources kopyalanmamış.`);
  }

  console.log("afterPack: node_modules → resources/standalone/node_modules");
  fs.rmSync(destNm, { recursive: true, force: true });
  copyDir(srcNm, destNm);

  const nextPkg = path.join(destNm, "next", "package.json");
  if (!fs.existsSync(nextPkg)) {
    throw new Error("afterPack: next paketi kopyalanamadı.");
  }
  console.log("afterPack: OK (next + sql.js)");
};
