# WLD MINI App 規劃（以最快過審 + 可擴張營收為目標）

## 0. 目標定義

- **短期目標（2–3 週）**：先做出可上架審核、可展示留存、可證明付費行為的 MVP。
- **中期目標（1–2 個月）**：把「每日抽籤」升級成可分享、可回流、可轉化的內容產品。
- **長期目標（3–6 個月）**：加入鏈上權益與合作品牌，形成 B2C + B2B 的雙邊營收。

---

## 1. 建議產品定位：`Fortune Loop`（每日運勢 + 目標行動）

你目前的 UI 方向非常適合做「低門檻高頻次」產品。為了同時滿足過審與後續增長，建議改成：

### 核心價值

1. **每日一次免費籤**：完成登入即可抽取當日卡片。
2. **付費解鎖深度解讀**：透過現有支付模板買「進階解讀」。
3. **行動任務**：每張籤對應 1 個可執行的小任務，提升次日回訪率。
4. **收藏與連續記錄**：形成可見的成長軌跡（streak 與卡片圖鑑）。

### 為什麼這個定位適合你當前狀態

- 你已經有視覺與抽卡概念，前端改造成本低。
- 你已改用官方後端模板且有支付能力，剛好可接「免費 + 付費」雙層模式。
- 內容型產品在審核上通常較容易明確描述用途與合規邊界。

---

## 2. 先過審版 MVP（必要功能清單）

> 原則：**只做審核必需 + 能證明商業可行**。

### 必做功能（P0）

1. **World ID / 官方登入流程**（你已完成，保留）
2. **每日抽取 1 次（免費）**
3. **抽取結果落庫（含日期與 userId）**
4. **付費解鎖「今日深度解讀」**（一次性小額）
5. **歷史紀錄頁（最近 7 天）**
6. **政策頁面可直達**（Privacy / Terms / Contact）
7. **風險文案**：明確標示為娛樂與自我反思用途，非投資/醫療建議

### 可延後（P1）

- 社群分享卡
- 成就徽章
- 推薦返利
- NFT/鏈上憑證

---

## 3. 與現有模板對齊的中後端落位（對標你現有 repo）

以下是「不重構架構」前提下，最省時的落位方式：

### 前端路由層

- `src/app/page.tsx`：首頁（抽卡入口 + 今日狀態）
- `src/home/page.tsx`：可改成儀表板（歷史紀錄、連續天數）
- `src/app/(protected)/layout.tsx`：登入保護與會員態 UI
- `src/app/privacy/page.tsx`、`src/app/terms/page.tsx`：政策頁保留並補全文案

### 功能組件層

- `src/components/Verify/`：登入驗證狀態展示
- `src/components/Pay/`：承接付費解鎖（保留現有支付流程）
- `src/components/Transaction/`：支付結果/交易查詢
- 新增：`src/components/FortuneCard/`、`src/components/FortuneHistory/`

### 服務與資料層（建議新增）

- `src/lib/fortune.ts`：抽籤邏輯、每日去重、卡池規則
- `src/lib/content.ts`：籤文與多語內容（zh/en）
- `src/lib/entitlement.ts`：判斷是否已購買深度解讀
- `src/lib/analytics.ts`：埋點封裝（draw_start / draw_success / pay_success）

### API 層（Next Route Handlers）

- `POST /api/fortune/draw`：抽取今日卡片
- `GET /api/fortune/today`：查今日結果
- `GET /api/fortune/history`：查近 7/30 天
- `POST /api/pay/unlock`：建立付款 intent
- `POST /api/pay/webhook`：支付結果回寫 entitlement

> 這樣做可最大化重用你現有 `Verify / Pay / Transaction` 代碼與流程。

---

## 4. 資料模型（MVP 夠用版）

### `users`
- `id`
- `world_id`（唯一）
- `created_at`

### `fortunes`
- `id`
- `code`（籤文代碼）
- `title_zh` / `title_en`
- `body_zh` / `body_en`
- `action_zh` / `action_en`
- `rarity`

### `user_draws`
- `id`
- `user_id`
- `date_key`（YYYY-MM-DD，唯一約束 user_id + date_key）
- `fortune_id`
- `created_at`

### `entitlements`
- `id`
- `user_id`
- `date_key`
- `type`（`daily_deep_read`）
- `status`（pending / active / refunded）
- `payment_tx_id`

---

## 5. 申請補助/過審導向的交付節奏（建議）

### Week 1：可操作 Demo

- 打通登入 → 抽卡 → 結果展示
- 完成隱私條款與風險說明
- 儲存最近 7 天紀錄

### Week 2：支付與審核材料

- 完成付費解鎖深度解讀
- 上線交易成功/失敗狀態頁
- 準備審核素材（流程截圖、測試帳號、功能說明）

### Week 3：指標與穩定性

- 補齊埋點與漏斗
- 調整文案提升付費率
- 修正審核回饋並二次提審

---

## 6. 合規檢查清單（提交前逐項打勾）

### UX/UI（對應 App Guidelines）

- [ ] Mobile First，首屏可完成核心操作
- [ ] 字級、對比、點擊區域符合可用性
- [ ] 動畫不造成眩暈，且可降級
- [ ] Loading/Empty/Error 三態完整

### 內容與政策（對應 Submission Policy）

- [ ] 不包含誤導性承諾（如保證收益）
- [ ] 不觸及高風險受限內容
- [ ] 品牌與商標使用方式正確
- [ ] Privacy / Terms / Contact 清楚且可訪問

### 鏈上與交易（對應 Smart Contract Guidelines）

