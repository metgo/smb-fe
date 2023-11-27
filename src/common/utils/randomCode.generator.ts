import { v4 as uuidv4 } from 'uuid';

export function generateRandomCode(length: number) {
  const randomString = uuidv4().replace(/-/g, '').substr(0, length);
  return randomString.toUpperCase();
}
