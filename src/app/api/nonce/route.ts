import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, { secure: true, httpOnly: true, sameSite: "strict", maxAge: 300 });
  return NextResponse.json({ nonce });
}
