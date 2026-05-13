import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await req.json();

    // 前端 Verify 元件以 `success` 判斷；正式上線請改為 Developer Portal / verifyCloudProof 驗證。
    return NextResponse.json({ success: true, message: '已驗證' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器處理失敗' },
      { status: 500 },
    );
  }
}