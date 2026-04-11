import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PersonTip, Person } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tip'>;

const PRESET_PERCENTS = [0, 10, 15, 18, 20, 25];

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function TipScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { summary } = route.params;
  const { people, items } = summary;

  // Receipt total = all menu items + all tax/fee items
  const receiptTotal = round2(
    items.filter((i) => !i.isGrandTotal).reduce((s, i) => s + i.price, 0)
  );

  // Each person starts at 0% tip
  const [tipPercents, setTipPercents] = useState<Record<string, number>>(
    Object.fromEntries(people.map((p) => [p.id, 0]))
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [showCustom, setShowCustom] = useState<Record<string, boolean>>({});

  function setPercent(personId: string, pct: number) {
    setTipPercents((prev) => ({ ...prev, [personId]: pct }));
    setShowCustom((prev) => ({ ...prev, [personId]: false }));
    setCustomInputs((prev) => ({ ...prev, [personId]: '' }));
  }

  function commitCustom(personId: string) {
    const raw = customInputs[personId] ?? '';
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      setTipPercents((prev) => ({ ...prev, [personId]: round2(parsed) }));
    }
  }

  function onContinue() {
    const tips: PersonTip[] = people.map((p) => {
      const pct = tipPercents[p.id] ?? 0;
      return {
        personId: p.id,
        tipPercent: pct,
        tipAmount: round2((pct / 100) * receiptTotal),
      };
    });
    navigation.navigate('BillSummary', { summary, tips });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Receipt Total</Text>
          <Text style={styles.totalAmount}>${receiptTotal.toFixed(2)}</Text>
          <Text style={styles.totalSub}>Each person's tip is calculated on this amount</Text>
        </View>

        {people.map((person: Person) => {
          const pct = tipPercents[person.id] ?? 0;
          const tipAmt = round2((pct / 100) * receiptTotal);
          const isCustom = showCustom[person.id];

          return (
            <View key={person.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.personName}>{person.name}</Text>
                <View style={styles.tipSummary}>
                  <Text style={styles.tipPct}>{pct}%</Text>
                  <Text style={styles.tipAmt}>
                    {pct > 0 ? `+$${tipAmt.toFixed(2)}` : 'No tip'}
                  </Text>
                </View>
              </View>

              {/* Preset buttons */}
              <View style={styles.presetRow}>
                {PRESET_PERCENTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.presetBtn, !isCustom && pct === p && styles.presetBtnSelected]}
                    onPress={() => setPercent(person.id, p)}
                  >
                    <Text style={[styles.presetBtnText, !isCustom && pct === p && styles.presetBtnTextSelected]}>
                      {p === 0 ? 'None' : `${p}%`}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.presetBtn, isCustom && styles.presetBtnSelected]}
                  onPress={() => setShowCustom((prev) => ({ ...prev, [person.id]: true }))}
                >
                  <Text style={[styles.presetBtnText, isCustom && styles.presetBtnTextSelected]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom input */}
              {isCustom && (
                <View style={styles.customRow}>
                  <TextInput
                    style={styles.customInput}
                    value={customInputs[person.id] ?? ''}
                    onChangeText={(t) =>
                      setCustomInputs((prev) => ({ ...prev, [person.id]: t }))
                    }
                    onBlur={() => commitCustom(person.id)}
                    onEndEditing={() => commitCustom(person.id)}
                    placeholder="e.g. 17"
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                  <Text style={styles.customPctLabel}>%</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={onContinue}
      >
        <Text style={styles.fabText}>See Bill Summary →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 110 },
  totalBanner: {
    backgroundColor: '#009688',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  totalSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personName: { fontSize: 17, fontWeight: '700', color: '#222' },
  tipSummary: { alignItems: 'flex-end' },
  tipPct: { fontSize: 16, fontWeight: '700', color: '#009688' },
  tipAmt: { fontSize: 12, color: '#888', marginTop: 1 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#009688',
    backgroundColor: '#fff',
  },
  presetBtnSelected: { backgroundColor: '#009688' },
  presetBtnText: { fontSize: 13, fontWeight: '600', color: '#009688' },
  presetBtnTextSelected: { color: '#fff' },
  customRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  customInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#009688',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  customPctLabel: { fontSize: 18, fontWeight: '700', color: '#009688' },
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#009688',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
