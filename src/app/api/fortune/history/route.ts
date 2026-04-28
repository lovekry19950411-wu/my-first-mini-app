import { NextResponse } from 'next/server';
import { getFortuneById, getHistory } from '@/lib/fortune-store';
import { getRequestUserId, UnauthorizedError } from '@/lib/request-user';

export async function GET(request: Request) {
  try {
    const userId = await getRequestUserId();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? '7');

    const history = (await getHistory(userId, Number.isNaN(limit) ? 7 : Math.min(limit, 30))).map((item: { userId: string; dateKey: string; fortuneId: string; createdAt: string }) => ({
      ...item,
      fortune: getFortuneById(item.fortuneId),
    }));

    return NextResponse.json({ userId, count: history.length, history });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: '讀取歷史失敗' }, { status: 500 });
  }
}
