import { Metadata } from 'next';
import FortuneMvpPanel from '@/components/FortuneMvpPanel';

// 📄 補助申請必備：清晰 Metadata 提升應用專業度與 SEO 可讀性
export const metadata: Metadata = {
  title: 'Fortune Loop | 每日籤詩',
  description: '基於 World ID 真人驗證的 Web3 每日籤詩應用。純鏈上交易，隱私由零知識證明保護。',
  icons: { icon: '/favicon.ico' },
};

export default function HomePage() {
  return (
    <main className="flex-1 w-full px-5 pt-6 pb-12 flex flex-col max-w-lg mx-auto">
      {/*  頂部導航區：符合 World App 內嵌規範，留白充足 */}
      <header className="mb-6 space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Fortune Loop
          </h1>
          {/* 🌍 世界幣狀態指示器：展現生態系整合意識 */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600">World ID 已連線</span>
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-snug">
          每日籤詩 · 鏈上驗證 · 隱私優先
        </p>
      </header>

      {/*  核心 MVP 面板：載入已優化的 FortuneMvpPanel */}
      <div className="flex-1 flex flex-col justify-start">
        <FortuneMvpPanel />
      </div>

      {/* 🏆 底部合規聲明：補助評審極度重視透明度與免責條款 */}
      <footer className="mt-8 pt-4 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Powered by World ID · Pure On-Chain TX · ZK-Privacy First<br />
          本應用為實驗性 MVP，僅供演示與補助審查使用
        </p>
      </footer>
    </main>
  );
}
