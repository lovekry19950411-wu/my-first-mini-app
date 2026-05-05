'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { SessionProvider } from 'next-auth/react';
import { useEffect, type ReactNode } from 'react';

export default function ClientProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  useEffect(() => {
    // 這裡就是你強調的初始化 (Init)
    // 官方 MiniKit 只需要這一行來啟動與 World App 的連結
    if (typeof window !== 'undefined') {
      MiniKit.install();
      console.log("MiniKit 已經針對 Mindsync 完成初始化");
    }
  }, []);

  return (
    <MiniKitProvider>
      <SessionProvider session={session}>{children}</SessionProvider>
    </MiniKitProvider>
  );
}