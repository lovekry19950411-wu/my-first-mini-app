import { NextResponse } from 'next/server';
import { drawToday, getFortuneById, getEntitlement } from '@/lib/fortune-store';
import { getRequestUserId } from '@/lib/request-user';

export async function POST() {
  const userId = await getRequestUserId();
  const draw = drawToday(userId);
  const fortune = getFortuneById(draw.fortuneId);
  const entitlement = getEntitlement(userId, draw.dateKey);

  return NextResponse.json({
    userId,
    draw,
    fortune,
    deepReadUnlocked: entitlement?.status === 'active',
  });
}
