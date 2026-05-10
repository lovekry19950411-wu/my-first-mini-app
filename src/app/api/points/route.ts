import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  const pointsMap: Record<string, number> = { copy: 2, share: 5, generate: 10 };
  const pts = pointsMap[action] ?? 1;

  try {
    await query(
      `INSERT INTO user_points (user_id, points, action)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + $2`,
      [session.user.id, pts, action]
    );
    return NextResponse.json({ ok: true, added: pts });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
