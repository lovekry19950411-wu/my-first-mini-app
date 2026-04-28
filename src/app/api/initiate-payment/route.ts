import { createPaymentRecord } from "@/lib/payment-store";
import { NextResponse } from "next/server";

const FALLBACK_RECIPIENT = "0x0000000000000000000000000000000000000000";
const WLD_UNLOCK_AMOUNT = "0.01";

export async function POST(request: Request) {
  const reference = crypto.randomUUID().replace(/-/g, "");
  const body = (await request.json().catch(() => ({}))) as { userId?: string };

  const recipient = process.env.PAYEE_WALLET_ADDRESS ?? FALLBACK_RECIPIENT;

  createPaymentRecord(reference, {
    createdAt: Date.now(),
    description: "Unlock fortune deep analysis",
    recipient,
    status: "pending",
    token: "WLD",
    tokenAmount: WLD_UNLOCK_AMOUNT,
    userId: body.userId,
  });

  return NextResponse.json({
    amount: WLD_UNLOCK_AMOUNT,
    recipient,
    reference,
  });
}
