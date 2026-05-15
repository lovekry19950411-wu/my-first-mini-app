import ClientProviders from '@/providers';
import '@worldcoin/mini-apps-ui-kit-react/styles.css';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Content Factory - One Click Web2 to Web3 Content',
  description: 'One Click Web2 to Web3 Content',
  other: {
    'base:app_id': '69f7fae163622bf8ce968643',
    'talentapp:project_verification': 'PASTE_VERIFICATION_CODE_HERE',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
