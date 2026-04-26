import { NextResponse } from 'next/server';
import { getTodayDraw, upsertEntitlement } from '@/lib/fortune-store';
import { getRequestUserId } from '@/lib/request-user';

export async function POST() {
  const userId = await getRequestUserId();
  const draw = getTodayDraw(userId);

  if (!draw) {
    return NextResponse.json(
      { error: '請先完成今日抽卡，再解鎖深度解析。' },
      { status: 400 },
    );
  }

  const paymentTxId = `pay_${Date.now()}`;

  const entitlement = upsertEntitlement({
    userId,
    dateKey: draw.dateKey,
    type: 'daily_deep_read',
    status: 'active',
    paymentTxId,
  });

  return NextResponse.json({
    ok: true,
    sku: 'daily_deep_read',
    amount: '1.99',
    currency: 'USD',
    paymentTxId,
    entitlement,
  });
}
