export type Fortune = {
  id: string;
  code: string;
  titleZh: string;
  bodyZh: string;
  actionZh: string;
  rarity: 'common' | 'rare';
};

export type UserDraw = {
  userId: string;
  dateKey: string;
  fortuneId: string;
  createdAt: string;
};

export type Entitlement = {
  userId: string;
  dateKey: string;
  type: 'daily_deep_read';
  status: 'pending' | 'active' | 'refunded';
  paymentTxId: string;
};

const fortunePool: Fortune[] = [
  {
    id: 'f001',
    code: 'BREEZE',
    titleZh: '風輕雲淡',
    bodyZh: '風輕雲淡，心自安然。',
    actionZh: '今天花 10 分鐘整理一個讓你焦慮的小角落。',
    rarity: 'common',
  },
  {
    id: 'f002',
    code: 'SUNRISE',
    titleZh: '旭日初升',
    bodyZh: '新光已現，貴在啟程。',
    actionZh: '完成一件你拖延超過 3 天的任務。',
    rarity: 'common',
  },
  {
    id: 'f003',
    code: 'LOTUS',
    titleZh: '蓮開靜水',
    bodyZh: '不急不躁，自有回響。',
    actionZh: '今天減少一次衝動消費，改成記錄心情。',
    rarity: 'rare',
  },
];

const draws = new Map<string, UserDraw>();
const drawsByUser = new Map<string, UserDraw[]>();
const entitlements = new Map<string, Entitlement>();

export const toDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

const drawKey = (userId: string, dateKey: string) => `${userId}:${dateKey}`;

export function getTodayDraw(userId: string, dateKey = toDateKey()) {
  return draws.get(drawKey(userId, dateKey)) ?? null;
}

export function drawToday(userId: string, dateKey = toDateKey()) {
  const existing = getTodayDraw(userId, dateKey);
  if (existing) return existing;

  const seed = `${userId}:${dateKey}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const picked = fortunePool[seed % fortunePool.length];

  const newDraw: UserDraw = {
    userId,
    dateKey,
    fortuneId: picked.id,
    createdAt: new Date().toISOString(),
  };

  draws.set(drawKey(userId, dateKey), newDraw);
  const current = drawsByUser.get(userId) ?? [];
  drawsByUser.set(userId, [newDraw, ...current].slice(0, 30));

  return newDraw;
}

export function getFortuneById(fortuneId: string) {
  return fortunePool.find((f) => f.id === fortuneId) ?? null;
}

export function getHistory(userId: string, limit = 7) {
  return (drawsByUser.get(userId) ?? []).slice(0, limit);
}

export function upsertEntitlement(input: Entitlement) {
  entitlements.set(drawKey(input.userId, input.dateKey), input);
  return input;
}

export function getEntitlement(userId: string, dateKey = toDateKey()) {
  return entitlements.get(drawKey(userId, dateKey)) ?? null;
}
