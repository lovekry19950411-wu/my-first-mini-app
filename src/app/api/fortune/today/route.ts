import { NextResponse } from 'next/server';
import { getEntitlement, getFortuneById, getTodayDraw } from '@/lib/fortune-store';
import { getRequestUserId } from '@/lib/request-user';

export async function GET() {
  const userId = await getRequestUserId();
  const draw = getTodayDraw(userId);

  if (!draw) {
    return NextResponse.json({ userId, hasDraw: false, draw: null, fortune: null, deepReadUnlocked: false });
  }

  const entitlement = getEntitlement(userId, draw.dateKey);

  return NextResponse.json({
    userId,
    hasDraw: true,
    draw,
    fortune: getFortuneById(draw.fortuneId),
    deepReadUnlocked: entitlement?.status === 'active',
  });
}
