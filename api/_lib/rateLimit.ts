import { getDb } from './mongo';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function enforceRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const db = await getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WINDOW_MS);
  const result = await db.collection('rate_limits').findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 }, $setOnInsert: { key, count: 1, expiresAt } },
    { upsert: true, returnDocument: 'after' },
  );
  const count = result?.count || 1;
  if (count <= MAX_ATTEMPTS) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.ceil((new Date(result!.expiresAt).getTime() - now.getTime()) / 1000) };
}
