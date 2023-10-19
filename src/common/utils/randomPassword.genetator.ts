export async function passwordGenerator(): Promise<string> {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const stringLength = 8;
  let randomString = '';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < stringLength; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(rnum, rnum + 1);
  }

  return randomString;
}
