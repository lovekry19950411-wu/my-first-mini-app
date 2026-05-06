import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NXZ Center",
  description: "Next-Gen Human Verification Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}