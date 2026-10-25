/**
 * Currency formatters for Indian Rupee (INR - ₹)
 */

export function formatINR(amount: number | null | undefined, includeDecimals = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹ 0.00';
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

export function formatINRCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹ 0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
