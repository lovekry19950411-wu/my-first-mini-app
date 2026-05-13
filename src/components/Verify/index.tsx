'use client';
import { IDKit, orbLegacy, type RpContext } from '@worldcoin/idkit';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';

/**
 * This component is an example of how to use World ID verification via IDKit.
 * Verification now goes through IDKit end-to-end (both native World App and web).
 * It's critical you verify the proof on the server side.
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export const Verify = ({ action }: { action: string }) => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onClickVerify = async () => {
    setButtonState('pending');
    setErrorMessage(null);
    try {
      // Fetch RP signature from your backend
      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!rpRes.ok) {
        let msg = '無法取得伺服器簽章';
        try {
          const data = await rpRes.json();
          if (data?.error && typeof data.error === 'string') msg = data.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const rpSig = await rpRes.json();
      const rpContext: RpContext = {
        rp_id: rpSig.rp_id,
        nonce: rpSig.nonce,
        created_at: rpSig.created_at,
        expires_at: rpSig.expires_at,
        signature: rpSig.sig,
      };

      // Use IDKit request API
      const request = await IDKit.request({
        app_id: process.env.NEXT_PUBLIC_APP_ID as `app_${string}`,
        action,
        rp_context: rpContext,
        allow_legacy_proofs: true,
      }).preset(orbLegacy({ signal: '' }));

      const completion = await request.pollUntilCompletion();

      if (!completion.success) {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 2000);
        return;
      }

      // Verify the proof on the server
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rp_id: rpSig.rp_id,
          idkitResponse: completion.result,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setButtonState('success');
      } else {
        setButtonState('failed');
        setErrorMessage(
          typeof data?.error === 'string' ? data.error : '驗證失敗',
        );
        setTimeout(() => setButtonState(undefined), 2000);
      }
    } catch (e) {
      setButtonState('failed');
      setErrorMessage(e instanceof Error ? e.message : '驗證失敗');
      setTimeout(() => setButtonState(undefined), 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">World ID 真人驗證</p>
      <p className="text-sm text-gray-500">
        使用官方 IDKit 流程，證明會在伺服器端再次確認。
      </p>
      {errorMessage ? (
        <p className="text-sm text-red-500">{errorMessage}</p>
      ) : null}
      <LiveFeedback
        label={{
          failed: '驗證失敗',
          pending: '驗證中…',
          success: '已驗證',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickVerify}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          使用 World ID 驗證
        </Button>
      </LiveFeedback>
    </div>
  );
};
