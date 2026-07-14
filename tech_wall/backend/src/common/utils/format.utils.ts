export function formatDecimal(value: any): number | string {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value ?? '');
  return num;
}