- [ ] 交易前有明確金額與用途提示
- [ ] 交易失敗可重試且不重複扣款
- [ ] 關鍵流程有簽名/驗證/防重放機制
- [ ] 交易與 entitlement 狀態一致

---

## 7. 成長與營收路線（避免只靠一次性補助）

### 第 1 層：內容付費

- 單次深度解讀（低客單）
- 7 日主題包 / 月會員（中客單）

### 第 2 層：社交裂變

- 分享「今日行動卡」到社群
- 邀請機制：邀請 1 人解鎖 1 次深度解讀

### 第 3 層：鏈上權益

- 連續打卡鑄造非金融型成就憑證
- 與品牌合作推出聯名主題卡池

### 第 4 層：B2B 化

- 提供「品牌限定卡池」SaaS 能力
- 收取上架費 + 分潤

---

## 8. 你可以直接照做的「明日待辦」

1. 把首頁 CTA 固定為「今日抽籤」單一路徑。
2. 先做 `POST /api/fortune/draw` 與 `GET /api/fortune/today`。
3. 把支付只綁一個 SKU：`daily_deep_read`。
4. 歷史頁先只顯示 7 天，避免範圍蔓延。
5. 完成條款頁中的「非投資/醫療建議」聲明。
6. 做 1 版審核錄屏：登入→抽卡→支付→查看歷史。

---

## 9. KPI（前 30 天）

- D1 留存：> 30%
- 7 日回訪：> 20%
- 付費轉化（抽卡用戶→付費）：3–8%
- 退款率：< 3%
- 客訴率：< 1%

> 若你想要，我下一步可以直接幫你把這份規劃拆成 **可執行 issue 清單（含 API contract 與 DB migration 草案）**，讓你照單開發與提審。

---

## 10. 可直接丟給 UI 生成 AI 的「高品質指令」

> 用法：把下方整段貼給你要使用的 UI 生成工具（如 v0、Lovable、Bolt、Figma AI、Uizard 等），再把輸出截圖/連結回傳。

```txt
你是一位頂級產品設計師 + 前端設計系統專家，請為一個「World Mini App」設計可直接交付開發的高保真 Mobile First 介面（iPhone 390x844 基準），主題為東方禪意「每日運勢卡」。

【產品目標】
- 讓使用者每天 10 秒內完成：登入 → 抽卡 → 看結果 → 決定是否付費解鎖深度解析。
- 需符合 Mini App 上架審核常見要求：清楚導航、政策入口可見、交易前提示透明、錯誤狀態完整。

【風格要求】
- 視覺關鍵字：warm ivory、mist gold、zen paper texture、soft glow。
- 避免過度花俏；以高級、安定、可讀性優先。
- 字體：中文用 Noto Serif TC / 思源宋體（標題）、Noto Sans TC（內文）；英文搭配 Inter。
- 動畫：卡片翻轉 250–350ms、easing 柔和；提供 reduced-motion 版本。

【請輸出 6 個畫面】
1) Home / 今日抽卡（未抽）
2) Draw Result / 今日籤文（已抽）
3) Payment Sheet / 解鎖深度解析（價格、用途、退款說明）
4) Deep Reading / 付費內容頁（含今日行動建議）
5) History / 最近 7 天卡片牆
6) Settings / 條款、隱私、客服入口

【互動與狀態】
- 每個畫面都要有：Loading / Empty / Error / Success。
- 錯誤文案請具體（例如：網路逾時、支付失敗、重複抽卡）。
- CTA 層級清晰：主按鈕 1 個、次按鈕 1 個、文字連結 1–2 個。

【元件規格】
- 8pt spacing system。
- 觸控區最小 44x44。
- 對比至少 AA。
- 主要元件：FortuneCard、PrimaryButton、TabSwitch、PaymentStatusToast、PolicyFooter。

【交付內容】
A. 高保真畫面（可點擊 prototype）
B. Design Tokens（color / radius / shadow / typography / spacing）
C. 每個畫面的元件清單與命名（對應前端實作）
D. 每個畫面的事件埋點建議（view_xxx、click_xxx、pay_xxx）
E. 匯出一份給工程師的 handoff 說明（含尺寸、狀態、互動）

【技術對齊】
- 前端預設 Next.js + Tailwind + TypeScript。
- 請用可對應 React component 的方式命名圖層與元件。
- 不要產出無法工程化的純概念稿。
```

---

## 11. 你可隨取隨分享的「關鍵節點清單」

### A. 產品對外一句話
- **Fortune Loop：每天一次免費運勢卡，付費解鎖深度解析與行動建議。**

### B. 提審必備節點（最小集合）
1. 登入成功（World ID）
2. 每日抽卡成功（僅 1 次）
3. 結果可回看（最近 7 天）
4. 支付解鎖成功（今日深度解析）
5. 條款/隱私/客服入口可達
6. 風險聲明明確（非投資、非醫療）

### C. 技術里程碑（可給工程/PM）
- M1：`/api/fortune/draw` + `/api/fortune/today` 上線
- M2：`/api/fortune/history` + History UI 上線
- M3：`/api/pay/unlock` + `webhook` entitlement 回寫
- M4：漏斗埋點上線（draw_start/draw_success/pay_success）

### D. 商務/補助簡報可用節點
- 核心指標：D1 留存、7 日回訪、付費轉化、退款率
- 合規覆蓋：UX、政策、交易透明度
- 模板對齊：已重用官方登入與支付骨架

### E. 30 秒 Demo 腳本
1. 首頁點「今日抽籤」
2. 顯示籤文與今日行動
3. 點擊解鎖深度解析並完成支付
4. 進歷史頁查看今天卡片
5. 打開條款與隱私頁結束

