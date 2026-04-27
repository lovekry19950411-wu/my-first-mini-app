# 第一步：把抽卡資料改為可持久化（你現在就做這步）

## 你只要做 3 個動作

### 1) 設定 `DATABASE_URL`

本機 `.env.local` 加上：

```bash
DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/DBNAME'
```

### 2) 套用 migration

```bash
psql "$DATABASE_URL" -f db/migrations/001_fortune_loop_init.sql
```

### 3) 啟動驗證

```bash
npm run dev
curl -X POST http://localhost:3000/api/fortune/draw -H 'x-demo-user: demo-alice'
curl http://localhost:3000/api/fortune/today -H 'x-demo-user: demo-alice'
```

如果重啟 server 後資料還在，代表你已完成第 1 步（不再依賴 in-memory）。

---

## 這步已在程式完成的內容

- 新增 `db/migrations/001_fortune_loop_init.sql`
- 新增 `src/lib/db.ts`（讀 `DATABASE_URL`）
- `fortune-store` 已支援：
  - 有 `DATABASE_URL` → 走 Postgres
  - 無 `DATABASE_URL` → 自動 fallback in-memory

