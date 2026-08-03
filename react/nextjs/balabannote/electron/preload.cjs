const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("balabanDesktop", {
  isElectron: true,
  platform: process.platform,
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  getDataFolder: () => ipcRenderer.invoke("get-data-folder"),
  selectDataFolder: () => ipcRenderer.invoke("select-data-folder"),
  onUpdateStatus: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("update-status", handler);
    return () => ipcRenderer.removeListener("update-status", handler);
  },
  onDataFolderChanged: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("data-folder-changed", handler);
    return () => ipcRenderer.removeListener("data-folder-changed", handler);
  },
  onAppCommand: (callback) => {
    const handler = (_event, cmd) => callback(cmd);
    ipcRenderer.on("app-command", handler);
    return () => ipcRenderer.removeListener("app-command", handler);
  },
});
