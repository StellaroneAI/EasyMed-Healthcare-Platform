import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { requireEnv } from './env.js';

const ALGORITHM = 'aes-256-gcm';
function key(): Buffer {
  const raw = requireEnv('ABHA_TOKEN_ENCRYPTION_KEY');
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error('ABHA_TOKEN_ENCRYPTION_KEY must be 32-byte hex.');
  return Buffer.from(raw, 'hex');
}

export function encryptABHAToken(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return iv.toString('base64url') + '.' + cipher.getAuthTag().toString('base64url') + '.' + encrypted.toString('base64url');
}

export function decryptABHAToken(value: string): string {
  const [iv, tag, encrypted] = value.split('.');
  if (!iv || !tag || !encrypted) throw new Error('Invalid encrypted ABHA token.');
  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}