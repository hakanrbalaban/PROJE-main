import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next App Layout",
  description: "Navbar and Sidebar with TSX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="relative min-h-screen">
          <Navbar />
          <div className="flex">
            <Sidebar />
            {/* İçerik Sidebar genişliği (64) ve Navbar yüksekliği (16) kadar ötelenir */}
            <main className="flex-1 ml-64 mt-16 p-6 min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}