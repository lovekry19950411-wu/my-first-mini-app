import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { query } = await import("@/lib/db");
    const result = await query(
      "SELECT user_id as username, points FROM user_points ORDER BY points DESC LIMIT 20",
      []
    );
    return NextResponse.json({ leaders: result.rows });
  } catch {
    return NextResponse.json({ leaders: [] });
  }
}
