import { hasDatabase, queryDb } from '@/lib/db';

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

export function getFortuneById(fortuneId: string) {
  return fortunePool.find((f) => f.id === fortuneId) ?? null;
}

export async function getTodayDraw(userId: string, dateKey = toDateKey()) {
  if (!hasDatabase) {
    return draws.get(drawKey(userId, dateKey)) ?? null;
  }

  const result = await queryDb<UserDraw>(
    `select user_id as "userId", date_key as "dateKey", fortune_id as "fortuneId", created_at as "createdAt"
     from user_draws where user_id = $1 and date_key = $2 limit 1`,
    [userId, dateKey],
  );

  return result.rows[0] ?? null;
}

export async function drawToday(userId: string, dateKey = toDateKey()) {
  const existing = await getTodayDraw(userId, dateKey);
  if (existing) return existing;

  const seed = `${userId}:${dateKey}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const picked = fortunePool[seed % fortunePool.length];

  const newDraw: UserDraw = {
    userId,
    dateKey,
    fortuneId: picked.id,
    createdAt: new Date().toISOString(),
  };

  if (!hasDatabase) {
    draws.set(drawKey(userId, dateKey), newDraw);
    const current = drawsByUser.get(userId) ?? [];
    drawsByUser.set(userId, [newDraw, ...current].slice(0, 30));
    return newDraw;
  }

  await queryDb(
    `insert into user_draws(user_id, date_key, fortune_id)
     values ($1, $2, $3)
     on conflict (user_id, date_key) do nothing`,
    [userId, dateKey, picked.id],
  );

  const inserted = await getTodayDraw(userId, dateKey);
  return inserted ?? newDraw;
}

export async function getHistory(userId: string, limit = 7) {
  if (!hasDatabase) {
    return (drawsByUser.get(userId) ?? []).slice(0, limit);
  }

  const result = await queryDb<UserDraw>(
    `select user_id as "userId", date_key as "dateKey", fortune_id as "fortuneId", created_at as "createdAt"
     from user_draws where user_id = $1 order by date_key desc limit $2`,
    [userId, limit],
  );

  return result.rows;
}

export async function upsertEntitlement(input: Entitlement) {
  if (!hasDatabase) {
    entitlements.set(drawKey(input.userId, input.dateKey), input);
    return input;
  }

  await queryDb(
    `insert into entitlements(user_id, date_key, type, status, payment_tx_id)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, date_key, type)
     do update set status = excluded.status, payment_tx_id = excluded.payment_tx_id, updated_at = now()`,
    [input.userId, input.dateKey, input.type, input.status, input.paymentTxId],
  );

  return input;
}

export async function getEntitlement(userId: string, dateKey = toDateKey()) {
  if (!hasDatabase) {
    return entitlements.get(drawKey(userId, dateKey)) ?? null;
  }

  const result = await queryDb<Entitlement>(
    `select user_id as "userId", date_key as "dateKey", type, status, payment_tx_id as "paymentTxId"
     from entitlements
     where user_id = $1 and date_key = $2 and type = 'daily_deep_read'
     limit 1`,
    [userId, dateKey],
  );

  return result.rows[0] ?? null;
}
