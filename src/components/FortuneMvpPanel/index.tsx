'use client';

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

type HistoryItem = Draw & { fortune: Fortune | null };

type UnlockResponse = {
  paymentReference: string;
  userId: string;
  dateKey: string;
  amount: string;
  currency: string;
};

export function FortuneMvpPanel() {
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [status, setStatus] = useState('準備就緒，先點「查今日狀態」');
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/today');
      const data = (await res.json()) as TodayResponse | { error: string };

      if (!res.ok) {
        setStatus((data as { error: string }).error ?? '讀取今日狀態失敗');
        return;
      }

      setToday(data as TodayResponse);
      setStatus((data as TodayResponse).draw ? '已載入今日籤文' : '今天還沒抽，請先抽卡');
    } catch {
      setStatus('讀取今日狀態失敗');
    } finally {
      setLoading(false);
    }
  };

  const drawToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/draw', {
        method: 'POST',
      });
      const data = (await res.json()) as TodayResponse | { error: string };

      if (!res.ok) {
        setStatus((data as { error: string }).error ?? '抽卡失敗，請稍後重試');
        return;
      }

      setToday(data as TodayResponse);
      setStatus('抽卡成功！');
    } catch {
      setStatus('抽卡失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const unlockDeepRead = async () => {
    setLoading(true);
    try {
      const unlockRes = await fetch('/api/pay/unlock', { method: 'POST' });
      const unlockData = (await unlockRes.json()) as UnlockResponse | { error: string };

      if (!unlockRes.ok) {
        setStatus((unlockData as { error: string }).error ?? '無法建立支付訂單');
        return;
      }

      const payee = process.env.NEXT_PUBLIC_FORTUNE_RECEIVER;
      if (!payee) {
        setStatus('尚未設定收款錢包（NEXT_PUBLIC_FORTUNE_RECEIVER）');
        return;
      }

      const paymentResult = await MiniKit.pay({
        reference: (unlockData as UnlockResponse).paymentReference,
        to: payee,
        {
            symbol: Tokens.USDC,
            token_amount: tokenToDecimals(Number((unlockData as UnlockResponse).amount), Tokens.USDC).toString(),
        },
    ],
    description: `Fortune deep read ${(unlockData as UnlockResponse).dateKey}`,
});
        tokens: [
          {
            symbol: Tokens.USDC,
            token_amount: tokenToDecimals(Number((unlockData as UnlockResponse).amount), Tokens.USDC).toString(),
          },
        ],
        description: `Fortune deep read ${(unlockData as UnlockResponse).dateKey}`,
      });

      const txId = paymentResult.data.transactionId;
      if (!txId) {
        setStatus('支付成功但缺少交易編號，請聯絡客服');
        return;
      }

      const confirmRes = await fetch('/api/pay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateKey: (unlockData as UnlockResponse).dateKey,
          paymentTxId: txId,
          status: 'active',
        }),
      });

      if (!confirmRes.ok) {
        setStatus('支付成功，但解鎖同步失敗，請稍後重試');
        return;
      }

      await fetchToday();
      setStatus('支付成功，深度解析已解鎖');
    } catch {
      setStatus('支付流程失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/history?limit=7');
      const data = (await res.json()) as { history?: HistoryItem[]; error?: string };

      if (!res.ok) {
        setStatus(data.error ?? '讀取歷史失敗');
        return;
      }

      setHistory(data.history ?? []);
      setStatus('已載入最近 7 天紀錄');
    } catch {
      setStatus('讀取歷史失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-amber-900">Fortune Loop</h2>
      <p className="mt-1 text-sm text-amber-800">完成支付後才可查看當日深度解析。</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-lg bg-black px-3 py-2 text-sm text-white" onClick={fetchToday} disabled={loading}>
          查今日狀態
        </button>
        <button className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white" onClick={drawToday} disabled={loading}>
          今日抽卡
        </button>
        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white" onClick={unlockDeepRead} disabled={loading}>
          支付解鎖深度解析
        </button>
        <button className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white" onClick={loadHistory} disabled={loading}>
          讀取歷史
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-700">狀態：{loading ? '處理中...' : status}</p>

      <div className="mt-4 rounded-xl bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">今日結果</h3>
        {!today?.draw || !today.fortune ? (
          <p className="mt-2 text-sm text-slate-500">尚未抽卡</p>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium text-slate-900">{today.fortune.titleZh}</p>
            <p className="text-sm text-slate-700">{today.fortune.bodyZh}</p>
            <p className="text-xs text-slate-600">日期：{today.draw.dateKey}</p>
            <p className="text-xs font-semibold text-emerald-700">
              深度解析：{today.deepReadUnlocked ? '已解鎖' : '未解鎖'}
            </p>
            {today.deepReadUnlocked ? (
              <p className="text-xs text-slate-700">今日行動（深度解析）：{today.fortune.actionZh}</p>
            ) : (
              <p className="text-xs text-slate-500">支付完成後可查看今日行動建議。</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">最近 7 天</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">尚無資料</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {history.map((item) => (
              <li key={`${item.userId}-${item.dateKey}`} className="rounded-md border border-slate-200 p-2 text-sm">
                <p className="font-medium">{item.fortune?.titleZh ?? '未知卡片'}</p>
                <p className="text-xs text-slate-600">{item.dateKey}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
