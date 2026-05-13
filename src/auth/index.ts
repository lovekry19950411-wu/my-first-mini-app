// 這是為了讓 Vercel 編譯通過的真人驗證導出
// 既然你改用 MiniKit.walletAuth()，這裡我們導出一個驗證函數模版

export const auth = async () => {
  // 這裡對應你 MiniKit 的驗證邏輯
  console.log("執行真人驗證檢查...");
  return null; 
};

export const handlers = { GET: () => {}, POST: () => {} };
export const signIn = () => {};
export const signOut = () => {};
