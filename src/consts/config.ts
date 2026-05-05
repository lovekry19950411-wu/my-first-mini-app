export const NXZ_CONFIG = {
  APP_ID:
    process.env.NEXT_PUBLIC_APP_ID ?? "app_4371589d806a9326eb5e83cd5f8271f7",
  ACTION: process.env.NEXT_PUBLIC_ACTION ?? "nxz-launch-verify",

  TREASURY_ADDRESS:
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS ??
    "0x44302e487C0034eeA27Fa3e35D9AC5B75d4f8151",
  
  // 方案參數
  PREMIUM_FEE_WLD: "5", // 精英方案費用
  COMMANDER_SHARE: 0.1,  // 指揮官(你)固定持股 10%
  TRADING_TAX_BUY: 0.03, // 買入稅 3%
  TRADING_TAX_SELL: 0.07 // 賣出稅 7%
};