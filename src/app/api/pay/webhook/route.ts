import { getPaymentRecord, updatePaymentRecord } from "@/lib/payment-store";
import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

const readSignature = (request: Request) =>
  request.headers.get("x-webhook-signature") ??
  request.headers.get("x-minikit-signature") ??
  "";

const verifySignature = (payload: string, signature: string) => {
  const secret = process.env.HMAC_SECRET_KEY;
  if (!secret) return false;
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};

type WebhookPayload = {
  reference?: string;
  status?: "success" | "failed" | "pending";
  transactionHash?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = readSignature(request);

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  if (!payload.reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const existing = getPaymentRecord(payload.reference);
  if (!existing) {
    return NextResponse.json({ error: "Unknown reference" }, { status: 404 });
  }

  const nextStatus =
    payload.status === "success"
      ? "paid"
      : payload.status === "failed"
        ? "failed"
        : "pending";

  const updated = updatePaymentRecord(payload.reference, {
    status: nextStatus,
    txHash: payload.transactionHash,
  });

  return NextResponse.json({ ok: true, payment: updated });
}
