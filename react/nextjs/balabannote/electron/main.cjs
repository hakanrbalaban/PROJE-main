const {
  app,
  BrowserWindow,
  shell,
  Menu,
  dialog,
  ipcMain,
} = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");

const isDev = !app.isPackaged;
const PORT = Number(process.env.BALABAN_PORT || 3456);
const HOST = "127.0.0.1";
const APP_URL = `http://${HOST}:${PORT}`;

/** @type {import('child_process').ChildProcess | null} */
let nextProc = null;
/** @type {BrowserWindow | null} */
let mainWindow = null;
let updaterReady = false;
let logPath = null;

function initLog() {
  try {
    const dir = app.getPath("userData");
    fs.mkdirSync(dir, { recursive: true });
    logPath = path.join(dir, "balaban-note.log");
    fs.writeFileSync(
      logPath,
      `\n==== ${new Date().toISOString()} start isDev=${isDev} ====\n`,
      { flag: "a" },
    );
  } catch {
    logPath = null;
  }
}

function log(...args) {
  const line = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a, null, 0)))
    .join(" ");
  console.log(line);
  if (logPath) {
    try {
      fs.appendFileSync(logPath, line + "\n");
    } catch {
      /* ignore */
    }
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
  log("env loaded:", filePath);
}

function standaloneDir() {
  if (isDev) return path.join(__dirname, "..");
  return path.join(process.resourcesPath, "standalone");
}

function findServerJs(dir) {
  const direct = path.join(dir, "server.js");
  if (fs.existsSync(direct)) return direct;
  // bazı Next sürümleri paket adıyla alt klasör açar
  try {
    for (const name of fs.readdirSync(dir)) {
      const nested = path.join(dir, name, "server.js");
      if (fs.existsSync(nested)) return nested;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function waitForServer(url, attempts = 100) {
  return new Promise((resolve, reject) => {
    const tryOnce = (left) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => {
        if (left <= 0) {
          reject(new Error(`Sunucu hazır değil: ${url}`));
          return;
        }
        setTimeout(() => tryOnce(left - 1), 300);
      });
    };
    tryOnce(attempts);
  });
}

function startNextServer() {
  if (isDev) return Promise.resolve();

  const dir = standaloneDir();
  log("standalone dir:", dir);
  log("resourcesPath:", process.resourcesPath);
  log("execPath:", process.execPath);

  loadEnvFile(path.join(dir, ".env.local"));
  loadEnvFile(path.join(dir, ".env"));

  const serverJs = findServerJs(dir);
  if (!serverJs) {
    return Promise.reject(
      new Error(
        `Standalone sunucu bulunamadı.\nAranan: ${path.join(dir, "server.js")}\nYeniden kur: npm run electron:dist`,
      ),
    );
  }

  const cwd = path.dirname(serverJs);
  log("starting server:", serverJs, "cwd:", cwd);

  const env = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(PORT),
    HOSTNAME: HOST,
    ELECTRON: "1",
    DB_DRIVER: process.env.DB_DRIVER || "sqlite",
    SETTINGS_PATH: settingsPath(),
    SQLITE_PATH: resolveSqlitePathFromSettings(),
  };

  // 1) Tercih: Electron'u Node gibi çalıştır
  // 2) Yedek: sistemdeki node (PATH) — shell yok (Program Files boşluk kırılır)
  const candidates = [
    {
      cmd: process.execPath,
      args: [serverJs],
      env: { ...env, ELECTRON_RUN_AS_NODE: "1" },
      label: "electron-as-node",
    },
    {
      cmd: process.platform === "win32" ? "node.exe" : "node",
      args: [serverJs],
      env,
      label: "system-node",
    },
  ];

  function spawnCandidate(c) {
    return new Promise((resolve, reject) => {
      log("try spawn:", c.label, c.cmd);
      const child = spawn(c.cmd, c.args, {
        cwd,
        env: c.env,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        shell: false,
      });

      let settled = false;
      const onFail = (reason) => {
        if (settled) return;
        settled = true;
        try {
          child.kill();
        } catch {
          /* ignore */
        }
        reject(new Error(reason));
      };

      child.stdout?.on("data", (buf) => log(`[next:${c.label}]`, buf.toString().trim()));
      child.stderr?.on("data", (buf) =>
        log(`[next:${c.label}:err]`, buf.toString().trim()),
      );
      child.on("error", (err) => onFail(`${c.label} spawn: ${err.message}`));
      child.on("exit", (code) => {
        if (!settled) onFail(`${c.label} erken çıkt (code=${code})`);
      });

      waitForServer(APP_URL, 40)
        .then(() => {
          if (settled) return;
          settled = true;
          nextProc = child;
          resolve(c.label);
        })
        .catch(() => onFail(`${c.label} sunucu yanıt vermedi`));
    });
  }

  return candidates
    .reduce(
      (chain, c) =>
        chain.catch(() => spawnCandidate(c)),
      Promise.reject(new Error("start")),
    )
    .then((label) => {
      log("server ok via", label);
    })
    .catch((err) => {
      const hint = logPath ? `\n\nLog: ${logPath}` : "";
      throw new Error(
        `Next sunucusu başlatılamadı.\n${err.message}${hint}\n\nYeniden kur: npm run electron:dist`,
      );
    });
}

function reloadAppWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.reloadIgnoringCache();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 860,
    minHeight: 600,
    show: false,
    backgroundColor: "#f5f8fb",
    title: "Balaban Note",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Stylus/kalem: arka planda RAF ve timer yavaşlamasın
      backgroundThrottling: false,
    },
  });

  try {
    mainWindow.webContents.setBackgroundThrottling(false);
    mainWindow.webContents.setFrameRate(120);
  } catch {
    /* older electron */
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(APP_URL);

  if (isDev) {
    mainWindow.webContents.on("did-fail-load", () => {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(APP_URL);
        }
      }, 800);
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function loadAppSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
  } catch {
    return {};
  }
}

function saveAppSettings(next) {
  const merged = { ...loadAppSettings(), ...next };
  fs.writeFileSync(settingsPath(), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

function resolveSqlitePathFromSettings() {
  const s = loadAppSettings();
  if (s.dataDir && String(s.dataDir).trim()) {
    const dir = String(s.dataDir).trim();
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "balaban-note.db");
  }
  return path.join(app.getPath("userData"), "balaban-note.db");
}

async function chooseDataFolder() {
  const current = loadAppSettings().dataDir || app.getPath("documents");
  const result = await dialog.showOpenDialog({
    title: "Notların kaydedileceği klasör",
    defaultPath: current,
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || !result.filePaths[0]) {
    return { canceled: true };
  }
  const dataDir = result.filePaths[0];
  fs.mkdirSync(dataDir, { recursive: true });
  saveAppSettings({ dataDir });

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("data-folder-changed", {
      dataDir,
      dbPath: path.join(dataDir, "balaban-note.db"),
    });
  }

  if (!isDev) {
    const answer = await dialog.showMessageBox({
      type: "question",
      title: "Kayıt klasörü",
      message: `Klasör ayarlandı:\n${dataDir}`,
      detail:
        "Notlar bu klasördeki balaban-note.db dosyasına yazılır.\nDeğişikliğin tam uygulanması için uygulama yeniden başlatılsın mı?",
      buttons: ["Yeniden başlat", "Sonra"],
      defaultId: 0,
      cancelId: 1,
    });
    if (answer.response === 0) {
      stopServer();
      app.relaunch();
      app.exit(0);
    }
  } else {
    await dialog.showMessageBox({
      type: "info",
      title: "Kayıt klasörü",
      message: `Klasör ayarlandı:\n${dataDir}`,
      detail: "Notlar balaban-note.db olarak bu klasöre kaydedilir.",
    });
  }

  return {
    canceled: false,
    dataDir,
    dbPath: path.join(dataDir, "balaban-note.db"),
  };
}

function setupDataFolderIpc() {
  ipcMain.handle("get-data-folder", async () => {
    const s = loadAppSettings();
    const dbPath = resolveSqlitePathFromSettings();
    return {
      dataDir: s.dataDir || path.dirname(dbPath),
      dbPath,
    };
  });

  ipcMain.handle("select-data-folder", async () => chooseDataFolder());
}

function setupAutoUpdater() {
  if (isDev) return;

  let autoUpdater;
  try {
    ({ autoUpdater } = require("electron-updater"));
  } catch (err) {
    log("electron-updater yok:", String(err));
    return;
  }

  const updateUrl =
    process.env.UPDATE_SERVER_URL || process.env.ELECTRON_UPDATE_URL || "";

  let publishUrl = updateUrl;
  if (!publishUrl) {
    try {
      const pkgPath = path.join(
        isDev ? path.join(__dirname, "..") : app.getAppPath(),
        "package.json",
      );
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      publishUrl = pkg?.build?.publish?.[0]?.url || "";
    } catch {
      publishUrl = "";
    }
  }

  if (!publishUrl || /example\.com/i.test(publishUrl)) {
    log("auto-updater kapalı (geçerli publish URL yok)");
    return;
  }

  if (updateUrl) {
    autoUpdater.setFeedURL({
      provider: "generic",
      url: updateUrl.replace(/\/?$/, "/"),
    });
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("error", (err) => {
    log("update error:", err?.message || String(err));
  });

  autoUpdater.on("update-downloaded", async (info) => {
    const result = await dialog.showMessageBox({
      type: "info",
      title: "Güncelleme hazır",
      message: `Balaban Note ${info.version} indirildi.`,
      detail: "Yeniden başlatınca yeni sürüm kurulur.",
      buttons: ["Şimdi yeniden başlat", "Sonra"],
      defaultId: 0,
      cancelId: 1,
    });
    if (result.response === 0) {
      stopServer();
      autoUpdater.quitAndInstall(false, true);
    }
  });

  updaterReady = true;
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log("update check skipped:", err?.message || err);
    });
  }, 5000);

  ipcMain.handle("check-for-updates", async () => {
    if (!updaterReady) return { ok: false, reason: "updater-yok" };
    try {
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, version: result?.updateInfo?.version ?? null };
    } catch (err) {
      return {
        ok: false,
        reason: err instanceof Error ? err.message : "hata",
      };
    }
  });
}

