# 下一步（可直接複製貼上）

> 目標：先把「登入 → 今日抽卡 → 支付解鎖深度解析 → 查看歷史」完整跑通。

## 1) 先填環境變數（重點）

在 `.env` 至少確認以下欄位：

```bash
NEXT_PUBLIC_APP_ID='你的 World Mini App ID'
NEXT_PUBLIC_FORTUNE_RECEIVER='0xC131DA7eEE99105bCC8fA185437D0d608eBe4e20'
PROJECT_VERIFIED_WORLD_APP_WALLET='0x8bfe4647304e9564c48f4457e5082275f200042f'
AUTH_SECRET='任意長隨機字串'
DATABASE_URL='postgres://...'
```

- `NEXT_PUBLIC_FORTUNE_RECEIVER`：**專案收款地址（建議填專案金庫/合約收款地址）**。
- `PROJECT_VERIFIED_WORLD_APP_WALLET`：**真人驗證用錢包**，建議僅用於補助資料與專案身份說明，不作為主收款地址。

---

## 2) 啟動開發環境

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

開啟：`http://localhost:3000`

---

## 3) 實測流程（以 UI 為主）

1. 用 World App 登入（需有有效 session）。
2. 按「查今日狀態」確認尚未抽卡。
3. 按「今日抽卡」。
4. 按「支付解鎖深度解析」：
   - 先建立 unlock intent（pending）
   - 叫起 MiniKit 支付
   - 支付成功後寫回 entitlement=active
5. 回到今日結果，確認「深度解析：已解鎖」並看到「今日行動（深度解析）」。
6. 按「讀取歷史」確認有近 7 天資料。

> 如果你在 macOS：可用 `brew install agent-browser`，再跑 `agent-browser install`。

## 4) 補助申請與收款欄位建議（你目前兩個地址）

- 真人驗證 World App：`0x8bfe4647304e9564c48f4457e5082275f200042f`
- 第三網專案 WLD（建議收款）：`0xC131DA7eEE99105bCC8fA185437D0d608eBe4e20`

**建議填法：**

1. 申請表「Project payout / Treasury / Receiving wallet」：填 `0xC131DA7eEE99105bCC8fA185437D0d608eBe4e20`。
2. 申請表「Founder / Identity / Verified World App wallet」：填 `0x8bfe4647304e9564c48f4457e5082275f200042f`。
3. 如果表單只有一個地址欄位，優先填 **專案收款地址** `0xC131...4e20`，並在備註補上 `0x8bfe...042f` 為身份驗證錢包。

再另開一個終端執行（可先手動登入，再用 profile 保留 session）：

## 5) 今日 Done 定義

- [ ] 登入後可以抽卡且每天同一人只抽 1 次
- [ ] 深度解析預設不可見，支付成功後才可見
- [ ] 收款地址不是零地址（必填）
- [ ] 歷史頁可看到至少 1 筆資料
