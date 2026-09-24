import { getDb } from './mongo';

export type AuditEvent = {
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'denied' | 'failure';
  metadata?: Record<string, string | number | boolean>;
};

export async function audit(event: AuditEvent): Promise<void> {
  try {
    const db = await getDb();
    await db.collection('audit_logs').insertOne({
      ...event,
      createdAt: new Date(),
    });
  } catch (error) {
    // Audit failures must not leak PHI or break the user request.
    console.error('Audit write failed');
  }
}
