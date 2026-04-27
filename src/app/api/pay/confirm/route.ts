import { getPaymentRecord, updatePaymentRecord } from "@/lib/payment-store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    reference?: string;
    transactionHash?: string;
  };

  if (!body.reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const existing = getPaymentRecord(body.reference);
  if (!existing) {
    return NextResponse.json({ error: "Unknown reference" }, { status: 404 });
  }

  const updated = updatePaymentRecord(body.reference, {
    status: "paid",
    txHash: body.transactionHash,
  });

  return NextResponse.json({ ok: true, payment: updated });
}
