import { BillSplit, ReceiptSummary } from '../types';

function fmt(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatSplit(splits: BillSplit[], summary: ReceiptSummary): string {
  const lines: string[] = ['--- Receipt Breakdown ---', ''];

  for (const split of splits) {
    lines.push(`${split.person.name}: ${fmt(split.total)}`);

    for (const { item, costForPerson } of split.assignedItems) {
      const assignedCount =
        summary.assignments.find((a) => a.itemId === item.id)?.personIds.length ?? 1;
      const label =
        assignedCount > 1 ? `${item.name} (split ${assignedCount})` : item.name;
      lines.push(`  ${label}: ${fmt(costForPerson)}`);
    }

    if (split.taxShare > 0) {
      lines.push(`  Tax & Fees: ${fmt(split.taxShare)}`);
    }

    if (split.tipAmount > 0) {
      lines.push(`  Tip: ${fmt(split.tipAmount)}`);
    }

    lines.push('');
  }

  const grandTotal = splits.reduce((s, sp) => s + sp.total, 0);
  lines.push(`TOTAL: ${fmt(grandTotal)}`);
  lines.push('');
  lines.push('(Sent via Receipt Splitter)');

  return lines.join('\n');
}
