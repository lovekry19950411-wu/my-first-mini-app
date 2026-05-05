"use client";
import { useState, useEffect } from "react";
import { MiniKit, tokenToDecimals, PayCommandInput } from "@worldcoin/minikit-js";
import { NXZ_CONFIG } from "@/consts/config";
import dynamic from 'next/dynamic';

// 徹底解決 SSR 衝突，並強制禁用 Hydration Warning
const IDKitWidget = dynamic(
  () => import('@worldcoin/idkit').then((mod) => mod.IDKitWidget),
  { ssr: false }
);

export default function NXZLaunchpad() {
  const [mounted, setMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => { 
    setMounted(true);
    // 初始化 MiniKit 確保指令可用
    if (typeof window !== "undefined") {
      MiniKit.install();
    }
  }, []);

  const handleVerify = async (result: any) => {
    console.log("World ID 驗證成功", result);
    setIsVerified(true);
  };

  const handlePremiumPayment = async () => {
    if (!MiniKit.isInstalled()) {
      return alert("請在 World App 內運行以啟動精英方案");
    }

    setStatus("loading");
    
    try {
      const payPayload: PayCommandInput = {
        reference: `NXZ_ELITE_${Date.now()}`,
        to: NXZ_CONFIG.TREASURY_ADDRESS, // 指向 imToken 冷錢包: 0x4430...8151
        tokens: [{ 
          symbol: "WLD", 
          amount: tokenToDecimals(5, "WLD").toString() 
        }],
        description: "NXZ 先鋒精英蛋選拔規費",
      };

      const response = await MiniKit.commandsAsync.pay(payPayload);
      
      if (response.finalPayload.status === "success") {
        setStatus("success");
        alert("恭喜！精英模式已啟動，您的身分已錄入 NXZ 人才池。");
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error("支付失敗", e);
      setStatus("error");
    } finally {
      if (status !== "success") setStatus("idle");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans antialiased">
      {/* 核心 UI */}
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-yellow-500 tracking-tighter uppercase italic">
            NXZ <span className="text-white">Center</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">指揮中心 · 真人精英選拔</p>
        </div>

        {!isVerified ? (
          <div className="py-10 border border-gray-800 rounded-3xl bg-zinc-900/50 backdrop-blur-xl">
             <IDKitWidget
              app_id={NXZ_CONFIG.APP_ID as `app_${string}`}
              action={NXZ_CONFIG.ACTION}
              onSuccess={handleVerify}
              verification_level={"orb" as any}
            >
              {({ open }) => (
                <button 
                  onClick={open} 
                  className="bg-white text-black hover:bg-yellow-500 px-10 py-4 rounded-full font-bold text-lg transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  透過 World ID 證明真人身份
                </button>
              )}
            </IDKitWidget>
            <p className="mt-4 text-xs text-gray-500">驗證後即可解鎖精英孵化方案</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="p-8 border-2 border-yellow-600 rounded-[2.5rem] bg-gradient-to-b from-yellow-600/10 to-transparent shadow-[0_0_50px_rgba(202,138,4,0.3)]">
              <h2 className="text-2xl text-yellow-500 font-black mb-2">真人權限已鎖定</h2>
              <p className="text-gray-400 text-sm mb-8">您已具備參與 NXZ 生態建設的資格</p>
              
              <button 
                onClick={handlePremiumPayment} 
                disabled={status === "loading"}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 px-8 py-6 rounded-2xl text-black font-black text-xl transition-all shadow-xl"
              >
                {status === "loading" ? "正在連結財庫..." : "支付 5 WLD 啟動精英蛋"}
              </button>
              
              <div className="mt-6 pt-6 border-t border-yellow-900/30">
                <p className="text-[10px] text-gray-500 break-all opacity-50">
                  財庫收款地址: {NXZ_CONFIG.TREASURY_ADDRESS}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部裝飾 */}
      <footer className="absolute bottom-8 text-[10px] text-zinc-700 tracking-[0.2em] uppercase">
        Next-Gen Human Verification Protocol // 2026 NXZ
      </footer>
    </main>
  );
}