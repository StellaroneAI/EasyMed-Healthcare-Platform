import { MongoClient, Db } from 'mongodb';
import { requireEnv, optionalEnv } from './env';

let client: MongoClient | undefined;
let database: Db | undefined;
let indexesReady = false;

export async function getDb(): Promise<Db> {
  if (database) return database;
  client = new MongoClient(requireEnv('MONGODB_URI'));
  await client.connect();
  database = client.db(optionalEnv('MONGODB_DB') || 'easymedpro');
  if (!indexesReady) {
    await Promise.all([
      database.collection('patients').createIndex({ patientId: 1 }, { unique: true, sparse: true }),
      database.collection('doctors').createIndex({ doctorId: 1 }, { unique: true, sparse: true }),
      database.collection('ashaworkers').createIndex({ ashaId: 1 }, { unique: true, sparse: true }),
      database.collection('abha_sessions').createIndex({ userId: 1 }, { unique: true }),
      database.collection('abha_sessions').createIndex({ updatedAt: 1 }),
      database.collection('audit_logs').createIndex({ timestamp: -1 }),
      database.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    indexesReady = true;
  }
  return database;
}
