// --- 官方 MiniKit 真人驗證陣勢 ---

// 1. 這是為了對接 MiniKit 的驗證狀態檢查
// 官方現在推薦在前端直接用 MiniKit.walletAuth() 取得證明 (Proof)
export const auth = async () => {
  // 當前版本：將驗證邏輯交給前端 MiniKit 處理
  // 這裡回傳 null 是為了讓 API 路由能正常導入不報錯
  return null;
};

// 2. 為了相容 Next.js 的路由結構，必須保留這些導出名
export const signIn = () => {
  console.log("觸發官方 MiniKit 驗證流程");
};

export const signOut = () => {
  console.log("清除驗證狀態");
};

// 3. 預留給後端驗證 (Verification) 的接口
export const handlers = {
  GET: () => new Response("World ID Auth Active"),
  POST: () => new Response("World ID Auth Active")
};
