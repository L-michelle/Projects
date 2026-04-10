import { ReceiptItem } from '../types';
import { TAX_FEE_KEYWORDS } from '../constants/taxKeywords';

// Matches any price-like pattern (e.g. 12.00 or $12.00) anywhere in a line
const PRICE_PATTERN = /\$?(\d+\.\d{2})/g;
// Matches a line that contains ONLY a price
const PRICE_ONLY_REGEX = /^\$?(\d+\.\d{2})$/;
// Leading quantity prefix like "2x " or "2 "
const QUANTITY_PREFIX_REGEX = /^\d+\s?[xX]?\s+/;

function isTaxOrFeeKeyword(name: string): boolean {
  const lower = name.toLowerCase();
  return TAX_FEE_KEYWORDS.some((kw) => {
    // Use word boundaries so "coffee" doesn't match "fee", etc.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return new RegExp(`(^|\\s|\\b)${escaped}(\\s|$|\\b)`, 'i').test(lower);
  });
}

function isGrandTotalLine(name: string): boolean {
  return /^(sub\s?)?total/i.test(name.trim());
}

export function parseReceiptText(rawText: string): ReceiptItem[] {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ReceiptItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let price: number | null = null;
    let name = '';

    // Find ALL price matches in this line, take the last (rightmost) one
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(line)) !== null) {
      lastMatch = m;
    }

    if (lastMatch) {
      price = parseFloat(lastMatch[1]);
      // Everything before the last price = the item name
      name = line.slice(0, lastMatch.index).trim();

      if (name.length < 2) {
        // Price is at the start of the line — take everything after as the name
        const afterPrice = line.slice(lastMatch.index + lastMatch[0].length).trim();
        if (afterPrice.length >= 2) {
          name = afterPrice;
        } else {
          continue;
        }
      }
    } else {
      // No price on this line — check if the NEXT line is a price-only line
      const nextLine = lines[i + 1]?.trim() ?? '';
      const nextPriceMatch = nextLine.match(PRICE_ONLY_REGEX);
      if (nextPriceMatch) {
        price = parseFloat(nextPriceMatch[1]);
        name = line.trim();
        i++; // consume the next line
      } else {
        continue; // No price found at all — skip
      }
    }

    if (!price || price <= 0) continue;

    // Strip leading quantities like "2x " or "2 "
    name = name.replace(QUANTITY_PREFIX_REGEX, '').trim();
    if (name.length < 2) continue;

    const taxOrFee = isTaxOrFeeKeyword(name);
    const grandTotal = isGrandTotalLine(name);

    items.push({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      name,
      price,
      isTaxOrFee: taxOrFee || grandTotal,
      isGrandTotal: grandTotal,
    });
  }

  return items;
}
