import { NextResponse } from 'next/server';
import { drawToday, getFortuneById, getEntitlement } from '@/lib/fortune-store';
import { getRequestUserId, UnauthorizedError } from '@/lib/request-user';

export async function POST() {
  try {
    const userId = await getRequestUserId();
    const draw = await drawToday(userId);
    const fortune = getFortuneById(draw.fortuneId);
    const entitlement = await getEntitlement(userId, draw.dateKey);

    return NextResponse.json({
      userId,
      draw,
      fortune,
      deepReadUnlocked: entitlement?.status === 'active',
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '抽卡失敗' }, { status: 500 });
  }
}
