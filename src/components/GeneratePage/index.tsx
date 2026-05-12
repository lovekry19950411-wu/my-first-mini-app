"use client";
import { useState } from "react";

const PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "LinkedIn", "YouTube"];
const TYPES = ["爆款文案", "產品介紹", "個人品牌", "教育內容", "病毒標題"];

export function GeneratePage({ walletAddress }: { walletAddress: string }) {
  const [platform, setPlatform] = useState("Instagram");
  const [type, setType] = useState("爆款文案");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, contentType: type, topic, walletAddress }),
      });
      const data = await res.json();
      setResult(data.content ?? data.error ?? "生成失敗，請重試");
    } catch { setResult("網路錯誤，請重試"); }
    finally { setLoading(false); }
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-xl">✨ AI 內容生成</h2>
      <div>
        <p className="text-gray-400 text-xs mb-2">選擇平台</p>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${platform === p ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-2">內容類型</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${type === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>{t}</button>
          ))}
        </div>
      </div>
      <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3}
        placeholder="輸入主題或關鍵字，例如：如何用AI每月多賺1萬"
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500 resize-none" />
      <button onClick={generate} disabled={loading || !topic.trim()}
        className="w-full bg-purple-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-lg transition-opacity">
        {loading ? "🤖 AI 生成中..." : "🚀 一鍵生成（+10積分）"}
      </button>
      {result && (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-gray-400 text-xs">✨ 生成結果</p>
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 bg-gray-800 text-white py-3 rounded-xl text-sm font-medium">
              {copied ? "✅ 已複製" : "📋 複製"}
            </button>
            <button onClick={() => navigator.share?.({ text: result })}
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-medium">
              🔗 分享（+5積分）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
