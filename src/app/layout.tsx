import ClientProviders from '@/providers';
import { auth } from '@/auth';
import './globals.css';

export const metadata = {
  title: 'NXZ Asset Command Center',
  description: 'World ID · MiniKit · NXZ',
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
