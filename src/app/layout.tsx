// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WorldAppProvider } from "@/providers/WorldAppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fortune Loop | 每日籤詩",
  description: "基於 World ID 真人驗證的純鏈上每日籤詩應用",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}>
        <WorldAppProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </WorldAppProvider>
      </body>
    </html>
  );
}
