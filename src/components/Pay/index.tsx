"use client";

import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit } from "@worldcoin/minikit-js";
import { Tokens, tokenToDecimals } from "@worldcoin/minikit-js/commands";
import { useState } from "react";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Pay = () => {
  const [buttonState, setButtonState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);
  const [deepInsightUnlocked, setDeepInsightUnlocked] = useState(false);
  const [errorText, setErrorText] = useState("");

  const onClickPay = async () => {
    setButtonState("pending");
    setErrorText("");

    try {
      const initRes = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: "world-user" }),
      });

      if (!initRes.ok) {
        throw new Error("Unable to initialize payment.");
      }

      const { amount, recipient, reference } = (await initRes.json()) as {
        amount: string;
        recipient: string;
        reference: string;
      };

      const payResult = await MiniKit.pay({
        description: "Unlock deep fortune analysis",
        reference,
        to: recipient,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(
              Number(amount),
              Tokens.WLD,
            ).toString(),
          },
        ],
      });

      await fetch("/api/pay/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          transactionHash:
            (payResult as { data?: { transaction_id?: string } }).data
              ?.transaction_id ?? undefined,
        }),
      });

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const statusRes = await fetch(`/api/pay/status?reference=${reference}`);
        if (!statusRes.ok) {
          await wait(600);
          continue;
        }

        const { payment } = (await statusRes.json()) as {
          payment: { status: "pending" | "paid" | "failed" };
        };

        if (payment.status === "paid") {
          setDeepInsightUnlocked(true);
          setButtonState("success");
          return;
        }

        if (payment.status === "failed") {
          throw new Error("Payment was rejected.");
        }

        await wait(600);
      }

      throw new Error(
        "Payment submitted. Waiting for webhook confirmation, please try again shortly.",
      );
    } catch (error) {
      setButtonState("failed");
      setDeepInsightUnlocked(false);
      setErrorText(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
      );
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">解鎖深度解析（0.01 WLD）</p>
      <LiveFeedback
        label={{
          failed: "解鎖失敗",
          pending: "支付進行中",
          success: "解鎖成功",
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickPay}
          disabled={buttonState === "pending" || deepInsightUnlocked}
          size="lg"
          variant="primary"
          className="w-full"
        >
          {deepInsightUnlocked ? "已解鎖深度解析" : "解鎖深度解析"}
        </Button>
      </LiveFeedback>

      {errorText ? <p className="text-sm text-red-500">{errorText}</p> : null}

      {deepInsightUnlocked ? (
        <div className="rounded-2xl border border-green-400/40 bg-green-400/10 p-4 text-sm">
          深度解析：你今天屬於「穩健上升」運勢，適合把大目標切成 2–3
          個可執行小步驟， 晚上回顧時你會看到非常清楚的進展。
        </div>
      ) : null}
    </div>
  );
};
