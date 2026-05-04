export function maskZipCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/(\d{5})(\d{0,3})/, '$1-$2');
}

export function normalizeZipCode(value: string): string {
  return maskZipCode(value.trim());
}

export function normalizeStateCode(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
}
