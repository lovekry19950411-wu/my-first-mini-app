import { NextResponse } from 'next/server';
import { getFortuneById, getHistory } from '@/lib/fortune-store';
import { getRequestUserId } from '@/lib/request-user';

export async function GET(request: Request) {
  const userId = await getRequestUserId();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? '7');

  const history = (await getHistory(userId, Number.isNaN(limit) ? 7 : Math.min(limit, 30))).map((item: { userId: string; dateKey: string; fortuneId: string; createdAt: string }) => ({
    ...item,
    fortune: getFortuneById(item.fortuneId),
  }));

  return NextResponse.json({ userId, count: history.length, history });
}
