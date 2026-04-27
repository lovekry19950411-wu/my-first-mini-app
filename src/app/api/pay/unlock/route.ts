import { NextResponse } from 'next/server';
import { getTodayDraw, upsertEntitlement } from '@/lib/fortune-store';
import { getRequestUserId, UnauthorizedError } from '@/lib/request-user';

type UnlockRequest = {
  paymentReference?: string;
};

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId();
    const draw = await getTodayDraw(userId);

    if (!draw) {
      return NextResponse.json(
        { error: '請先完成今日抽卡，再解鎖深度解析。' },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as UnlockRequest;
    const paymentTxId = body.paymentReference ?? `payref_${crypto.randomUUID().replace(/-/g, '')}`;

    const entitlement = await upsertEntitlement({
      userId,
      dateKey: draw.dateKey,
      type: 'daily_deep_read',
      status: 'pending',
      paymentTxId,
    });

    return NextResponse.json({
      ok: true,
      sku: 'daily_deep_read',
      amount: '1.99',
      currency: 'USD',
      paymentReference: paymentTxId,
      userId,
      dateKey: draw.dateKey,
      entitlement,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '無法建立支付訂單' }, { status: 500 });
  }
}
