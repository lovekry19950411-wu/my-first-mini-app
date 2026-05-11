"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

export function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const addr = MiniKit.user?.walletAddress ?? "";
    fetch(`/api/library?wallet=${addr}`).then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function copy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">📚 我的內容庫</h2>
      {loading ? <p className="text-center text-gray-500 py-10">載入中...</p>
        : items.length === 0 ? <p className="text-center text-gray-500 py-10">還沒有生成過內容！</p>
        : <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-2xl p-4 space-y-2">
              <div className="flex gap-2">
                <span className="bg-purple-900 text-purple-300 text-xs px-2 py-0.5 rounded-full">{item.platform}</span>
                <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">{item.content_type}</span>
              </div>
              <p className="text-white text-sm leading-relaxed line-clamp-3">{item.content}</p>
              <button onClick={() => copy(item.id, item.content)}
                className="w-full bg-gray-800 text-white py-2 rounded-xl text-sm">
                {copied === item.id ? "✅ 已複製" : "📋 複製"}
              </button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
