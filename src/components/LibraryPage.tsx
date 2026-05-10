"use client";
import { useEffect, useState } from "react";

interface ContentItem {
  id: string;
  platform: string;
  contentType: string;
  topic: string;
  content: string;
  createdAt: string;
}

interface LibraryPageProps {
  session: any;
}

export function LibraryPage({ session }: LibraryPageProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/library")
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">📚 我的內容庫</h2>

      {loading ? (
        <div className="text-center text-gray-500 py-10">載入中...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-10">還沒有生成過內容，去試試看！</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="bg-purple-900 text-purple-300 text-xs px-2 py-0.5 rounded-full">{item.platform}</span>
                  <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">{item.contentType}</span>
                </div>
                <span className="text-gray-600 text-xs">{new Date(item.createdAt).toLocaleDateString("zh-TW")}</span>
              </div>
              <p className="text-gray-400 text-xs">主題：{item.topic}</p>
              <p className="text-white text-sm leading-relaxed line-clamp-3">{item.content}</p>
              <button onClick={() => handleCopy(item.id, item.content)}
                className="w-full bg-gray-800 text-white py-2 rounded-xl text-sm">
                {copied === item.id ? "✅ 已複製" : "📋 複製"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
