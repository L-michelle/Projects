import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { calculateSplits } from '../utils/billCalculator';

type Props = NativeStackScreenProps<RootStackParamList, 'BillSummary'>;

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function BillSummaryScreen({ navigation, route }: Props) {
  const { summary } = route.params;
  const splits = useMemo(() => calculateSplits(summary), [summary]);
  const grandTotal = splits.reduce((s, sp) => s + sp.total, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {splits.map((split) => (
          <View key={split.person.id} style={styles.card}>
            <Text style={styles.personName}>{split.person.name}</Text>

            {split.assignedItems.map(({ item, costForPerson }) => {
              const shareCount =
                summary.assignments.find((a) => a.itemId === item.id)?.personIds.length ?? 1;
              const label = shareCount > 1 ? `${item.name} (split ${shareCount})` : item.name;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{label}</Text>
                  <Text style={styles.itemCost}>{fmt(costForPerson)}</Text>
                </View>
              );
            })}

            {split.assignedItems.length === 0 && (
              <Text style={styles.noItems}>No items assigned</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.itemRow}>
              <Text style={styles.subLabel}>Subtotal</Text>
              <Text style={styles.subValue}>{fmt(split.subtotal)}</Text>
            </View>

            {split.taxShare > 0 && (
              <View style={styles.itemRow}>
                <Text style={styles.subLabel}>Tax &amp; Fees share</Text>
                <Text style={styles.subValue}>{fmt(split.taxShare)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{fmt(split.total)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.grandTotalCard}>
          <Text style={styles.grandLabel}>Receipt Total</Text>
          <Text style={styles.grandValue}>{fmt(grandTotal)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => navigation.navigate('Share', { summary, splits })}
        >
          <Text style={styles.shareBtnText}>Share Breakdown →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 14, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  personName: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { flex: 1, fontSize: 14, color: '#444', marginRight: 8 },
  itemCost: { fontSize: 14, color: '#444', fontWeight: '500' },
  noItems: { fontSize: 13, color: '#aaa', marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  subLabel: { fontSize: 13, color: '#888' },
  subValue: { fontSize: 13, color: '#888' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#009688',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#009688' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#009688' },
  grandTotalCard: {
    backgroundColor: '#009688',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  grandLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  grandValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  shareBtn: { backgroundColor: '#009688', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
