"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";

const PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "LinkedIn", "YouTube"];
const TYPES = ["爆款文案", "產品介紹", "個人品牌", "教育內容", "病毒標題"];

export function GeneratePage() {
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
        body: JSON.stringify({ platform, contentType: type, topic,
          walletAddress: MiniKit.user?.walletAddress ?? "anonymous" }),
      });
      const data = await res.json();
      setResult(data.content ?? "生成失敗，請重試");
    } catch { setResult("網路錯誤，請重試"); }
    finally { setLoading(false); }
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    try {
      if (MiniKit.isInstalled()) {
        // @ts-ignore
        await MiniKit.commandsAsync?.sendHapticFeedback?.({ hapticsType: "success" });
      }
      await navigator.share?.({ text: result + "\n\n🤖 AI 內容工廠生成" });
    } catch {}
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">✨ AI 內容生成</h2>
      <div>
        <p className="text-gray-400 text-xs mb-2">平台</p>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded-full text-sm ${platform === p ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>{p}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-2">類型</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1 rounded-full text-sm ${type === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>{t}</button>
          ))}
        </div>
      </div>
      <input value={topic} onChange={e => setTopic(e.target.value)}
        placeholder="主題或關鍵字，例如：如何用AI每月多賺1萬"
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500" />
      <button onClick={generate} disabled={loading || !topic.trim()}
        className="w-full bg-purple-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base">
        {loading ? "🤖 AI 生成中..." : "🚀 一鍵生成（+10積分）"}
      </button>
      {result && (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-gray-400 text-xs">生成結果</p>
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 bg-gray-800 text-white py-3 rounded-xl text-sm">
              {copied ? "✅ 已複製" : "📋 複製"}
            </button>
            <button onClick={share} className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm">
              🔗 分享（+5積分）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
