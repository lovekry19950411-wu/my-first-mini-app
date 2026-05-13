'use client';

import { AuthButton } from '@/components/AuthButton';
import { NXZ_CONFIG } from '@/consts/config';
import { MiniKit } from '@worldcoin/minikit-js';
import {
  Tokens,
  tokenToDecimals,
  type PayCommandInput,
} from '@worldcoin/minikit-js/commands';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const IDKitWidget = dynamic(
  () => import('@worldcoin/idkit').then((mod) => mod.IDKitWidget),
  { ssr: false },
);

const premiumWld = Number.parseFloat(NXZ_CONFIG.PREMIUM_FEE_WLD) || 5;

export default function NXZAssetCommandCenter() {
  const [mounted, setMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      MiniKit.install();
    }
  }, []);

  const handleVerify = () => {
    setIsVerified(true);
  };

  const handlePremiumPayment = async () => {
    if (!MiniKit.isInstalled()) {
      alert('請在 World App 內運行以啟動精英方案');
      return;
    }

    setStatus('loading');

    try {
      const payPayload: PayCommandInput = {
        reference: `NXZ_ELITE_${Date.now()}`,
        to: NXZ_CONFIG.TREASURY_ADDRESS as `0x${string}`,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: String(
              tokenToDecimals(premiumWld, Tokens.WLD),
            ),
          },
        ],
        description: 'NXZ 先鋒精英蛋選拔規費',
      };

      const response = await MiniKit.pay(payPayload);

      if (
        response.executedWith === 'minikit' &&
        response.data &&
        'transactionId' in response.data
      ) {
        setStatus('success');
        alert('恭喜！精英模式已啟動，您的身分已錄入 NXZ 人才池。');
      } else {
        setStatus('error');
        alert('支付未完成或已取消，請稍後再試。');
      }
    } catch (e) {
      console.error('支付失敗', e);
      setStatus('error');
      alert('支付過程發生錯誤，請確認網路後再試。');
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 font-sans text-white antialiased">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-6 text-left space-y-4">
          <p className="text-sm font-semibold text-yellow-400">步驟一 · 錢包登入</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            請在 <strong className="text-gray-200">World App</strong>{' '}
            內開啟本頁。登入成功後可到「主控制台」使用完整官方範例（驗證、支付、交易）。
          </p>
          <div className="flex justify-center">
            <AuthButton />
          </div>
          <div className="text-center text-sm">
            <Link
              href="/home"
              className="text-yellow-400 underline underline-offset-4 hover:text-yellow-300"
            >
              前往主控制台（需先完成錢包登入）
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-yellow-500 uppercase italic">
            NXZ <span className="text-white">控制中心</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            資產指令 · 真人驗證與方案支付
          </p>
        </div>

        {!isVerified ? (
          <div className="rounded-3xl border border-gray-800 bg-zinc-900/50 py-10 backdrop-blur-xl">
            <IDKitWidget
              app_id={NXZ_CONFIG.APP_ID as `app_${string}`}
              action={NXZ_CONFIG.ACTION}
              onSuccess={handleVerify}
              verification_level={'orb' as never}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={open}
                  className="transform rounded-full bg-white px-10 py-4 text-lg font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:bg-yellow-500 active:scale-95"
                >
                  透過 World ID 證明真人身份
                </button>
              )}
            </IDKitWidget>
            <p className="mt-4 text-xs text-gray-500">
              驗證後即可解鎖精英孵化方案
            </p>
          </div>
        ) : (
          <div className="duration-500 animate-in fade-in zoom-in space-y-6">
            <div className="rounded-[2.5rem] border-2 border-yellow-600 bg-gradient-to-b from-yellow-600/10 to-transparent p-8 shadow-[0_0_50px_rgba(202,138,4,0.3)]">
              <h2 className="mb-2 text-2xl font-black text-yellow-500">
                真人權限已鎖定
              </h2>
              <p className="mb-8 text-sm text-gray-400">
                您已具備參與 NXZ 生態建設的資格
              </p>

              <button
                type="button"
                onClick={handlePremiumPayment}
                disabled={status === 'loading' || status === 'success'}
                className="w-full rounded-2xl bg-yellow-500 px-8 py-6 text-xl font-black text-black shadow-xl transition-all hover:bg-yellow-400 disabled:bg-zinc-700"
              >
                {status === 'loading'
                  ? '正在連結財庫...'
                  : status === 'success'
                    ? '精英蛋已啟動'
                    : `支付 ${premiumWld} WLD 啟動精英蛋`}
              </button>

              <div className="mt-6 border-t border-yellow-900/30 pt-6">
                <p className="break-all text-[10px] text-gray-500 opacity-50">
                  財庫收款地址: {NXZ_CONFIG.TREASURY_ADDRESS}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="absolute bottom-8 max-w-md px-4 text-center text-[10px] tracking-wide text-zinc-600">
        NXZ 資產控制中心 · 2026 · World 迷你應用
      </footer>
    </main>
  );
}
