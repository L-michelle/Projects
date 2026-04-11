export type Person = {
  id: string;
  name: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  isTaxOrFee: boolean;
  isGrandTotal: boolean;
};

export type Assignment = {
  itemId: string;
  personIds: string[];
};

export type PersonTip = {
  personId: string;
  tipPercent: number;  // e.g. 20 means 20%
  tipAmount: number;   // tipPercent / 100 * receiptTotal
};

export type BillSplit = {
  person: Person;
  assignedItems: { item: ReceiptItem; costForPerson: number }[];
  subtotal: number;
  taxShare: number;
  tipAmount: number;
  total: number;
};

export type ReceiptSummary = {
  imageUri: string;
  items: ReceiptItem[];
  people: Person[];
  assignments: Assignment[];
};

export type RootStackParamList = {
  Home: undefined;
  Processing: { imageUri: string; people: Person[] };
  ReviewItems: { imageUri: string; items: ReceiptItem[]; people: Person[]; grandTotal: number | null };
  AssignItems: { imageUri: string; items: ReceiptItem[]; people: Person[] };
  Tip: { summary: ReceiptSummary };
  BillSummary: { summary: ReceiptSummary; tips: PersonTip[] };
  Share: { summary: ReceiptSummary; splits: BillSplit[] };
};
