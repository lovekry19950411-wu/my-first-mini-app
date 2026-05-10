import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ items: [] });

  try {
    const result = await query(
      `SELECT id, platform, content_type as "contentType", topic, content, created_at as "createdAt"
       FROM content_library
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [session.user.id]
    );
    return NextResponse.json({ items: result.rows });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
