import { ReceiptItem } from '../types';
import { TAX_FEE_KEYWORDS } from '../constants/taxKeywords';

// Matches a $price anywhere in a line (requires $ sign and digit before decimal)
const PRICE_PATTERN = /\$(\d+\.\d{2})/g;

// Matches a line that STARTS with a price (allows trailing characters like "T", "N", tax codes)
const LINE_STARTS_WITH_PRICE = /^\$?(\d+\.\d{2})/;

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

  // Remove leading quantity+dash: "22 - ", "35- ", "2x "
  name = name.replace(/^\d+\s*[-–x]\s*/i, '').trim();
  // Remove bare leading number: "22 PET" → "PET"
  name = name.replace(/^\d+\s+/, '').trim();

  // Remove standalone barcode/SKU numbers (5+ digits, no decimal)
  name = name.replace(/\s+\d{5,}/g, '').trim();

  // Remove embedded price fragments like "$.10" left in name
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

    // --- Strategy 1: find a $price anywhere on this line ---
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
      rawName = line.slice(0, lastMatch.index).trim();

      if (rawName.length < 1) {
        // Price at start of line — take everything after as name
        const afterPrice = line.slice(lastMatch.index + lastMatch[0].length).trim();
        if (afterPrice.length >= 2) {
          rawName = afterPrice;
        } else {
          continue;
        }
      }
    } else {
      // --- Strategy 2: no $price on this line ---
      // Look ahead up to 2 lines for a line that STARTS with a price
      // (handles format where price is on its own line, possibly with trailing tax code)
      let found = false;
      for (let j = i + 1; j <= Math.min(i + 2, lines.length - 1); j++) {
        const nextLine = lines[j].trim();
        const nextPriceMatch = nextLine.match(LINE_STARTS_WITH_PRICE);
        if (nextPriceMatch) {
          price = parseFloat(nextPriceMatch[1]);
          rawName = line.trim();
          i = j; // consume up to the price line
          found = true;
          break;
        }
      }
      if (!found) continue;
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
