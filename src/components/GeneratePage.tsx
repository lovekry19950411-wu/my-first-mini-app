"use client";
import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

const PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "LinkedIn", "YouTube"];
const CONTENT_TYPES = ["爆款文案", "產品介紹", "個人品牌", "教育內容", "病毒標題"];

interface GeneratePageProps {
  session: any;
}

export function GeneratePage({ session }: GeneratePageProps) {
  const [platform, setPlatform] = useState("Instagram");
  const [contentType, setContentType] = useState("爆款文案");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, contentType, topic }),
      });
      const data = await res.json();
      setResult(data.content ?? "生成失敗，請重試");
    } catch (e) {
      setResult("網路錯誤，請重試");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // 記錄積分
    await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy", content: result }),
    });
  }

  async function handleShare() {
    if (!result) return;
    try {
      if (MiniKit.isInstalled()) {
        await MiniKit.commandsAsync.sendHapticFeedback({ hapticsType: "success" });
      }
      await navigator.share?.({ text: result + "\n\n🤖 用 AI 內容工廠生成" });
    } catch (e) {}
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share", content: result }),
    });
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white font-bold text-lg">✨ AI 內容生成</h2>

      <div>
        <p className="text-gray-400 text-xs mb-2">選擇平台</p>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded-full text-sm ${platform === p ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-2">內容類型</p>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map(c => (
            <button key={c} onClick={() => setContentType(c)}
              className={`px-3 py-1 rounded-full text-sm ${contentType === c ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-2">主題或關鍵字</p>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="例如：如何用AI每月多賺1萬"
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="w-full bg-purple-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base"
      >
        {loading ? "🤖 AI 生成中..." : "🚀 一鍵生成（+10積分）"}
      </button>

      {result && (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-gray-400 text-xs">生成結果</p>
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
          <div className="flex gap-2">
            <button onClick={handleCopy}
              className="flex-1 bg-gray-800 text-white py-3 rounded-xl text-sm font-medium">
              {copied ? "✅ 已複製" : "📋 複製"}
            </button>
            <button onClick={handleShare}
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-medium">
              {shared ? "✅ 已分享" : "🔗 分享（+5積分）"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
