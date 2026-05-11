"use client";

const tabs = [
  { id: "home", icon: "🏠", label: "首頁" },
  { id: "generate", icon: "✨", label: "生成" },
  { id: "leaderboard", icon: "🏆", label: "排行" },
  { id: "library", icon: "📚", label: "內容庫" },
];

export function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex safe-bottom">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center py-2 gap-1 transition-colors ${activeTab === tab.id ? "text-purple-400" : "text-gray-500"}`}>
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
