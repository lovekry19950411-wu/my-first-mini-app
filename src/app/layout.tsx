import ClientProviders from '@/providers';
import { auth } from '@/auth';
import './globals.css';

export const metadata = {
  title: 'NXZ · World 迷你應用',
  description: 'World ID、MiniKit 錢包登入與支付範例',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="zh-TW">
      <body>
        <ClientProviders session={session}>{children}</ClientProviders>
      </body>
    </html>
  );
}
