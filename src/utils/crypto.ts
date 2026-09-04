/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Client-Side Encryption Utility for Mehfooz Private Incident Vault
 * Uses Web Crypto API AES-GCM (256-bit) with PBKDF2 key derivation.
 *
 * SECURITY MODEL (zero-knowledge, fail-closed):
 * - There is NO default passcode. Every encryption requires a user-supplied
 *   passcode (typically derived from the user's stealth PIN or a dedicated
 *   vault passphrase).
 * - The PBKDF2 salt is a per-user random value (never the old static string).
 * - If Web Crypto is unavailable (e.g. restricted iframe contexts), the
 *   utilities FAIL CLOSED with an explicit error instead of storing
 *   pseudo-encrypted base64 data.
 */

const VAULT_SALT_STORAGE_KEY = 'mehfooz_vault_salt_v2';
const PBKDF2_ITERATIONS = 100000;

let cachedKey: CryptoKey | null = null;
let cachedKeyFingerprint = '';

function assertWebCryptoAvailable(): void {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error(
      'Secure Web Crypto API is unavailable in this context. Vault encryption is disabled rather than storing unencrypted data.'
    );
  }
}

/** Generates a cryptographically random salt (base64). */
export function generateRandomSalt(): string {
  assertWebCryptoAvailable();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Persists the per-user vault salt locally (also mirrored to profiles.vault_salt in Supabase). */
export function setVaultSalt(salt: string): void {
  try {
    localStorage.setItem(VAULT_SALT_STORAGE_KEY, salt);
  } catch (err) {
    console.warn('Failed to persist vault salt:', err);
  }
}

/** Reads the per-user vault salt, generating one on first use. */
export function getVaultSalt(): string {
  try {
    const existing = localStorage.getItem(VAULT_SALT_STORAGE_KEY);
    if (existing && existing.length >= 32) return existing;
  } catch {
    // fall through to generation
  }
  const fresh = generateRandomSalt();
  setVaultSalt(fresh);
  return fresh;
}

async function getDerivedKey(passcode: string, salt: string): Promise<CryptoKey> {
  assertWebCryptoAvailable();
  const fingerprint = `${salt}:${passcode.length}`;
  if (cachedKey && cachedKeyFingerprint === fingerprint) return cachedKey;

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  cachedKey = key;
  cachedKeyFingerprint = fingerprint;
  return key;
}

/**
 * Encrypts plaintext with AES-GCM-256 using a user-supplied passcode.
 * Throws (fail-closed) if no passcode is provided or Web Crypto is unavailable.
 */
export async function encryptLocalData(
  plainText: string,
  passcode: string
): Promise<{ cipherText: string; iv: string; salt: string }> {
  if (!passcode) {
    throw new Error('Vault passcode is required. Refusing to encrypt with an empty key.');
  }
  assertWebCryptoAvailable();

  const salt = getVaultSalt();
  const key = await getDerivedKey(passcode, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  const cipherArray = Array.from(new Uint8Array(encryptedBuffer));
  const cipherText = btoa(String.fromCharCode.apply(null, cipherArray));
  const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)));

  return { cipherText, iv: ivBase64, salt };
}

/**
 * Decrypts AES-GCM-256 ciphertext with a user-supplied passcode.
 * Throws (fail-closed) on wrong passcode or corrupted ciphertext.
 */
export async function decryptLocalData(
  cipherText: string,
  ivBase64: string,
  passcode: string
): Promise<string> {
  if (!passcode) {
    throw new Error('Vault passcode is required. Refusing to decrypt with an empty key.');
  }
  assertWebCryptoAvailable();

  if (ivBase64 === 'fallback-iv') {
    // Legacy pseudo-encrypted record from the old base64 fallback path.
    throw new Error(
      'This record was stored with the legacy insecure fallback and cannot be decrypted securely. It must be re-saved.'
    );
  }

  const salt = getVaultSalt();
  const key = await getDerivedKey(passcode, salt);
  const ivStr = atob(ivBase64);
  const iv = new Uint8Array(ivStr.length);
  for (let i = 0; i < ivStr.length; i++) {
    iv[i] = ivStr.charCodeAt(i);
  }

  const cipherStr = atob(cipherText);
  const cipherBytes = new Uint8Array(cipherStr.length);
  for (let i = 0; i < cipherStr.length; i++) {
    cipherBytes[i] = cipherStr.charCodeAt(i);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/** Clears any cached derived key (call on logout / vault lock). */
export function clearCachedKey(): void {
  cachedKey = null;
  cachedKeyFingerprint = '';
}

/**
 * One-way PIN hash with per-user salt (used for stealth PIN verification
 * against profiles.stealth_pin_hash — never store the PIN in plaintext).
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  assertWebCryptoAvailable();
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(`${salt}:${pin}:${salt}`)
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
