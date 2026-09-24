import { MongoClient, Db } from 'mongodb';
import { requireEnv, optionalEnv } from './env';

let client: MongoClient | undefined;
let database: Db | undefined;

export async function getDb(): Promise<Db> {
  if (database) return database;
  client = new MongoClient(requireEnv('MONGODB_URI'));
  await client.connect();
  database = client.db(optionalEnv('MONGODB_DB') || 'easymedpro');
  return database;
}
