import { auth } from '@/auth';
import ClientProviders from '@/providers';
// 1. 修正路徑：確保 UI Kit 的 CSS 被正確引用
import '@worldcoin/mini-apps-ui-kit-react/index.css'; 
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
// 2. 修正路徑：確保引用的是同目錄下的 globals.css
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
  title: '每日籤詩 Daily Fortune',
  description: '每天一籤，洞見人生。World ID 驗證的每日運勢 Mini App。',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="zh-TW" style={{ backgroundColor: '#000' }}>
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`} 
        style={{ 
          backgroundColor: '#000', 
          color: '#fff', 
          margin: 0, 
          padding: 0,
          minHeight: '100vh' 
        }}
      >
        <main style={{ minHeight: '100vh', width: '100%', backgroundColor: '#000' }}>
          <ClientProviders session={session}>{children}</ClientProviders>
        </main>

        <Script src="https://oculus-sdk.humanlabs.world" crossOrigin="anonymous" strategy="afterInteractive" />
        <Script id="oculus-init" strategy="afterInteractive">{`
          window.oculus = window.oculus || [];
          function oculus(){ oculus.push(arguments); }
          oculus("application_id", "app_77be985c81f495f12e3d35184c751a90");
        `}</Script>
      </body>
    </html>
  );
}