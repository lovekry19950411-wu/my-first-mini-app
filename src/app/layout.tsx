import { auth } from '@/auth';
import ClientProviders from '@/providers';
import { WorldAppProvider } from '@/providers/WorldAppProviders'; // 👈 1. 導入我們剛建好的 Provider
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css'; 

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'World Fortune MVP',
  description: 'AI Fortune Telling with World ID',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 👈 2. 用 WorldAppProvider 包裹住所有內容 */}
        <WorldAppProvider>
          <ClientProviders session={session}>
            {children}
          </ClientProviders>
        </WorldAppProvider>
      </body>
    </html>
  );
}