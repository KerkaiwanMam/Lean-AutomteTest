/** "฿1,016.50" -> 1016.5 · "-฿100.00" -> -100 · "FREE" -> 0 */
export function parseMoney(text: string | null): number {
  const t = (text ?? '').trim();
  if (/^free$/i.test(t)) return 0;
  const n = Number(t.replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) throw new Error(`Cannot parse money from "${text}"`);
  return n;
}

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Oracle for expected totals — mirrors REQ-PRC-* (the spec), NOT the app code. */
export function expectedQuote(subtotal: number, discount: number, shippingMethod: 'standard' | 'express' = 'standard', freeShipCoupon = false) {
  const after = round2(subtotal - discount);
  let shipping = 0;
  if (subtotal > 0) shipping = shippingMethod === 'express' ? 120 : after >= 1000 || freeShipCoupon ? 0 : 50;
  const vat = round2((after + shipping) * 0.07);
  return { subtotal, discount, shipping, vat, total: round2(after + shipping + vat) };
}
