import { NextResponse } from 'next/server';
import { upsertEntitlement } from '@/lib/fortune-store';

type WebhookBody = {
  userId: string;
  dateKey: string;
  paymentTxId: string;
  status: 'active' | 'refunded';
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<WebhookBody>;

  if (!body.userId || !body.dateKey || !body.paymentTxId || !body.status) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const entitlement = upsertEntitlement({
    userId: body.userId,
    dateKey: body.dateKey,
    type: 'daily_deep_read',
    status: body.status,
    paymentTxId: body.paymentTxId,
  });

  return NextResponse.json({ ok: true, entitlement });
}
