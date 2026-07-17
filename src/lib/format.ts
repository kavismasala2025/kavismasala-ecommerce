export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(5, '0');
  return `KM${year}${seq}`;
}
