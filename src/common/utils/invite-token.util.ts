/**
 * Invite Token Utility — AES-256-GCM encryption
 *
 * Purpose:
 *   Encode customer PII (name, email, phone) + context (wrapperId, eventCode)
 *   into an encrypted, URL-safe token that goes into the booking email link.
 *
 *   URL:  https://book.lumen.app/b/<encryptedToken>
 *
 *   The token looks like random gibberish in the browser bar.
 *   Without the server's secret key it is mathematically impossible to read.
 *
 * Algorithm: AES-256-GCM
 *   - 256-bit key        → strong encryption
 *   - GCM mode           → includes authentication tag (tamper-proof)
 *   - Random IV per token → same payload produces different ciphertext every time
 *   - No padding oracle  → safe against padding attacks (unlike CBC)
 *
 * Token format:
 *   Single base64url string — no dots, no slashes, URL-safe.
 *   Internally structured as: [iv (12 bytes)] + [authTag (16 bytes)] + [ciphertext (n bytes)]
 *   All concatenated into one Buffer → base64url encoded.
 *   No dots → no Express param truncation issues.
 *
 * Environment variable required:
 *   INVITE_TOKEN_SECRET — exactly 64 hex chars (32 bytes → 256-bit key)
 *   Generate once:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface InvitePayload {
  /** Customer's full name — pre-fills the form */
  name: string;
  /** Customer's email */
  email: string;
  /** Customer's phone (optional) */
  phone?: string;
  /** Which SessionWrapper to load */
  wrapperId: string;
  /** Single-use booking code — consumed after confirmation */
  code?: string;
  /** Unix timestamp — token hard-expires at this time */
  exp: number;
  /**
   * The OrderProduct (ticket) this invite was issued for. Optional for
   * backward compatibility with tokens issued before this field existed —
   * those are checked as-is, with no cancellation gate, since there's
   * nothing to check against.
   */
  orderProductId?: string;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV — recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

// Hardcoded secret for token encryption
const INVITE_TOKEN_SECRET
  = 'a3f8c2d1e4b5a6f7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1';

function getKey(): Buffer {
  const secret = INVITE_TOKEN_SECRET;
  if (!secret || secret.length !== 64) {
    throw new Error(
      'INVITE_TOKEN_SECRET must be exactly 64 hex characters (32 bytes).',
    );
  }
  return Buffer.from(secret, 'hex');
}

/** Convert Buffer to base64url (URL-safe, no padding) */
function toB64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/** Convert base64url back to Buffer */
function fromB64url(str: string): Buffer {
  // Re-pad to valid base64 length
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/**
 * Encrypt an InvitePayload into a single URL-safe base64url string (no dots).
 *
 * Format stored in one Buffer: [ iv (12) | authTag (16) | ciphertext (n) ]
 * → base64url encoded → one clean URL param, no dots, no truncation.
 *
 * @example
 * const token = encryptInviteToken({
 *   name: 'Dana Cohen',
 *   email: 'dana@example.com',
 *   phone: '050-123-4567',
 *   wrapperId: '6a434e6bab835dff0ef1fe46',
 *   eventCode: 'SUMMER-2026',
 *   exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
 * });
 * // → "X7kP2mQv9rN3A9fR3nLwXyZ4pBqC8sT1uK6jH0eN5vMoD2iWxZGc4tYhE8lI"
 * //    one continuous base64url string — no dots, fully URL-safe
 */
export function encryptInviteToken(payload: InvitePayload): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const plaintext = JSON.stringify(payload);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack everything into one buffer: [iv | authTag | ciphertext]
  const packed = Buffer.concat([iv, authTag, ciphertext]);

  // Return as a single base64url string — no dots, safe in Express :param
  return toB64url(packed);
}

/**
 * Decrypt a base64url-encoded invite token back to InvitePayload.
 * Throws if: format wrong, auth tag mismatch (tampered/wrong key), or expired.
 */
export function decryptInviteToken(token: string): InvitePayload {
  let packed: Buffer;
  try {
    packed = fromB64url(token);
  } catch {
    throw new Error('Invalid token encoding');
  }

  // Minimum length: iv (12) + authTag (16) + at least 1 byte ciphertext
  if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Invalid token format — too short');
  }

  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let plaintext: string;
  try {
    plaintext = decipher.update(ciphertext) + decipher.final('utf8');
  } catch {
    // GCM auth tag mismatch — tampered or wrong key
    throw new Error('Token authentication failed — invalid or tampered token');
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(plaintext);
  } catch {
    throw new Error('Token payload is malformed');
  }

  // Hard expiry check
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token has expired');
  }

  return payload;
}
