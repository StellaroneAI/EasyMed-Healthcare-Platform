import { getDb } from './mongo.js';

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

export async function auditPhiRead(params: {
  actorId: string;
  actorRole: string;
  resourceType: 'vitals' | 'medications' | 'medical_records' | 'patient_profile';
  patientId: string;
  recordCount?: number;
}): Promise<void> {
  return audit({
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: `${params.resourceType}.read`,
    resource: params.resourceType,
    resourceId: params.patientId,
    outcome: 'success',
    metadata: {
      patientId: params.patientId,
      recordCount: params.recordCount ?? 0,
    },
  });
}
