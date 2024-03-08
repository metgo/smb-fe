import { customAlphabet } from 'nanoid';

export function generateRandomIdentifier(length: number) {
  const customAlphabetWithSpecialChars = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=',
    length,
  );

  const generateRandomIdentifierId = (): string => `TAV8-${customAlphabetWithSpecialChars()}`;

  return generateRandomIdentifierId;
}
