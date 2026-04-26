"use client";
import { useState } from "react";
import {
  ConnectButton,
  sendTransaction,
  prepareContractCall,
} from "thirdweb/react";
import { parseEther } from "thirdweb/utils";

const RECIPIENT = "0x8bfe4647304e9564c48f4457e5082275f200042f";
const ERC20_OPTIONS = [
  { symbol: "ETH", name: "Ethereum", decimals: 18, address: undefined },
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
];

export default function TipBox() {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(ERC20_OPTIONS[0]);
  const [status, setStatus] = useState("");

  const handleTip = async () => {
    if (!amount) return alert("請輸入金額");
    setStatus("發送中...");
    try {
      if (token.symbol === "ETH") {
        await sendTransaction({ to: RECIPIENT, value: parseEther(amount) });
      } else {
        const raw = BigInt(Math.floor(Number(amount) * 10 ** token.decimals));
        await prepareContractCall({
          to: token.address,
          method: "function transfer(address to, uint256 amount)",
          params: [RECIPIENT, raw],
        });
      }
      setStatus("打賞發送完成！請等待區塊確認");
    } catch (e) {
      setStatus("錯誤：" + (e?.message || e));
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #eee",
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <ConnectButton />
      <h2>詩籤打賞：即時支持我！</h2>
      <select
        value={token.symbol}
        onChange={(e) =>
          setToken(
            ERC20_OPTIONS.find((t) => t.symbol === e.target.value) as any,
          )
        }
        style={{ marginBottom: 10 }}
      >
        {ERC20_OPTIONS.map((t) => (
          <option value={t.symbol} key={t.symbol}>
            {t.symbol}
          </option>
        ))}
      </select>
      <br />
      <input
        type="number"
        placeholder={token.symbol + " 金額"}
        min="0.0001"
        step="any"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: 180, marginRight: 8 }}
      />
      <button
        onClick={handleTip}
        style={{ padding: "4px 12px", marginBottom: 12 }}
      >
        打賞 {token.symbol}
      </button>
      <div>{status}</div>
      <div style={{ marginTop: 14, fontSize: 12, color: "#888" }}>
        收款錢包:
        <br />
        <strong>{RECIPIENT}</strong>
      </div>
    </div>
  );
}
