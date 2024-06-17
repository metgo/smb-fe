import { customAlphabet } from 'nanoid';

export function generateRandomIdentifier(code: string, length: number) {
  const customAlphabetWithSpecialChars = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&*()_-=',
    length,
  );

  return `${code.toUpperCase()}-${customAlphabetWithSpecialChars()}`;
}
