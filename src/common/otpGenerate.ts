export async function generateOTP(): Promise<string> {
  const otp = Math.floor(1000 + Math.random() * 9000);
  // Convert the number to a string and return
  return otp.toString();
}
