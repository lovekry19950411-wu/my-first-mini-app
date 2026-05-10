import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT u.name as username, up.points
       FROM user_points up
       JOIN users u ON u.id = up.user_id
       ORDER BY up.points DESC
       LIMIT 20`,
      []
    );
    const leaders = result.rows.map((row: any, i: number) => ({
      username: row.username ?? "匿名用戶",
      points: row.points,
      rank: i + 1,
    }));
    return NextResponse.json({ leaders });
  } catch {
    // DB 未設定時回傳空陣列
    return NextResponse.json({ leaders: [] });
  }
}
