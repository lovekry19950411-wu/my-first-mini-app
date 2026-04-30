'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle, ChevronRight, CheckCircle2, Sparkles, Info } from 'lucide-react';
// 🛠️ 新增導入：用於與 World App 交互
import { MiniKit } from '@worldcoin/minikit-js';
import { payForFortune } from '@/lib/wallet';

// 🎯 狀態機定義：嚴格對應 World App 生命週期
type AppState = 
  | 'verifying' 
  | 'unverified' 
  | 'verified_pending_payment' 
  | 'payment_processing' 
  | 'payment_failed' 
  | 'revealed';

interface FortuneData {
  title: string;
  description: string;
  date: string;
  txHash?: string; 
}

export default function FortuneMvpPanel() {
  const [appState, setAppState] = useState<AppState>('unverified'); // 初始設為未驗證
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const textRef = useRef<HTMLParagraphElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🖋️ 打字機效果 Hook (原封不動)
  const startTyping = useCallback((fullText: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayText('');
    let i = 0;
    typingTimerRef.current = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length && typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    }, 45);
  }, []);

  // 🌍 實接 World ID 驗證觸發 (已改動)
  const handleWorldIDVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setError('請在 World App 中開啟此應用');
      return;
    }

    setAppState('verifying');
    setError(null);

    try {
      const { finalPayload } = await MiniKit.commands.verify({
        action: process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || 'get-fortune',
        signal: 'user-id-001', // 可根據用戶 ID 調整
      });

      if (finalPayload.status === 'error') throw new Error();

      // 呼叫後端 API 進行二次驗證
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (res.ok) {
        setAppState('verified_pending_payment');
      } else {
        throw new Error('驗證失敗');
      }
    } catch (err) {
      setError('World ID 驗證中斷，請重試');
      setAppState('unverified');
    }
  };

  // 💳 支付解鎖邏輯 (已改動)
  const handlePayUnlock = async () => {
    setAppState('payment_processing');
    setError(null);
    try {
      // 🏆 使用實戰支付邏輯
      const receiver = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0xYourReceiverAddress';
      const result = await payForFortune(receiver, '0.30');
      
      if (result.status === 'success') {
        const today = new Date().toISOString().split('T')[0];
        const mockFortune: FortuneData = {
          title: '風輕雲淡',
          description: '心自安然，不強求而自得。今日宜靜觀其變，順勢而為。',
          date: today,
          txHash: result.txHash // 使用真實交易哈希
        };
        setFortune(mockFortune);
        setAppState('revealed');
        startTyping(`${mockFortune.title}\n${mockFortune.description}`);
      } else {
        throw new Error('支付未成功');
      }
    } catch (err) {
      setError('支付流程失敗，資金未扣除');
      setAppState('payment_failed');
    }
  };

  const handleRetry = () => {
    setError(null);
    setAppState('verified_pending_payment');
  };

  // 清理定時器 (原封不動)
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* 以下 UI 渲染邏輯原封不動 */}
        {appState === 'verifying' && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 p-2">
            <div className="skeleton-base h-6 w-24 mb-4" />
            <div className="skeleton-base h-32 w-full" />
            <div className="skeleton-base h-14 w-full" />
          </motion.div>
        )}

        {appState === 'unverified' && (
          <motion.div key="unverified" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center p-4 space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
              <ShieldCheck className="text-gray-400" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">World ID 驗證 required</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                為防範女巫攻擊並確保籤詩唯一性，請完成真人驗證。全程採用零知識證明，不收集個人數據。
              </p>
            </div>
            <button onClick={handleWorldIDVerify} className="w-full touch-target-safe btn-primary-glow active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              啟動驗證 <ChevronRight size={18} />
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </motion.div>
        )}

        {appState === 'verified_pending_payment' && (
          <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="bg-[var(--accent-subtle)] rounded-2xl p-5 text-center space-y-3 border border-gray-100">
              <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wide">
                <CheckCircle2 size={14} /> 驗證通過
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">今日籤詩已就緒</h2>
              <p className="text-sm text-[var(--text-secondary)]">支付 USDC 即可解鎖深度解析與鏈上存證</p>
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">解鎖費用</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[var(--text-primary)]">0.30 USDC</span>
                <span className="text-[10px] text-gray-400 font-mono">≈ NT$9.5</span>
              </div>
            </div>

            <button onClick={handlePayUnlock} className="w-full touch-target-safe btn-primary-glow active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <Sparkles size={18} /> 立即解鎖籤詩
            </button>
            
            <div className="flex items-start gap-2 text-[11px] text-gray-400 px-1">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>純鏈上交易 · 資金由智能合約託管 · 支援 USDC / WLD</span>
            </div>
          </motion.div>
        )}

        {appState === 'payment_processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative">
              <Loader2 className="animate-spin text-[var(--accent-primary)]" size={36} />
              <div className="absolute inset-0 rounded-full bg-black/5 animate-ping" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">鏈上確認中</p>
              <p className="text-xs text-[var(--text-secondary)]">正在等待 Optimism L2 區塊打包...</p>
            </div>
          </motion.div>
        )}

        {appState === 'payment_failed' && (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-700">支付流程失敗</h4>
                <p className="text-xs text-red-600/80 mt-1">網路中斷或錢包授權取消。您的資金安全未受影響。</p>
              </div>
            </div>
            <button onClick={handleRetry} className="w-full touch-target-safe bg-gray-900 text-white rounded-[var(--radius-btn)] font-medium active:scale-[0.98] transition-transform">
              重新嘗試
            </button>
          </motion.div>
        )}

        {appState === 'revealed' && fortune && (
          <motion.div key="revealed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                <CheckCircle2 size={14} /> 抽卡成功
              </motion.div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{fortune.title}</h2>
            </div>

            <div className="bg-[var(--accent-subtle)] rounded-2xl p-5 border border-gray-100 shadow-inner">
              <p ref={textRef} className="text-[var(--text-primary)] leading-relaxed font-medium whitespace-pre-line min-h-[4em] text-lg">
                {displayText}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between維護 items-center text-[11px] text-[var(--text-secondary)] font-mono">
                <span>DATE: {fortune.date}</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">深度解析: UNLOCKED</span>
              </div>
              {fortune.txHash && (
                <div className="mt-2 text-[10px] text-gray-400 truncate">
                  TX: {fortune.txHash} · OP Mainnet
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="touch-target-safe bg-white border border-gray-200 text-[var(--text-primary)] rounded-[var(--radius-btn)] text-sm font-semibold active:scale-[0.98] transition-transform hover:bg-gray-50">
                分享籤詩
              </button>
              <button className="touch-target-safe bg-gray-900 text-white rounded-[var(--radius-btn)] text-sm font-semibold active:scale-[0.98] transition-transform hover:bg-gray-800">
                查看歷史
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}