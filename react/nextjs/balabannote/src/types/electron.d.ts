/// <reference types="react" />

type BalabanUpdateStatus =
  | { type: "available"; version: string }
  | { type: "progress"; percent: number }
  | { type: "downloaded"; version: string }
  | { type: "dev-change"; file: string };

type BalabanDataFolder = {
  dataDir: string;
  dbPath: string;
};

interface BalabanDesktop {
  isElectron: true;
  platform: NodeJS.Platform;
  checkForUpdates: () => Promise<{
    ok: boolean;
    version?: string | null;
    reason?: string;
  }>;
  getDataFolder: () => Promise<BalabanDataFolder>;
  selectDataFolder: () => Promise<
    | { canceled: true }
    | { canceled: false; dataDir: string; dbPath: string }
  >;
  onUpdateStatus: (
    callback: (status: BalabanUpdateStatus) => void,
  ) => () => void;
  onDataFolderChanged: (
    callback: (payload: BalabanDataFolder) => void,
  ) => () => void;
}

interface Window {
  balabanDesktop?: BalabanDesktop;
}
