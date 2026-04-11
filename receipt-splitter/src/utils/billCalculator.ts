import { BillSplit, PersonTip, ReceiptSummary } from '../types';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSplits(summary: ReceiptSummary, tips: PersonTip[]): BillSplit[] {
  const { people, items, assignments } = summary;

  const taxFeeItems = items.filter((i) => i.isTaxOrFee && !i.isGrandTotal);
  const totalTaxFees = taxFeeItems.reduce((sum, i) => sum + i.price, 0);

  const baseTaxPerPerson = round2(totalTaxFees / people.length);
  const lastPersonTax = round2(totalTaxFees - baseTaxPerPerson * (people.length - 1));

  return people.map((person, personIndex) => {
    const assignedItems: { item: typeof items[0]; costForPerson: number }[] = [];

    for (const assignment of assignments) {
      if (!assignment.personIds.includes(person.id)) continue;
      const item = items.find((i) => i.id === assignment.itemId);
      if (!item || item.isTaxOrFee || item.isGrandTotal) continue;
      const costForPerson = round2(item.price / assignment.personIds.length);
      assignedItems.push({ item, costForPerson });
    }

    const subtotal = round2(assignedItems.reduce((s, a) => s + a.costForPerson, 0));
    const taxShare = personIndex === people.length - 1 ? lastPersonTax : baseTaxPerPerson;
    const tipAmount = tips.find((t) => t.personId === person.id)?.tipAmount ?? 0;
    const total = round2(subtotal + taxShare + tipAmount);

    return { person, assignedItems, subtotal, taxShare, tipAmount, total };
  });
}
