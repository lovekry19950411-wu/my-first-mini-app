'use client';

import {
  Button,
  LiveFeedback,
  BottomSheet,
  Haptic,
} from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js/commands';
import { useState } from 'react';

type Fortune = {
  id: string;
  code: string;
  titleZh: string;
  bodyZh: string;
  actionZh: string;
  rarity: 'common' | 'rare';
};

type Draw = {
  userId: string;
  dateKey: string;
  fortuneId: string;
  createdAt: string;
};

type TodayResponse = {
  userId: string;
  hasDraw?: boolean;
  draw: Draw | null;
  fortune: Fortune | null;
  deepReadUnlocked: boolean;
};

type UnlockResponse = {
  paymentReference: string;
  userId: string;
  dateKey: string;
  amount: string;
  currency: string;
};

export function FortuneMvpPanel() {
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [payState, setPayState] = useState<'pending' | 'success' | 'failed' | undefined>(undefined);
  const [showShare, setShowShare] = useState(false);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/today');
      const data = await res.json() as TodayResponse | { error: string };
      if (!res.ok) { setStatus((data as { error: string }).error ?? '讀取失敗'); return; }
      setToday(data as TodayResponse);
      setStatus('');
    } catch { setStatus('讀取失敗'); }
    finally { setLoading(false); }
  };

  const drawToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/draw', { method: 'POST' });
      const data = await res.json() as TodayResponse | { error: string };
      if (!res.ok) { setStatus((data as { error: string }).error ?? '抽卡失敗'); return; }
      setToday(data as TodayResponse);
      setStatus('');
    } catch { setStatus('抽卡失敗'); }
    finally { setLoading(false); }
  };

  const unlockDeepRead = async () => {
    setPayState('pending');
    try {
      const unlockRes = await fetch('/api/pay/unlock', { method: 'POST' });
      const unlockData = await unlockRes.json() as UnlockResponse | { error: string };
      if (!unlockRes.ok) { setPayState('failed'); setTimeout(() => setPayState(undefined), 3000); return; }

      const payee = process.env.NEXT_PUBLIC_FORTUNE_RECEIVER;
      if (!payee) { setPayState('failed'); setTimeout(() => setPayState(undefined), 3000); return; }

      const paymentResult = await MiniKit.pay({
        reference: (unlockData as UnlockResponse).paymentReference,
        to: payee,
        tokens: [{
          symbol: Tokens.USDC,
          token_amount: tokenToDecimals(Number((unlockData as UnlockResponse).amount), Tokens.USDC).toString(),
        }],
        description: `每日籤詩深度解析 ${(unlockData as UnlockResponse).dateKey}`,
      });

      const txId = paymentResult.data.transactionId;
      if (!txId) { setPayState('failed'); setTimeout(() => setPayState(undefined), 3000); return; }

      await fetch('/api/pay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: (unlockData as UnlockResponse).dateKey, paymentTxId: txId, status: 'active' }),
      });

      await fetchToday();
      setPayState('success');
      setTimeout(() => setPayState(undefined), 3000);
    } catch { setPayState('failed'); setTimeout(() => setPayState(undefined), 3000); }
  };

  const shareResult = () => {
    if (!today?.fortune) return;
    const text = `🔮 今日籤詩：${today.fortune.titleZh}\n\n「${today.fortune.bodyZh}」\n\n在 World App 每日籤詩抽屬於你的今日運勢 👇`;
    if (navigator.share) {
      navigator.share({ title: '每日籤詩', text });
    } else {
      navigator.clipboard.writeText(text);
      setStatus('已複製到剪貼簿！');
    }
    setShowShare(false);
  };

  const rarityColor = today?.fortune?.rarity === 'rare' ? 'text-amber-600' : 'text-slate-600';
  const rarityLabel = today?.fortune?.rarity === 'rare' ? '✦ 稀有' : '普通';

  return (
    <div className="w-full max-w-md flex flex-col gap-3 px-1">

      {/* 今日籤卡 */}
      <div className="w-full rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
        {!today?.fortune ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <p className="text-4xl">🔮</p>
            <p className="text-sm text-slate-500 text-center">點下方按鈕，查看今日籤詩</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${rarityColor}`}>{rarityLabel}</span>
              <span className="text-xs text-slate-400">{today.draw?.dateKey}</span>
            </div>
            <p className="text-xl font-semibold text-amber-900">{today.fortune.titleZh}</p>
            <p className="text-sm text-slate-700 leading-relaxed">「{today.fortune.bodyZh}」</p>

            {today.deepReadUnlocked ? (
              <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1">✓ 深度解析已解鎖</p>
                <p className="text-sm text-slate-700">{today.fortune.actionZh}</p>
              </div>
            ) : (
              <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-400">🔒 支付 $0.30 USDC 解鎖今日行動建議</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 狀態訊息 */}
      {status ? <p className="text-xs text-center text-slate-500">{status}</p> : null}

      {/* 主要按鈕區 */}
      <div className="flex flex-col gap-2">
        {!today?.draw ? (
          <>
            <Button onClick={fetchToday} disabled={loading} size="lg" variant="secondary" className="w-full">
              查今日狀態
            </Button>
            <Button onClick={drawToday} disabled={loading} size="lg" variant="primary" className="w-full">
              {loading ? '抽卡中...' : '🎴 今日抽卡'}
            </Button>
          </>
        ) : (
          <>
            {!today.deepReadUnlocked && (
              <LiveFeedback
                label={{ pending: '支付中...', success: '解鎖成功！', failed: '支付失敗' }}
                state={payState}
                className="w-full"
              >
                <Button onClick={unlockDeepRead} disabled={payState === 'pending'} size="lg" variant="primary" className="w-full">
                  解鎖深度解析 · $0.30 USDC
                </Button>
              </LiveFeedback>
            )}
            <Button onClick={() => setShowShare(true)} size="lg" variant="secondary" className="w-full">
              分享今日籤詩 ↗
            </Button>
            <Button onClick={drawToday} disabled={loading} size="sm" variant="tertiary" className="w-full text-slate-400">
              重新查詢
            </Button>
          </>
        )}
      </div>

      {/* 分享 BottomSheet */}
      <BottomSheet isOpen={showShare} onClose={() => setShowShare(false)}>
        <div className="flex flex-col gap-4 p-4 pb-8">
          <p className="text-base font-semibold text-center">分享今日籤詩</p>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
            <p className="text-lg font-semibold text-amber-900 mb-2">{today?.fortune?.titleZh}</p>
            <p className="text-sm text-slate-600">「{today?.fortune?.bodyZh}」</p>
          </div>
          <Button onClick={shareResult} size="lg" variant="primary" className="w-full">
            分享 / 複製文字
          </Button>
          <Button onClick={() => setShowShare(false)} size="lg" variant="secondary" className="w-full">
            取消
          </Button>
        </div>
      </BottomSheet>

    </div>
  );
}
