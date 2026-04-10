import { ReceiptItem } from '../types';
import { TAX_FEE_KEYWORDS } from '../constants/taxKeywords';

const PRICE_REGEX = /\$?(\d+\.\d{2})$/;
const PRICE_ONLY_REGEX = /^\$?(\d+\.\d{2})$/;
const QUANTITY_PREFIX_REGEX = /^\d+\s?[xX]?\s+/;

function isTaxOrFeeKeyword(name: string): boolean {
  const lower = name.toLowerCase();
  return TAX_FEE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isGrandTotalLine(name: string): boolean {
  return /^(sub\s?)?total/i.test(name.trim());
}

export function parseReceiptText(rawText: string): ReceiptItem[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: ReceiptItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let name = line;
    let price: number | null = null;

    const priceMatch = line.match(PRICE_REGEX);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
      name = line.slice(0, line.lastIndexOf(priceMatch[0])).trim();
    } else {
      // Look-ahead: if next line is a price-only line, join them
      const nextLine = lines[i + 1] ?? '';
      const nextPriceMatch = nextLine.match(PRICE_ONLY_REGEX);
      if (nextPriceMatch) {
        price = parseFloat(nextPriceMatch[1]);
        name = line.trim();
        i++; // consume next line
      }
    }

    if (price === null) continue;
    if (price <= 0) continue;

    // Strip leading quantities like "2x " or "2 "
    name = name.replace(QUANTITY_PREFIX_REGEX, '').trim();

    if (name.length < 2) continue;

    const taxOrFee = isTaxOrFeeKeyword(name);
    const grandTotal = isGrandTotalLine(name);

    items.push({
      id: `item-${Date.now()}-${i}`,
      name,
      price,
      isTaxOrFee: taxOrFee || grandTotal,
      isGrandTotal: grandTotal,
    });
  }

  return items;
}
