import { database } from '@/lib/firebase';
import { get, ref, remove, set, update } from 'firebase/database';

export type PasswordAccount = {
  email: string;
  salt: string;
  passwordHash: string;
  disabled: boolean;
  createdAt: string;
};

const iterations = 210_000;
const encoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function accountKey(email: string) {
  return bytesToBase64(encoder.encode(email.trim().toLowerCase())).replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '');
}

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

export async function verifyPasswordAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const snapshot = await get(ref(database, `passwordUsers/${accountKey(normalizedEmail)}`));
  if (!snapshot.exists()) return false;
  const account = snapshot.val() as PasswordAccount;
  if (account.disabled || account.email !== normalizedEmail) return false;
  return (await hashPassword(password, base64ToBytes(account.salt))) === account.passwordHash;
}

export async function savePasswordAccount(email: string, password: string, existingEmail?: string, disabled = false) {
  const normalizedEmail = email.trim().toLowerCase();
  const target = ref(database, `passwordUsers/${accountKey(normalizedEmail)}`);
  if (existingEmail && !password) {
    const oldKey = accountKey(existingEmail);
    const snapshot = await get(ref(database, `passwordUsers/${oldKey}`));
    if (!snapshot.exists()) throw new Error('Account no longer exists.');
    const account = snapshot.val() as PasswordAccount;
    await set(target, { ...account, email: normalizedEmail, disabled });
    if (oldKey !== accountKey(normalizedEmail)) await remove(ref(database, `passwordUsers/${oldKey}`));
    return;
  }
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: PasswordAccount = { email: normalizedEmail, salt: bytesToBase64(salt), passwordHash: await hashPassword(password, salt), disabled, createdAt: new Date().toISOString() };
  await set(target, account);
  if (existingEmail && accountKey(existingEmail) !== accountKey(normalizedEmail)) await remove(ref(database, `passwordUsers/${accountKey(existingEmail)}`));
}

export async function setPasswordAccountDisabled(email: string, disabled: boolean) {
  await update(ref(database, `passwordUsers/${accountKey(email)}`), { disabled });
}

export async function deletePasswordAccount(email: string) {
  await remove(ref(database, `passwordUsers/${accountKey(email)}`));
}
