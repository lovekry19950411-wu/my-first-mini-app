'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js/commands';
import { useState } from 'react';

type Fortune = { id: string; code: string; titleZh: string; bodyZh: string; actionZh: string; rarity: 'common' | 'rare'; };
type Draw = { userId: string; dateKey: string; fortuneId: string; createdAt: string; };
type TodayResponse = { userId: string; hasDraw?: boolean; draw: Draw | null; fortune: Fortune | null; deepReadUnlocked: boolean; };
type UnlockResponse = { paymentReference: string; userId: string; dateKey: string; amount: string; currency: string; };

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
    } catch { setStatus('讀取失敗'); } finally { setLoading(false); }
  };

  const drawToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/draw', { method: 'POST' });
      const data = await res.json() as TodayResponse | { error: string };
      if (!res.ok) { setStatus((data as { error: string }).error ?? '抽卡失敗'); return; }
      setToday(data as TodayResponse);
      setStatus('');
    } catch { setStatus('抽卡失敗'); } finally { setLoading(false); }
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
        tokens: [{ symbol: Tokens.USDC, token_amount: tokenToDecimals(Number((unlockData as UnlockResponse).amount), Tokens.USDC).toString() }],
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
    const text = `🔮 今日籤詩：${today.fortune.titleZh}\n\n「${today.fortune.bodyZh}」\n\n在 World App 每日籤詩抽屬於你的今日運勢 ✨\nhttps://worldcoin.org/mini-app/app_77be985c81f495f12e3d35184c751a90`;
    if (navigator.share) {
      navigator.share({ title: '每日籤詩', text });
    } else {
      navigator.clipboard.writeText(text);
      setStatus('已複製！去貼到社群媒體吧 🎉');
    }
    setShowShare(false);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-3 px-1">

      {/* 籤卡 — 深色神秘風 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(212,175,55,0.3)',
        padding: '24px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(212,175,55,0.1)',
      }}>
        {!today?.fortune ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔮</p>
            <p style={{ color: 'rgba(212,175,55,0.7)', fontSize: '14px' }}>點下方按鈕查看今日籤詩</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: today.fortune.rarity === 'rare' ? '#ffd700' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
              }}>
                {today.fortune.rarity === 'rare' ? '✦ 稀有籤' : '普通籤'}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{today.draw?.dateKey}</span>
            </div>
cat > ~/my-first-mini-app/src/components/FortuneMvpPanel/index.tsx << 'ENDOFFILE'
'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js/commands';
import { useState } from 'react';

type Fortune = { id: string; code: string; titleZh: string; bodyZh: string; actionZh: string; rarity: 'common' | 'rare'; };
type Draw = { userId: string; dateKey: string; fortuneId: string; createdAt: string; };
type TodayResponse = { userId: string; hasDraw?: boolean; draw: Draw | null; fortune: Fortune | null; deepReadUnlocked: boolean; };
type UnlockResponse = { paymentReference: string; userId: string; dateKey: string; amount: string; currency: string; };

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
    } catch { setStatus('讀取失敗'); } finally { setLoading(false); }
  };

  const drawToday = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune/draw', { method: 'POST' });
      const data = await res.json() as TodayResponse | { error: string };
      if (!res.ok) { setStatus((data as { error: string }).error ?? '抽卡失敗'); return; }
      setToday(data as TodayResponse);
      setStatus('');
    } catch { setStatus('抽卡失敗'); } finally { setLoading(false); }
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
        tokens: [{ symbol: Tokens.USDC, token_amount: tokenToDecimals(Number((unlockData as UnlockResponse).amount), Tokens.USDC).toString() }],
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
    const text = `🔮 今日籤詩：${today.fortune.titleZh}\n\n「${today.fortune.bodyZh}」\n\n在 World App 每日籤詩抽屬於你的今日運勢 ✨\nhttps://worldcoin.org/mini-app/app_77be985c81f495f12e3d35184c751a90`;
    if (navigator.share) {
      navigator.share({ title: '每日籤詩', text });
    } else {
      navigator.clipboard.writeText(text);
      setStatus('已複製！去貼到社群媒體吧 🎉');
    }
    setShowShare(false);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-3 px-1">

      {/* 籤卡 — 深色神秘風 */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(212,175,55,0.3)',
        padding: '24px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(212,175,55,0.1)',
      }}>
        {!today?.fortune ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔮</p>
            <p style={{ color: 'rgba(212,175,55,0.7)', fontSize: '14px' }}>點下方按鈕查看今日籤詩</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: today.fortune.rarity === 'rare' ? '#ffd700' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
              }}>
                {today.fortune.rarity === 'rare' ? '✦ 稀有籤' : '普通籤'}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{today.draw?.dateKey}</span>
            </div>
            <p style={{ fontSize: '22px', fontWeight: '700', color: '#ffd700', letterSpacing: '0.05em' }}>
              {today.fortune.titleZh}
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
              「{today.fortune.bodyZh}」
            </p>
            {today.deepReadUnlocked ? (
              <div style={{
                background: 'rgba(0,200,100,0.1)',
                border: '1px solid rgba(0,200,100,0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '4px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#00c864', marginBottom: '6px' }}>✓ 今日行動建議</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>{today.fortune.actionZh}</p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>🔒 支付解鎖今日行動建議</p>
              </div>
            )}
          </div>
        )}
      </div>

      {status ? <p style={{ fontSize: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>{status}</p> : null}

      {/* 分享彈窗 */}
      {showShare && today?.fortune && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
        }} onClick={() => setShowShare(false)}>
          <div style={{
            width: '100%', maxWidth: '448px',
            background: '#1a1a2e',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '20px 20px 0 0',
            padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '16px', fontWeight: '600', textAlign: 'center', color: '#ffd700' }}>分享今日籤詩</p>
            <div style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '12px', padding: '16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffd700', marginBottom: '8px' }}>{today.fortune.titleZh}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>「{today.fortune.bodyZh}」</p>
            </div>
            <Button onClick={shareResult} size="lg" variant="primary" className="w-full">分享 / 複製文字</Button>
            <Button onClick={() => setShowShare(false)} size="lg" variant="secondary" className="w-full">取消</Button>
          </div>
        </div>
      )}

      {/* 按鈕區 */}
      <div className="flex flex-col gap-2">
        {!today?.draw ? (
          <>
            <Button onClick={fetchToday} disabled={loading} size="lg" variant="secondary" className="w-full">
              {loading ? '讀取中...' : '查今日狀態'}
            </Button>
            <Button onClick={drawToday} disabled={loading} size="lg" variant="primary" className="w-full">
              {loading ? '抽卡中...' : '🎴 今日抽卡'}
            </Button>
          </>
        ) : (
          <>
            {!today.deepReadUnlocked && (
              <LiveFeedback
                label={{ pending: '支付中...', success: '解鎖成功！', failed: '支付失敗，請重試' }}
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
            <Button onClick={fetchToday} disabled={loading} size="sm" variant="tertiary" className="w-full">
              重新整理
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
