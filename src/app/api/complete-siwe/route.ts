import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js/commands";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

export async function POST(req: NextRequest) {
  const { payload, nonce } = await req.json() as { payload: MiniAppWalletAuthSuccessPayload; nonce: string };
  const cookieStore = await cookies();
  const storedNonce = cookieStore.get("siwe")?.value;

  if (!storedNonce || nonce !== storedNonce) {
    return NextResponse.json({ isValid: false, error: "Invalid nonce" }, { status: 400 });
  }

  try {
    const verification = await verifySiweMessage(payload, nonce);
    if (verification.isValid) {
      cookieStore.set("wallet_address", verification.siweMessageData.address, {
        secure: true, httpOnly: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7,
      });
    }
    return NextResponse.json({ isValid: verification.isValid, address: verification.siweMessageData.address });
  } catch (error) {
    return NextResponse.json({ isValid: false, error: String(error) }, { status: 400 });
  }
}
