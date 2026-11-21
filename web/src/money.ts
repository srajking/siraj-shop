// money.ts — one price formatter for the whole shop
export function iqd(amount: number): string {
  return amount.toLocaleString('en-US') + ' IQD'
}
