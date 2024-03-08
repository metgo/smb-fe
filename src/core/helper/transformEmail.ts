export default function transformEmail(value: { value: string }) {
  if (typeof value.value === 'string') {
    return value.value.toLowerCase();
  }
  return value;
}
