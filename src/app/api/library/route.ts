import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet") ?? "";
  if (!wallet) return NextResponse.json({ items: [] });
  try {
    const { query } = await import("@/lib/db");
    const result = await query(
      "SELECT id, platform, content_type, topic, content, created_at FROM content_library WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [wallet]
    );
    return NextResponse.json({ items: result.rows });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
