import { NextRequest, NextResponse } from 'next/server';

// 🏆 GRANT OPTIMIZATION: 生產級環境變數保護與邊緣計算兼容設計
// 支援 Vercel Edge Runtime，若需 Redis 限流可在此引入 @upstash/ratelimit
const WORLD_ID_VERIFY_URL = 'https://developer.worldcoin.org/api/v2/verify';
const ACTION_ID = process.env.WORLD_ID_ACTION_ID;

export const runtime = 'nodejs'; // 確保 fetch 與 JSON 解析在 Node 環境穩定執行

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nullifier_hash, proof, action = ACTION_ID, signal } = body;

    // 🛡️ 嚴格參數校驗，防止惡意請求消耗 API 配額
    if (!nullifier_hash || !proof || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nullifier_hash, proof, action' },
        { status: 400 }
      );
    }

    // 🌐 呼叫 World ID 官方驗證節點
    const verifyRes = await fetch(WORLD_ID_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nullifier_hash, proof, action, signal }),
    });

    const data = await verifyRes.json();

    // 📊 處理成功驗證回應
    if (verifyRes.ok && data.success) {
      return NextResponse.json({
        success: true,
        verification_level: data.verification_level || 'orb',
        nullifier_hash,
        timestamp: new Date().toISOString(),
      }, { status: 200 });
    }

    // ❌ 驗證失敗映射（重複驗證、無效證明、過期等）
    return NextResponse.json(
      { 
        success: false, 
        error: data.detail || 'Verification failed',
        code: data.error_code,
        hint: '請確認 World ID 驗證狀態或未重複使用 nullifier'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('[World ID Verify API Internal Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please retry.' },
      { status: 500 }
    );
  }
}

// 📝 部署檢查清單：
// 1. 確保 .env.local 包含 WORLD_ID_ACTION_ID
// 2. Vercel 後台設置相同環境變數
// 3. 若啟用 Edge Runtime，請將 runtime 改為 'edge' 並調整 fetch 選項
