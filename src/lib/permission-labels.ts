/** World App 權限代碼 → 繁體中文說明（未知代碼會 fallback 顯示原碼） */
export function permissionLabelZh(key: string): string {
  const map: Record<string, string> = {
    notifications: '推播通知',
    contacts: '聯絡人',
    microphone: '麥克風',
    camera: '相機',
    location: '位置',
    clipboard: '剪貼簿',
    username: '使用者名稱',
    profile: '個人檔案',
    wallet: '錢包',
  };
  return map[key] ?? key;
}
