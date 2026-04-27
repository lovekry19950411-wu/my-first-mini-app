import { NextResponse } from 'next/server';
import { getEntitlement, getFortuneById, getTodayDraw } from '@/lib/fortune-store';
import { getRequestUserId, UnauthorizedError } from '@/lib/request-user';

export async function GET() {
  try {
    const userId = await getRequestUserId();
    const draw = await getTodayDraw(userId);

    if (!draw) {
      return NextResponse.json({ userId, hasDraw: false, draw: null, fortune: null, deepReadUnlocked: false });
    }

    const entitlement = await getEntitlement(userId, draw.dateKey);

    return NextResponse.json({
      userId,
      hasDraw: true,
      draw,
      fortune: getFortuneById(draw.fortuneId),
      deepReadUnlocked: entitlement?.status === 'active',
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '讀取今日狀態失敗' }, { status: 500 });
  }
}
