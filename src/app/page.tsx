"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { AuthButton } from "@/components/AuthButton";
import { TabBar } from "@/components/TabBar";
import { GeneratePage } from "@/components/GeneratePage";
import { LeaderboardPage } from "@/components/LeaderboardPage";
import { LibraryPage } from "@/components/LibraryPage";
import { useState } from "react";

export default function Home() {
  const { isInstalled } = useMiniKit();
  const [activeTab, setActiveTab] = useState("home");
  const [authed, setAuthed] = useState(false);

  // 在 World App 內自動視為已登入，在瀏覽器顯示登入按鈕
  const isLoggedIn = authed || (isInstalled && !!MiniKit.user?.walletAddress);

  if (!isLoggedIn) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[100dvh] bg-black p-6 gap-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">🤖</div>
          <h1 className="text-2xl font-bold text-white">AI 內容工廠</h1>
          <p className="text-gray-400 text-sm">一鍵生成爆款文案・積分・排行</p>
        </div>
        <AuthButton onSuccess={() => setAuthed(true)} />
        <p className="text-xs text-gray-600">需要 World ID 真人驗證才能使用</p>
      </main>
    );
  }

  const user = MiniKit.user;

  return (
    <main className="flex flex-col min-h-[100dvh] bg-black overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === "home" && <HomePage user={user} />}
        {activeTab === "generate" && <GeneratePage />}
        {activeTab === "leaderboard" && <LeaderboardPage />}
        {activeTab === "library" && <LibraryPage />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}

function HomePage({ user }: { user: any }) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-xs">歡迎回來</p>
          <p className="text-white font-bold text-lg">{user?.username ?? "創作者"}</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 font-bold text-xl">⭐ 0</p>
          <p className="text-gray-400 text-xs">積分</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "✨", title: "今日生成", sub: "+10 積分/次", color: "text-purple-400" },
          { icon: "🔗", title: "分享賺積分", sub: "+5 積分/次", color: "text-blue-400" },
          { icon: "🏆", title: "週榜前三", sub: "WLD 獎勵", color: "text-yellow-400" },
          { icon: "📚", title: "內容庫", sub: "歷史記錄", color: "text-green-400" },
        ].map(item => (
          <div key={item.title} className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-white text-sm font-medium">{item.title}</p>
            <p className={`${item.color} text-xs mt-1`}>{item.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-2">🔥 今日熱點主題</p>
        <div className="flex flex-wrap gap-2">
          {["AI賺錢術", "Web3入門", "創業心法", "投資理財", "健康生活"].map(tag => (
            <span key={tag} className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
