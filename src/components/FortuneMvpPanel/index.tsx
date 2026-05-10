"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle, ChevronRight, CheckCircle2, Sparkles, Info } from 'lucide-react';
// 🛠️ 導入 World App 交互工具
import { MiniKit } from '@worldcoin/minikit-js';
import { payForFortune } from '@/lib/wallet';

// 🎯 狀態機定義
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
  const [appState, setAppState] = useState<AppState>('unverified');
  const [fortune, setFortune] = useState<FortuneData | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🖋️ 打字機效果
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

  // 🌍 World ID 驗證
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
        signal: 'user-id-001', 
      });

      if (finalPayload.status === 'error') throw new Error();

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

  // 💳 支付解鎖邏輯
  const handlePayUnlock = async () => {
    setAppState('payment_processing');
    setError(null);
    try {
      const receiver = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0xeb6782260F0B1E6360F6573C630D2E123f95fB60';
      const result = await payForFortune(receiver, '0.30');
      
      if (result.status === 'success') {
        const today = new Date().toISOString().split('T')[0];
        const mockFortune: FortuneData = {
          title: '風輕雲淡',
          description: '心自安然，不強求而自得。今日宜靜觀其變，順勢而為。',
          date: today,
          txHash: result.txHash 
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

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <AnimatePresence mode="wait">
        {appState === 'verifying' && (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mb-4" />
            <div className="h-32 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-14 w-full bg-gray-200 animate-pulse rounded" />
          </motion.div>
        )}

        {appState === 'unverified' && (
          <motion.div key="unverified" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
              <ShieldCheck className="text-gray-400" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold">需要 World ID 驗證</h3>
              <p className="text-sm text-gray-500 mt-1.5">
                為確保籤詩唯一性，請完成真人驗證。
              </p>
            </div>
            <button onClick={handleWorldIDVerify} className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2">
              啟動驗證 <ChevronRight size={18} />
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </motion.div>
        )}

        {appState === 'verified_pending_payment' && (
          <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="bg-emerald-50 rounded-2xl p-5 text-center space-y-3 border border-emerald-100">
              <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-semibold uppercase">
                <CheckCircle2 size={14} /> 驗證通過
              </div>
              <h2 className="text-2xl font-bold">今日籤詩已就緒</h2>
              <p className="text-sm text-gray-600">支付 0.30 WLD/USDC 即可解鎖深度解析</p>
            </div>
            <button onClick={handlePayUnlock} className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
              <Sparkles size={18} /> 立即解鎖籤詩
            </button>
          </motion.div>
        )}

        {appState === 'payment_processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10 space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="text-sm font-semibold">鏈上確認中...</p>
          </motion.div>
        )}

        {appState === 'revealed' && fortune && (
          <motion.div key="revealed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">{fortune.title}</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {displayText}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-[11px] text-gray-400">
                <span>DATE: {fortune.date}</span>
                <span className="text-emerald-600 font-semibold">已解鎖</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
