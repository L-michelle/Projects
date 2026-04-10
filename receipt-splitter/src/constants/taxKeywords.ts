// Only auto-flag lines that are unambiguously government taxes
// Avoid broad terms like 'fee' or 'delivery' that can match real menu items
export const TAX_FEE_KEYWORDS = [
  'sales tax',
  'tax',
  'hst',
  'gst',
  'pst',
  'vat',
];
