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
        action: "login-verify",
        signal: "user_" + Math.random().toString(36).substring(7),
        verification_level: "Orb",
      });

      if (finalPayload.status === "success") {
        setWalletAddress(MiniKit.user?.walletAddress ?? "0x...");
        setIsVerified(true);
      }
    } catch (e) {
      console.error(e);
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
          <p className="text-gray-400 text-sm">只有 World ID 真人可進入</p>
        </div>
        {authPending ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">正在等待虹膜掃描結果...</p>
          </div>
        ) : (
          <button onClick={doVerify}
            className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl text-base w-full max-w-xs">
            透過 World ID 真人驗證
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-[100dvh] bg-black overflow-hidden">
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
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-xs">真人身分已確認</p>
          <p className="text-white font-bold">{MiniKit.user?.username ?? short}</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 font-bold text-xl">⭐ 0</p>
          <p className="text-gray-400 text-xs">積分</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "✨", title: "今日生成", sub: "+10 積分/次", color: "text-purple-400" },
          { icon: "🏆", title: "週榜獎勵", sub: "WLD 獎勵", color: "text-yellow-400" },
        ].map(item => (
          <div key={item.title} className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-white text-sm font-medium">{item.title}</p>
            <p className={`${item.color} text-xs mt-1`}>{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
