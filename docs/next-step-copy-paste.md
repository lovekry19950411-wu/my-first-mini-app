# 下一步（可直接複製貼上）

> 目標：先把「登入後抽卡 → 查看今日結果 → 付費解鎖 → 查歷史」完整跑通。

## 1) 啟動開發環境

```bash
npm install
npm run dev
```

開啟：`http://localhost:3000`

---

## 2) 用 API 先驗證流程（最快）

### 2.1 今日抽卡

```bash
curl -X POST http://localhost:3000/api/fortune/draw \
  -H 'x-demo-user: demo-alice'
```

### 2.2 查今日狀態

```bash
curl 'http://localhost:3000/api/fortune/today' \
  -H 'x-demo-user: demo-alice'
```

### 2.3 解鎖今日深度解析（模擬付款成功）

```bash
curl -X POST http://localhost:3000/api/pay/unlock \
  -H 'x-demo-user: demo-alice'
```

### 2.4 查最近 7 天歷史

```bash
curl 'http://localhost:3000/api/fortune/history?limit=7' \
  -H 'x-demo-user: demo-alice'
```

---

## 3) 前端串接順序（照這個做就好）

1. 首頁按鈕呼叫 `POST /api/fortune/draw`。
2. 抽完後跳結果頁，顯示 `fortune.titleZh/bodyZh/actionZh`。
3. 結果頁「解鎖深度解析」按鈕呼叫 `POST /api/pay/unlock`。
4. 歷史頁呼叫 `GET /api/fortune/history?limit=7`。
5. 設定頁固定放：Terms / Privacy / Contact + 風險聲明。

---

## 4) 你今天要完成的 Done 定義

- [ ] 可以同一位用戶每天只抽 1 次（重覆呼叫會回同一張）
- [ ] 完成解鎖後 `deepReadUnlocked` 會變 `true`
- [ ] History 至少可看到 1 筆以上記錄
- [ ] 條款與隱私頁可從 UI 點擊到

---

## 5) 明天再做（先不要分心）

- 接上真實支付 webhook 驗證簽名
- 接上真實 World ID user mapping
- 補齊 Loading / Empty / Error / Success 四態 UI
