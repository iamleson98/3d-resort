/** Suite pricing — pure logic. Unit tested. */
import type { Suite } from '../../shared/domain/types';

export interface SuiteQuote {
  suiteId: string;
  nightlyRate: number;
  nights: number;
  roomTotal: number;
  amenityCredit: number;
  taxes: number;
  grandTotal: number;
}

const TAX_RATE = 0.08;
const CREDIT_CAP = 750;

export function quoteSuite(suite: Suite, nights: number): SuiteQuote {
  const n = Math.max(1, Math.round(nights));
  const nightlyRate = suite.rate;
  const roomTotal = Math.round(nightlyRate * n * 100) / 100;
  const amenityCredit = Math.min(CREDIT_CAP, Math.round(roomTotal * 0.1 * 100) / 100);
  const taxes = Math.round((roomTotal - amenityCredit) * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((roomTotal - amenityCredit + taxes) * 100) / 100;
  return { suiteId: suite.id, nightlyRate, nights: n, roomTotal, amenityCredit, taxes, grandTotal };
}

/** Editor product estimate — BOM subtotal with rooms split. */
export function estimateProduct(subtotal: number, rooms: number): { furnish: number; perRoom: number } {
  const furnish = Math.round(subtotal * 100) / 100;
  const perRoom = Math.round((subtotal / Math.max(1, rooms)) * 100) / 100;
  return { furnish, perRoom };
}
