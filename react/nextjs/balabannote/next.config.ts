import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Electron paketleme için bağımsız Node sunucusu
  output: "standalone",
  serverExternalPackages: ["sql.js"],
};

export default nextConfig;
