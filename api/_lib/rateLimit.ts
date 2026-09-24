import { getDb } from './mongo';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function enforceRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / WINDOW_MS) * WINDOW_MS;
  const windowEndMs = windowStartMs + WINDOW_MS;
  const bucketKey = `${key}:${windowStartMs}`;
  const expiresAt = new Date(windowEndMs + 60_000);

  const db = await getDb();
  const result = await db.collection('rate_limits').findOneAndUpdate(
    { _id: bucketKey },
    {
      $inc: { count: 1 },
      $setOnInsert: { key, windowStart: new Date(windowStartMs), expiresAt },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const count = Number(result?.count || 1);
  if (count <= MAX_ATTEMPTS) return { allowed: true, retryAfterSeconds: 0 };

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((windowEndMs - nowMs) / 1000)),
  };
}
