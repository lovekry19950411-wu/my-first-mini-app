import { NextResponse } from 'next/server';
import { upsertEntitlement } from '@/lib/fortune-store';
import { getRequestUserId, UnauthorizedError } from '@/lib/request-user';

type WebhookBody = {
  dateKey: string;
  paymentTxId: string;
  status: 'active' | 'refunded';
};

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId();
    const body = (await request.json()) as Partial<WebhookBody>;

    if (!body.dateKey || !body.paymentTxId || !body.status) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    const entitlement = await upsertEntitlement({
      userId,
      dateKey: body.dateKey,
      type: 'daily_deep_read',
      status: body.status,
      paymentTxId: body.paymentTxId,
    });

    return NextResponse.json({ ok: true, entitlement });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '更新支付狀態失敗' }, { status: 500 });
  }
}
