import { MongoClient, Db } from 'mongodb';
import { requireEnv, optionalEnv } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;
let indexesReady = false;

function getClientPromise(): Promise<MongoClient> {
  if (global._mongoClientPromise) {
    return global._mongoClientPromise;
  }

  const uri = requireEnv('MONGODB_URI');
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  });

  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const database = client.db(optionalEnv('MONGODB_DB') || 'easymedpro');
  if (!indexesReady) {
    try {
      await Promise.all([
        database.collection('patients').createIndex({ patientId: 1 }, { unique: true, sparse: true }),
        database.collection('doctors').createIndex({ doctorId: 1 }, { unique: true, sparse: true }),
        database.collection('ashaworkers').createIndex({ ashaId: 1 }, { unique: true, sparse: true }),
        database.collection('abha_sessions').createIndex({ userId: 1 }, { unique: true }),
        database.collection('abha_sessions').createIndex({ updatedAt: 1 }),
        database.collection('audit_logs').createIndex({ timestamp: -1 }),
        database.collection('audit_logs').createIndex({ action: 1, createdAt: -1 }),
        database.collection('rate_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
      indexesReady = true;
    } catch {
      indexesReady = true;
    }
  }
  return database;
}
