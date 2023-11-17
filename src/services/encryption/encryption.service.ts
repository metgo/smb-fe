import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function computeBase64ByteSizeFromInputByteSize(inputByteSize: number) {
  return Math.ceil(inputByteSize / 3) * 4;
}

export const encryptionIvByteSize = 16;
export const algorithm = 'aes-256-ctr';
/**
 * A character that is not in the base64 character set
 */
const testChar = '`';
const testCharUtf8ByteSize = Buffer.byteLength(testChar, 'utf8');

export const maxBytesPerUtf8UnicodeChar = 4;

/**
 * NOTE: updates to this computation formula must be accompanied by a database migration
 * because database columns may use this function to determine column length.
 */
export function computeEncryptedValueAsciiCharCountFromUtf8InputByteSize(inputByteSize: number) {
  // each input byte will be encoded as a base64 character which takes up 1 byte
  return computeBase64ByteSizeFromInputByteSize(
    inputByteSize + encryptionIvByteSize + testCharUtf8ByteSize,
  );
}

/**
 * NOTE: updates to this computation formula must be accompanied by a database migration
 * because database columns may use this function to determine column length.
 */
export function computeEncryptedValueMaxCharCountFromUtf8InputCharCount(charCount: number) {
  // each unicode character takes 1-4 bytes
  return computeEncryptedValueAsciiCharCountFromUtf8InputByteSize(charCount * maxBytesPerUtf8UnicodeChar);
}

/**
 * NOTE: updates to this computation formula must be accompanied by a database migration
 * because database columns may use this function to determine column length.
 */
export function computeEncryptedValueMaxCharCountFromAsciiInputCharCount(charCount: number) {
  // each ascii character takes 1 byte
  return computeEncryptedValueAsciiCharCountFromUtf8InputByteSize(charCount);
}

/**
 * NOTE: updates to this computation formula must be accompanied by a database migration
 * because database columns may use this function to determine column length.
 */
export function computeEncryptedValueCharCountFromString(input: string) {
  return computeEncryptedValueAsciiCharCountFromUtf8InputByteSize(Buffer.byteLength(input, 'utf8'));
}

@Injectable()
export class EncryptionService {
  encrypt(value: string, key: string): string {
    // Attempt to decrypt the data to avoid double encryption
    const unencryptedValue = this.decrypt(value, key);

    const iv = randomBytes(encryptionIvByteSize);
    const cipher = createCipheriv(algorithm, key, iv);

    return Buffer.concat([
      iv,
      // Add test char to detect encryption
      cipher.update(`${testChar}${unencryptedValue}`, 'utf8'),
      cipher.final(),
    ]).toString('base64');
  }

  // eslint-disable-next-line class-methods-use-this
  decrypt(value: string, key: string): string {
    try {
      const buffer = Buffer.from(value, 'base64');
      const ivBytes = buffer.slice(0, encryptionIvByteSize);
      const encryptedBytes = buffer.slice(encryptionIvByteSize);
      const decipher = createDecipheriv(algorithm, key, ivBytes);

      const decryptedBytesUtf8 = Buffer.concat([
        decipher.update(encryptedBytes),
        decipher.final(),
      ]);

      const charForTesting = decryptedBytesUtf8.slice(0, testCharUtf8ByteSize);
      const result = decryptedBytesUtf8.slice(testCharUtf8ByteSize);

      if (charForTesting.toString('utf8') !== testChar) {
        // This string is not encrypted so return it
        return value;
      }

      return result.toString('utf8');
    } catch (err) {
      return value;
    }
  }
}
