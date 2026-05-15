"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { TabBar } from "@/components/TabBar";
import { GeneratePage } from "@/components/GeneratePage";
import { LeaderboardPage } from "@/components/LeaderboardPage";
import { LibraryPage } from "@/components/LibraryPage";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const { isInstalled } = useMiniKit();
  const [isVerified, setIsVerified] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const attempted = useRef(false);

  const doVerify = useCallback(async () => {
    if (authPending || attempted.current) return;
    attempted.current = true;
    setAuthPending(true);

    try {
      const { finalPayload } = await MiniKit.commands.verify({
        action: "daily-fortune-draw",
        signal: "user_session",
        verification_level: "orb", 
      });

      if (finalPayload.status === "success") {
        setWalletAddress(MiniKit.user?.walletAddress ?? "0x...");
        setIsVerified(true);
      }
    } catch (e) {
      console.error("驗證失敗:", e);
    } finally {
      setAuthPending(false);
    }
  }, [authPending]);

  useEffect(() => {
    if (isInstalled) doVerify();
  }, [isInstalled, doVerify]);

  if (!isVerified) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[100dvh] bg-black p-6 gap-8">
        <div className="text-center space-y-3">
          <div className="text-6xl">🤖</div>
          <h1 className="text-2xl font-bold text-white">AI 內容工廠</h1>
          <p className="text-gray-400 text-sm">請完成 World ID 真人驗證</p>
        </div>
        <button onClick={doVerify} disabled={authPending}
          className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl text-base w-full max-w-xs transition-opacity active:opacity-70">
          {authPending ? "正在開啟 World App..." : "點擊開始真人驗證"}
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-[100dvh] bg-black overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === "home" && <HomePage walletAddress={walletAddress!} />}
        {activeTab === "generate" && <GeneratePage walletAddress={walletAddress!} />}
        {activeTab === "leaderboard" && <LeaderboardPage />}
        {activeTab === "library" && <LibraryPage walletAddress={walletAddress!} />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}

function HomePage({ walletAddress }: { walletAddress: string }) {
  const short = walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-5 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-xs font-semibold tracking-wider uppercase">Verified Citizen</p>
            <p className="text-white font-bold text-lg leading-tight">{MiniKit.user?.username ?? short}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-2 text-center min-w-[70px] border border-white/10">
            <p className="text-yellow-400 font-black text-xl">⭐ 0</p>
            <p className="text-gray-400 text-[10px] uppercase">Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
