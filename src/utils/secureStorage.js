// Secure storage utility using AES-GCM encryption.
// Note: Client-only encryption protects against casual inspection but cannot defend against XSS.

const MASTER_KEY_STORAGE_KEY = 'ss_master_key_v1';

function toBase64(arr) {
  if (typeof Buffer !== 'undefined') return Buffer.from(arr).toString('base64');
  let binary = '';
  const bytes = new Uint8Array(arr);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64) {
  if (!b64) return new Uint8Array();
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getOrCreateCryptoKey() {
  // Cache on module scope for performance
  if (getOrCreateCryptoKey._cached) return getOrCreateCryptoKey._cached;

  let rawKeyB64 = localStorage.getItem(MASTER_KEY_STORAGE_KEY);
  if (!rawKeyB64) {
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    rawKeyB64 = toBase64(raw);
    localStorage.setItem(MASTER_KEY_STORAGE_KEY, rawKeyB64);
  }
  const rawKey = fromBase64(rawKeyB64);
  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  getOrCreateCryptoKey._cached = key;
  return key;
}

async function encryptString(plainText) {
  const key = await getOrCreateCryptoKey();
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const enc = new TextEncoder().encode(plainText);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
  const ivB64 = toBase64(iv);
  const ctB64 = toBase64(new Uint8Array(cipherBuf));
  return `${ivB64}.${ctB64}`;
}

async function decryptString(payload) {
  if (!payload || typeof payload !== 'string') return null;
  const [ivB64, ctB64] = payload.split('.');
  if (!ivB64 || !ctB64) return null;
  const key = await getOrCreateCryptoKey();
  const iv = fromBase64(ivB64);
  const ct = fromBase64(ctB64);
  try {
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(plainBuf);
  } catch (e) {
    // Not encrypted or corrupted
    return null;
  }
}

export const secureStorage = {
  async setItem(key, value) {
    const enc = await encryptString(String(value));
    localStorage.setItem(key, enc);
  },
  async getItem(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const dec = await decryptString(raw);
    if (dec !== null) return dec;
    // Attempt migration from legacy plain storage
    try {
      await this.setItem(key, raw);
    } catch {}
    return raw;
  },
  async removeItem(key) {
    localStorage.removeItem(key);
  },
  async setJSON(key, obj) {
    const json = JSON.stringify(obj);
    await this.setItem(key, json);
  },
  async getJSON(key) {
    const str = await this.getItem(key);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
};

export default secureStorage;
