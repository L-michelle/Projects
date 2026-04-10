import { ReceiptItem } from '../types';
import { TAX_FEE_KEYWORDS } from '../constants/taxKeywords';

// Matches any $price or price pattern (requires digit before decimal)
const PRICE_PATTERN = /\$(\d+\.\d{2})/g;
// A line that is ONLY a price
const PRICE_ONLY_REGEX = /^\$?(\d+\.\d{2})$/;

function isTaxOrFeeKeyword(name: string): boolean {
  const lower = name.toLowerCase();
  return TAX_FEE_KEYWORDS.some((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return new RegExp(`(^|\\s|\\b)${escaped}(\\s|$|\\b)`, 'i').test(lower);
  });
}

function isGrandTotalLine(name: string): boolean {
  return /^(sub\s*)?total/i.test(name.trim());
}

function cleanName(raw: string): string {
  let name = raw;

  // Remove trailing single-letter tax indicators like " T" or " N"
  name = name.replace(/\s+[A-Z]$/, '').trim();

  // Remove leading quantity patterns: "22 - ", "22- ", "22 x ", "2x "
  name = name.replace(/^\d+\s*[-–x]\s*/i, '').trim();
  // Remove bare leading number with space: "22 PET" → "PET"
  name = name.replace(/^\d+\s+/, '').trim();

  // Remove standalone barcode/SKU numbers (5+ digits with no decimal)
  name = name.replace(/\s+\d{5,}\s*/g, ' ').trim();
  name = name.replace(/\s+\d{5,}$/, '').trim();

  // Remove embedded price patterns like "$.10" or "$0.10" left in the name
  name = name.replace(/\$\.?\d*\.\d{2}/g, '').trim();

  // Collapse multiple spaces
  name = name.replace(/\s{2,}/g, ' ').trim();

  return name;
}

export function parseReceiptText(rawText: string): ReceiptItem[] {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ReceiptItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Find ALL $price matches in this line, take the LAST one as the item price
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    PRICE_PATTERN.lastIndex = 0;
    while ((m = PRICE_PATTERN.exec(line)) !== null) {
      lastMatch = m;
    }

    let price: number | null = null;
    let rawName = '';

    if (lastMatch) {
      price = parseFloat(lastMatch[1]);
      // Everything before the last price is the raw name
      rawName = line.slice(0, lastMatch.index).trim();

      if (rawName.length < 1) {
        // Price is at the very start — take everything after as the name
        const afterPrice = line.slice(lastMatch.index + lastMatch[0].length).trim();
        if (afterPrice.length >= 2) {
          rawName = afterPrice;
        } else {
          continue;
        }
      }
    } else {
      // No $price on this line — check if the NEXT line is price-only
      const nextLine = lines[i + 1]?.trim() ?? '';
      const nextPriceMatch = nextLine.match(PRICE_ONLY_REGEX);
      if (nextPriceMatch) {
        price = parseFloat(nextPriceMatch[1]);
        rawName = line.trim();
        i++;
      } else {
        continue;
      }
    }

    if (!price || price <= 0) continue;

    const name = cleanName(rawName);
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
