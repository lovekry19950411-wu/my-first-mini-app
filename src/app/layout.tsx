import { auth } from '@/auth';
import ClientProviders from '@/providers';
import '@worldcoin/mini-apps-ui-kit-react/styles.css';
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
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientProviders session={session}>{children}</ClientProviders>
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
