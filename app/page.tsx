"use client";
import { useState, useEffect } from "react";
import { MiniKit, PayCommandInput } from "@worldcoin/minikit-js";
import { NXZ_CONFIG } from "@/consts/config";
import dynamic from 'next/dynamic';

// 最終手段：手動檢查所有可能的導出路徑，防止 undefined
const IDKitWidget = dynamic(
  () => import('@worldcoin/idkit').then((mod) => {
    // 依序檢查：具名導出 -> 預設導出裡的具名導出 -> 預設導出
    if (mod.IDKitWidget) return mod.IDKitWidget;
    if (mod.default && (mod.default as any).IDKitWidget) return (mod.default as any).IDKitWidget;
    if (mod.default) return mod.default;
    // 如果都抓不到，返回一個錯誤提示組件
    return () => <div className="text-red-500 font-bold p-4 border border-red-500">無法加載 IDKit 組件，請檢查套件安裝。</div>;
  }),
  { 
    ssr: false, 
    loading: () => <div className="text-yellow-500 font-bold animate-pulse p-4">NXZ 驗證模組啟動中...</div> 
  }
);

// 手動定義 tokenToDecimals (1 WLD = 10^18)
const toDecimals = (amount: number, decimals: number = 18) => {
  return (BigInt(amount) * BigInt(10) ** BigInt(decimals)).toString();
};

export default function NXZCenter() {
  const [isVerified, setIsVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      MiniKit.install();
    }
  }, []);

  const handleVerifySuccess = (result: any) => {
    console.log("驗證成功:", result);
    setIsVerified(true);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-black text-blue-500 tracking-tighter uppercase italic">
          NXZ <span className="text-white">Command Center</span>
        </h1>
        
        {!isVerified ? (
          <div className="flex flex-col items-center gap-6 p-8 border border-gray-800 rounded-3xl bg-zinc-900/30">
            <p className="text-gray-400">請完成 World ID 真人驗證以開啟系統權限</p>
            <IDKitWidget
              app_id={NXZ_CONFIG.WLD_APP_ID as `app_${string}`}
              action={NXZ_CONFIG.WLD_ACTION}
              onSuccess={handleVerifySuccess}
              verification_level={"orb" as any}
            >
              {({ open }) => (
                <button 
                  onClick={open}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  啟動真人身份驗證
                </button>
              )}
            </IDKitWidget>
          </div>
        ) : (
          <div className="p-10 border-2 border-green-500 rounded-[2.5rem] bg-green-500/10 animate-in zoom-in duration-500">
            <h2 className="text-2xl text-green-500 font-black mb-2">身分驗證已通過</h2>
            <p className="text-gray-300">資產管理與精英功能已解鎖</p>
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 text-[10px] text-zinc-700 tracking-[0.2em] uppercase">
        Next-Gen Protocol // 2026 NXZ Center
      </footer>
    </main>
  );
}