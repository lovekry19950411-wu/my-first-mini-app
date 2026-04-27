# Fortune Loop 實際部署 Runbook（可直接照做）

> 先講重點：**你現在這版可以上線測試，但不建議當最終正式版長期營運**，因為目前抽卡與付款解鎖狀態使用 in-memory store，重啟服務會清空。

## 0) 你要先準備

1. Vercel 帳號（建議）
2. World Developer Portal 的 `APP_ID / RP_SIGNING_KEY / RP_ID`
3. 產生 `AUTH_SECRET` 與 `HMAC_SECRET_KEY`

```bash
openssl rand -base64 32
```

---

## 1) 本機先驗證（一定要先做）

```bash
npm install
cp .env.sample .env.local
npm run dev
```

把 `.env.local` 至少補齊：

- `AUTH_SECRET`
- `HMAC_SECRET_KEY`
- `AUTH_URL`（本機可先放 `http://localhost:3000`）
- `NEXT_PUBLIC_APP_ID`
- `RP_SIGNING_KEY`
- `RP_ID`

### 本機 smoke test（直接複製）

```bash
curl -X POST http://localhost:3000/api/fortune/draw -H 'x-demo-user: demo-alice'
curl http://localhost:3000/api/fortune/today -H 'x-demo-user: demo-alice'
curl -X POST http://localhost:3000/api/pay/unlock -H 'x-demo-user: demo-alice'
curl 'http://localhost:3000/api/fortune/history?limit=7' -H 'x-demo-user: demo-alice'
```

---

## 2) 直接部署到 Vercel（最快）

### 2.1 建專案並連 Git

1. 把 repo push 到 GitHub
2. Vercel -> New Project -> Import 該 repo
3. Framework 選 Next.js（通常自動）

### 2.2 設定環境變數（Production + Preview 都要）

複製以下 key 到 Vercel Project Settings -> Environment Variables：

- `AUTH_SECRET`
- `HMAC_SECRET_KEY`
- `AUTH_URL`（先填你的 Vercel domain，例如 `https://your-app.vercel.app`）
- `NEXT_PUBLIC_APP_ID`
- `RP_SIGNING_KEY`
- `RP_ID`

> 注意：每次換正式網域都要同步更新 `AUTH_URL`。

### 2.3 Redeploy

- 儲存 env 後，手動 Redeploy 最新 commit。

---

## 3) 上線後 5 分鐘驗收清單

1. 開啟 `https://your-app.vercel.app`
2. 進入 protected home
3. 點「查今日狀態」
4. 點「今日抽卡」
5. 點「解鎖深度解析」
6. 點「讀取歷史」

若上述 6 步都正常，代表 MVP demo flow 已可對外展示。

---

## 4) 你問的「真的部署」注意事項（非常重要）

### 現況可部署，但屬 Demo 部署

- 目前 `src/lib/fortune-store.ts` 是 in-memory，**不具備正式資料持久化**。
- Vercel 無伺服器環境會冷啟動，資料可能重置。

### 要變正式版，請先做這 3 件事

1. 把 draw / history / entitlement 改存 DB（Postgres/Supabase/PlanetScale 擇一）
2. 付款 webhook 改成驗簽 + 冪等
3. 把 `x-demo-user` 改為真正 session user id 映射

---

## 5) 你現在最短路徑（建議）

- 今天：先按上面流程部署 `Demo 上線版`
- 明天：我幫你做 DB migration + webhook 驗簽
- 後天：補齊提審材料並送審

