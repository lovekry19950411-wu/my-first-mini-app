"use client";
import { walletAuth } from "@/auth/wallet";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useEffect, useRef, useState } from "react";

export const AuthButton = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();
  const hasAttemptedAuth = useRef(false);

  const doAuth = useCallback(async () => {
    if (!isInstalled || isPending) return;
    setIsPending(true);
    try {
      await walletAuth();
      onSuccess?.();
    } catch (error) {
      console.error("Wallet auth error", error);
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, isPending, onSuccess]);

  useEffect(() => {
    if (isInstalled === true && !hasAttemptedAuth.current) {
      hasAttemptedAuth.current = true;
      doAuth();
    }
  }, [isInstalled, doAuth]);

  return (
    <LiveFeedback
      label={{ failed: "登入失敗", pending: "登入中...", success: "已登入" }}
      state={isPending ? "pending" : undefined}
    >
      <Button onClick={doAuth} disabled={isPending} size="lg" variant="primary">
        用 World App 登入
      </Button>
    </LiveFeedback>
  );
};
