export type Person = {
  id: string;
  name: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  isTaxOrFee: boolean;   // auto-detected or user-toggled; splits evenly, skips assignment
  isGrandTotal: boolean; // lines like "TOTAL" — excluded from all calculations
};

export type Assignment = {
  itemId: string;
  personIds: string[]; // empty = unassigned
};

export type BillSplit = {
  person: Person;
  assignedItems: { item: ReceiptItem; costForPerson: number }[];
  subtotal: number;
  taxShare: number;
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
  ReviewItems: { imageUri: string; items: ReceiptItem[]; people: Person[] };
  AssignItems: { imageUri: string; items: ReceiptItem[]; people: Person[] };
  BillSummary: { summary: ReceiptSummary };
  Share: { summary: ReceiptSummary; splits: BillSplit[] };
};
