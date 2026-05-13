'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { Tokens, tokenToDecimals } from '@worldcoin/minikit-js/commands';
import { useState } from 'react';

/**
 * This component is used to pay a user
 * The payment command simply does an ERC20 transfer
 * But, it also includes a reference field that you can search for on-chain
 */
export const Pay = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const onClickPay = async () => {
    setButtonState('pending');

    let address: string | undefined;
    try {
      address = (await MiniKit.getUserByUsername('alex')).walletAddress;
    } catch {
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 3000);
      return;
    }

    const res = await fetch('/api/initiate-payment', {
      method: 'POST',
    });
    const { id } = await res.json();

    try {
      const result = await MiniKit.pay({
        reference: id,
        to: address ?? '0x0000000000000000000000000000000000000000',
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: String(tokenToDecimals(0.5, Tokens.WLD)),
          },
          {
            symbol: Tokens.USDC,
            token_amount: String(tokenToDecimals(0.1, Tokens.USDC)),
          },
        ],
        description: 'Mini App 支付功能示範',
      });

      if (
        result.executedWith === 'minikit' &&
        result.data &&
        'transactionId' in result.data
      ) {
        console.log(result.data);
        setButtonState('success');
      } else {
        setButtonState('failed');
        setTimeout(() => setButtonState(undefined), 3000);
      }
      // It's important to actually check the transaction result on-chain
      // You should confirm the reference id matches for security
      // Read more here: https://docs.world.org/mini-apps/commands/pay#verifying-the-payment
    } catch {
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">MiniKit 支付（範例）</p>
      <p className="text-sm text-gray-500">
        示範 WLD／USDC 支付流程，實際上線前請改為你的收款地址與金額。
      </p>
      <LiveFeedback
        label={{
          failed: '支付失敗',
          pending: '支付處理中…',
          success: '支付成功',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickPay}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          立即支付
        </Button>
      </LiveFeedback>
    </div>
  );
};
