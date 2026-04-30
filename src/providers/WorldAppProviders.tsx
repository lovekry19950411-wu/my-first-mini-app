'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

// 🏆 GRANT OPTIMIZATION: 嚴格環境隔離與 SSR 安全設計
// 確保在 Vercel/Next.js 服務器端渲染時不崩潰，並在客戶端精準注入 World App 錢包
interface WorldAppContextType {
  isInitialized: boolean;
  isWorldApp: boolean;
  walletAddress: string | null;
  isConnected: boolean;
  initError: string | null;
  connect: () => Promise<void>;
}

const WorldAppContext = createContext<WorldAppContextType | undefined>(undefined);

export function WorldAppProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // 🛡️ SSR 安全閥門：防止 window 未定義導致構建失敗
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isInWorldApp = userAgent.includes('worldapp');
    setIsWorldApp(isInWorldApp);

    try {
      // 🔑 初始化 MiniKit SDK
      const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID || 'your_world_app_id_here';
      MiniKit.install(appId);

      // 監聽錢包狀態變化
      const handleWalletChange = (address: string | null) => {
        setWalletAddress(address);
        setIsConnected(!!address);
      };
      MiniKit.subscribe('walletChanged', handleWalletChange);

      // 檢查是否已有緩存會話
      if (MiniKit.walletAddress) {
        setWalletAddress(MiniKit.walletAddress);
        setIsConnected(true);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('[MiniKit Init Failed]:', err);
      setInitError('World App SDK 初始化失敗，請檢查網路環境');
    }

    return () => MiniKit.unsubscribe('walletChanged');
  }, []);

  const connect = useCallback(async () => {
    if (!MiniKit.isInstalled()) throw new Error('MiniKit 未安裝');
    await MiniKit.connect();
  }, []);

  return (
    <WorldAppContext.Provider value={{ isInitialized, isWorldApp, walletAddress, isConnected, initError, connect }}>
      {children}
    </WorldAppContext.Provider>
  );
}

export const useWorldApp = () => {
  const ctx = useContext(WorldAppContext);
  if (!ctx) throw new Error('useWorldApp 必須在 WorldAppProvider 內使用');
  return ctx;
};
