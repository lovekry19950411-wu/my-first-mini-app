"use client";
import { useEffect, useState } from "react";

export function LibraryPage({ walletAddress }: { walletAddress: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/library?wallet=${walletAddress}`).then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [walletAddress]);

  async function copy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-xl">📚 我的內容庫</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400">還沒有生成過內容，快去試試！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-2xl p-4 space-y-2">
              <div className="flex gap-2">
                <span className="bg-purple-900 text-purple-300 text-xs px-2 py-0.5 rounded-full">{item.platform}</span>
                <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">{item.content_type}</span>
              </div>
              <p className="text-white text-sm leading-relaxed line-clamp-4">{item.content}</p>
              <button onClick={() => copy(item.id, item.content)}
                className="w-full bg-gray-800 text-white py-2.5 rounded-xl text-sm font-medium">
                {copied === item.id ? "✅ 已複製" : "📋 複製"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
