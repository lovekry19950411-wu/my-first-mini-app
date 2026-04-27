## Create a Mini App

[Mini apps](https://docs.worldcoin.org/mini-apps) enable third-party developers to create native-like applications within World App.

This template is a way for you to quickly get started with authentication and examples of some of the trickier commands.

## Getting Started

1. cp .env.sample .env.local
2. Follow the instructions in the .env.local file
3. Run `npm run dev`
4. Run `ngrok http 3000`
5. Set `AUTH_SECRET` in the `.env.local` file to a secure random value, for example with `openssl rand -base64 32`.
6. [For Testing] If you're using a proxy like ngrok, update `AUTH_URL` in the `.env.local` file to your ngrok URL.
7. Continue to developer.worldcoin.org and make sure your app is connected to the right ngrok url
8. [Optional] For Verify and Send Transaction to work you need to do some more setup in the dev portal. The steps are outlined in the respective component files.

## 合併兩個專案（你的情境：env 都準備好了）

如果你已經有另一個舊專案，想把功能合進這個 `my-first-mini-app`，建議用「功能搬移 + 設定對齊」的方式，不要直接把兩個資料夾硬拷貝覆蓋。

### 1) 先決定誰是主專案

以目前這個 repo 當主專案（保留目前的 Next.js / World Mini App 結構），把另一個專案的功能逐步搬進來。

### 2) 先統一環境變數（避免名稱打架）

你貼的這組值裡，最常見衝突是：

- `NEXTAUTH_SECRET` 和 `AUTH_SECRET` 可能語意重疊
- `NEXTAUTH_URL` 和 `AUTH_URL` 可能都在描述 callback/base URL

建議策略：

- 若程式碼使用 `next-auth` v5 +你現有實作，優先保留目前 repo 已讀取的 key 名稱
- 不確定時先在專案內搜尋：`process.env.`，確認實際被讀取的是哪些 key
- `.env.local` 最終只保留「實際有被程式讀取」的變數，避免日後混亂

### 3) 分三層搬移（不要一次全搬）

1. **UI 層**：先搬 `components` / `page`，確認畫面可跑
2. **API 層**：再搬 `src/app/api/**/route.ts`
3. **資料層**：最後搬 DB schema、SQL migration、server helpers

每搬一層就跑一次：

```bash
npm run dev
```

確認能啟動再繼續下一層。

### 4) 路由衝突先解掉

如果兩邊都有同名路由（例如 `/api/auth/*`、`/home`），先保留一邊，再把另一邊改名成：

- `/api/legacy/...`（暫存舊邏輯）
- 或 `/api/v2/...`（新邏輯）

等功能驗證完成，再清理舊路由。

### 5) 用 Git 做「可回滾」合併

建議流程：

```bash
git checkout -b chore/merge-project-b
# 小步搬移（一次搬一個功能）
git add .
git commit -m "chore: migrate <feature-name> from project-b"
```

這樣任何一步壞掉都能快速回退。

### 6) 你的這組 env 可以先這樣落地

- 保留 `NEXTAUTH_URL`、`NEXTAUTH_TRUST_HOST`、`NEXTAUTH_SECRET`
- 若目前程式也讀 `AUTH_SECRET`，先讓 `AUTH_SECRET` 與 `NEXTAUTH_SECRET` 用同一值（你現在就是這樣）
- `DATABASE_URL` 補上真實連線字串後，再啟用 DB migration

> 注意：你訊息最後的 `AUTH_SECRET=...DATABASE_URL=...` 少了一個換行。請分成兩行，不然 `.env` 會解析錯誤。

## 第三方會員系統（你說的「第三網會員功能」）要怎麼提供給我

你可以直接照下面提供，我就能幫你把「付款成功 -> 自動開通會員」完整接起來。

你提到的 **WLD 99 成長方案（thirdweb 會員）是可用的**，但它主要影響 thirdweb API 額度/優惠，**不會自動替代 MiniKit 的支付驗證流程**。

> 另外你截圖裡有露出 `x-client-id`，建議現在就去 thirdweb 後台重新產生（rotate）一組新的 key。

### 如果你要我直接接 thirdweb，請再補這 4 個值

- `THIRDWEB_CLIENT_ID`
- `THIRDWEB_SECRET_KEY`（只放伺服器，不可放前端）
- `THIRDWEB_API_BASE`（通常 `https://api.thirdweb.com`）
- 你要呼叫的「會員升級 endpoint」路徑與 body 範例

### 你要提供的 6 個資訊（照抄模板填空）

1. **會員系統 API Base URL**
   - 例如：`https://api.your-membership.com`
2. **建立/更新會員的 API 文件**
   - Endpoint、Method、Request/Response JSON、錯誤碼
3. **API 認證方式**
   - Bearer Token / API Key / HMAC（請說明 Header 名稱）
4. **會員唯一識別欄位**
   - 用 `walletAddress` 還是 `worldUserId` 當主鍵
5. **付款成功後要開通的方案代碼**
   - 例如：`PLAN_DEEP_ANALYSIS_MONTHLY`
6. **Webhook 驗簽規則**
   - 簽名演算法、header 名稱、範例 payload

### 建議你貼給我的格式（可直接複製）

```txt
[Membership API]
BASE_URL=
AUTH_TYPE=Bearer
AUTH_HEADER=Authorization
API_KEY=

[Upsert Endpoint]
METHOD=POST
PATH=/v1/memberships/upsert
BODY_EXAMPLE={"userId":"...","plan":"PLAN_DEEP_ANALYSIS_MONTHLY","expiresAt":"..."}

[Identity Mapping]
PRIMARY_KEY=worldUserId
FALLBACK_KEY=walletAddress

[Webhook]
SIGNATURE_HEADER=
SIGNATURE_ALGO=
WEBHOOK_SAMPLE={...}
```

### 安全提醒（很重要）

- **不要提供私鑰/助記詞**。
- 可提供 API key，但建議先開一組「最小權限、可隨時撤銷」的測試 key。
- 正式上線前我會再幫你把 key 全部改讀 `.env.local`，不寫死在程式碼。

### 我拿到資料後會做什麼

1. 在 `src/app/api/pay/webhook/route.ts` 加入付款成功後的會員開通呼叫。
2. 加入重試與冪等（避免 webhook 重送重複開通）。
3. 把結果回寫到資料庫（取代目前 in-memory）。
4. 提供你一鍵 smoke test 清單（你直接貼指令就能驗證）。

## Authentication

This starter kit uses [Minikit's](https://github.com/worldcoin/minikit-js) wallet auth to authenticate users, and [next-auth](https://authjs.dev/getting-started) to manage sessions.

## UI Library

This starter kit uses [Mini Apps UI Kit](https://github.com/worldcoin/mini-apps-ui-kit) to style the app. We recommend using the UI kit to make sure you are compliant with [World App's design system](https://docs.world.org/mini-apps/design/app-guidelines).

## Eruda

[Eruda](https://github.com/liriliri/eruda) is a tool that allows you to inspect the console while building as a mini app. You should disable this in production.

## Contributing

This template was made with help from the amazing [supercorp-ai](https://github.com/supercorp-ai) team.
