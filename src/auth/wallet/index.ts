"use client";
import { MiniKit } from "@worldcoin/minikit-js";

export async function walletAuth() {
  // 1. 取 nonce
  const res = await fetch("/api/nonce");
  const { nonce } = await res.json();

  // 2. 呼叫官方 MiniKit.walletAuth
  const result = await MiniKit.walletAuth({
    nonce,
    statement: "Sign in to AI 內容工廠",
    expirationTime: new Date(Date.now() + 1000 * 60 * 60),
  });

  if (result.executedWith === "fallback") {
    throw new Error("Not in World App");
  }

  // 3. 後端驗證
  const verify = await fetch("/api/complete-siwe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: result.data, nonce }),
  });
  const { isValid, address } = await verify.json();
  if (!isValid) throw new Error("SIWE verification failed");
  return address;
}