function sendAppCommand(cmd) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("app-command", cmd);
  }
}

function buildMenu() {
  const template = [
    {
      label: "Balaban Note",
      submenu: [
        { role: "about", label: "Hakkında" },
        {
          label: "Kayıt klasörünü seç…",
          click: () => {
            void chooseDataFolder();
          },
        },
        {
          label: "Güncellemeleri kontrol et",
          click: async () => {
            if (isDev) {
              reloadAppWindow();
              return;
            }
            try {
              const { autoUpdater } = require("electron-updater");
              await autoUpdater.checkForUpdates();
              dialog.showMessageBox({
                type: "info",
                message: "Güncelleme kontrolü",
                detail: "Kontrol tamamlandı. Varsa indirme başlar.",
              });
            } catch (err) {
              dialog.showMessageBox({
                type: "warning",
                message: "Güncelleme kontrol edilemedi",
                detail: err instanceof Error ? err.message : String(err),
              });
            }
          },
        },
        {
          label: "Log dosyasını aç",
          click: () => {
            if (logPath && fs.existsSync(logPath)) shell.showItemInFolder(logPath);
            else {
              dialog.showMessageBox({
                type: "info",
                message: "Log yok",
                detail: logPath || "Log yolu oluşturulamadı",
              });
            }
          },
        },
        { type: "separator" },
        {
          label: "Pencereyi yenile",
          accelerator: "CmdOrCtrl+R",
          click: () => reloadAppWindow(),
        },
        { role: "toggleDevTools", label: "Geliştirici araçları" },
        { type: "separator" },
        { role: "quit", label: "Çıkış" },
      ],
    },
    {
      label: "Düzenle",
      submenu: [
        {
          label: "Geri al",
          accelerator: "CmdOrCtrl+Z",
          click: () => sendAppCommand("undo"),
        },
        {
          label: "Yinele",
          accelerator: "CmdOrCtrl+Shift+Z",
          click: () => sendAppCommand("redo"),
        },
        {
          label: "Yinele",
          accelerator: "CmdOrCtrl+Y",
          click: () => sendAppCommand("redo"),
          visible: false,
        },
        { type: "separator" },
        { role: "cut", label: "Kes" },
        { role: "copy", label: "Kopyala" },
        { role: "paste", label: "Yapıştır" },
        { role: "selectAll", label: "Tümünü seç" },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "togglefullscreen", label: "Tam ekran" },
        {
          label: "Yakınlaştır",
          accelerator: "CmdOrCtrl+=",
          click: () => sendAppCommand("zoom-in"),
        },
        {
          label: "Uzaklaştır",
          accelerator: "CmdOrCtrl+-",
          click: () => sendAppCommand("zoom-out"),
        },
        {
          label: "Varsayılan zoom",
          accelerator: "CmdOrCtrl+0",
          click: () => sendAppCommand("zoom-reset"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function stopServer() {
  if (nextProc && !nextProc.killed) {
    try {
      nextProc.kill();
    } catch {
      /* ignore */
    }
    nextProc = null;
  }
}

function watchDevSources() {
  if (!isDev) return;
  let chokidar;
  try {
    chokidar = require("chokidar");
  } catch {
    return;
  }
  const root = path.join(__dirname, "..");
  chokidar
    .watch([path.join(root, "src"), path.join(root, "public")], {
      ignoreInitial: true,
      ignored: /node_modules|\.next/,
    })
    .on("all", () => {
      /* Next HMR handles UI */
    });
}

async function showFatal(err) {
  const message = err instanceof Error ? err.message : String(err);
  log("FATAL:", message);
  await dialog.showMessageBox({
    type: "error",
    title: "Balaban Note başlatılamadı",
    message: "Uygulama açılamadı",
    detail: `${message}\n\nLog: ${logPath || "-"}\nDB: SQLite (XAMPP gerekmez)`,
  });
}

app.whenReady().then(async () => {
  initLog();
  try {
    loadEnvFile(path.join(__dirname, "..", ".env.local"));
    // Dev'de de seçilen klasörü Next'e aktar
    if (isDev) {
      process.env.SETTINGS_PATH = settingsPath();
      process.env.SQLITE_PATH = resolveSqlitePathFromSettings();
      process.env.DB_DRIVER = process.env.DB_DRIVER || "sqlite";
    }

    // Kamera / mikrofon / ekran yakalama / yerel fontlar
    try {
      const { session } = require("electron");
      const allow = new Set([
        "media",
        "display-capture",
        "local-fonts",
        "clipboard-sanitized-write",
      ]);
      session.defaultSession.setPermissionRequestHandler(
        (_wc, permission, callback) => {
          callback(allow.has(permission));
        },
      );
      session.defaultSession.setPermissionCheckHandler(
        (_wc, permission) => allow.has(permission),
      );
      // Ekran paylaşımı (screenshot) — Electron 37+
      if (typeof session.defaultSession.setDisplayMediaRequestHandler === "function") {
        session.defaultSession.setDisplayMediaRequestHandler(
          async (_wc, callback) => {
            try {
              const { desktopCapturer } = require("electron");
              const sources = await desktopCapturer.getSources({
                types: ["screen", "window"],
                thumbnailSize: { width: 0, height: 0 },
              });
              const primary = sources[0];
              if (!primary) {
                callback({});
                return;
              }
              callback({ video: primary });
            } catch {
              callback({});
            }
          },
        );
      }
    } catch {
      /* ignore */
    }

    buildMenu();
    setupDataFolderIpc();
    setupAutoUpdater();
    if (isDev) {
      await waitForServer(APP_URL);
      watchDevSources();
    } else {
      await startNextServer();
    }
    createWindow();
  } catch (err) {
    await showFatal(err);
    stopServer();
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", stopServer);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
