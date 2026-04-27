'use client';

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

const demoUserHeader = { 'x-demo-user': 'demo-alice' };

export function FortuneMvpPanel() {
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [status, setStatus] = useState('準備就緒，先點「查今日狀態」');
  const [loading, setLoading] = useState(false);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/today', { headers: demoUserHeader });
      const data = (await res.json()) as TodayResponse;
      setToday(data);
      setStatus(data.draw ? '已載入今日籤文' : '今天還沒抽，請先抽卡');
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
        headers: demoUserHeader,
      });
      const data = (await res.json()) as TodayResponse;
      setToday(data);
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
      const res = await fetch('/api/pay/unlock', {
        method: 'POST',
        headers: demoUserHeader,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setStatus(errorData.error ?? '解鎖失敗');
        return;
      }

      await fetchToday();
      setStatus('深度解析已解鎖');
    } catch {
      setStatus('支付流程失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/history?limit=7', {
        headers: demoUserHeader,
      });
      const data = (await res.json()) as { history: HistoryItem[] };
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
      <h2 className="text-lg font-semibold text-amber-900">Fortune Loop MVP Demo</h2>
      <p className="mt-1 text-sm text-amber-800">Demo User: demo-alice（可先驗證完整流程）</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-lg bg-black px-3 py-2 text-sm text-white" onClick={fetchToday} disabled={loading}>
          查今日狀態
        </button>
        <button className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white" onClick={drawToday} disabled={loading}>
          今日抽卡
        </button>
        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white" onClick={unlockDeepRead} disabled={loading}>
          解鎖深度解析
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
            <p className="text-xs text-slate-600">今日行動：{today.fortune.actionZh}</p>
            <p className="text-xs text-slate-600">日期：{today.draw.dateKey}</p>
            <p className="text-xs font-semibold text-emerald-700">
              深度解析：{today.deepReadUnlocked ? '已解鎖' : '未解鎖'}
            </p>
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
