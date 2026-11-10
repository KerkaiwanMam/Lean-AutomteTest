import type { Address, Card, CheckoutInput } from '../api/ShopLabApi';

/** Test-data builders: sensible defaults + overrides keep tests short and intention-revealing. */
export const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  fullName: 'Test Buyer',
  phone: '0812345678',
  line1: '123 Test Road',
  district: 'Pathum Wan',
  province: 'Bangkok',
  postcode: '10330',
  ...overrides,
});

export const CARDS = {
  valid: { number: '4242424242424242', expiry: '12/30', cvv: '123', name: 'TEST BUYER' } satisfies Card,
  declined: { number: '4000000000000002', expiry: '12/30', cvv: '123', name: 'TEST BUYER' } satisfies Card,
  badLuhn: { number: '4242424242424241', expiry: '12/30', cvv: '123', name: 'TEST BUYER' } satisfies Card,
  expired: { number: '4242424242424242', expiry: '01/20', cvv: '123', name: 'TEST BUYER' } satisfies Card,
};

export const buildCheckout = (overrides: Partial<CheckoutInput> = {}): CheckoutInput => ({
  address: buildAddress(),
  shippingMethod: 'standard',
  paymentMethod: 'card',
  card: CARDS.valid,
  ...overrides,
});

/** Products whose prices sit on business-rule boundaries (seed data). */
export const PRODUCTS = {
  mouse499: 'ELEC-001',
  hub1000: 'ELEC-003',
  book999: 'BOOK-002',
  book1001: 'BOOK-001',
  shoes3000: 'FASH-003',
  monitor12900: 'ELEC-004',
  webcamOutOfStock: 'ELEC-006',
  tshirt290: 'FASH-001',
} as const;

/** Uppercase random SKU that matches ^[A-Z]{4}-\d{3}$ */
export function randomSku(): string {
  const letters = Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${letters}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}

/** YYYY-MM-DD for someone who is exactly `years` old today (+/- extra days) */
export function birthDateForAge(years: number, extraDays = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + extraDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
