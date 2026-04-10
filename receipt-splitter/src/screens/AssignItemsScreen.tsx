import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Assignment, ReceiptItem } from '../types';
import AssignItemCard from '../components/AssignItemCard';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignItems'>;

export default function AssignItemsScreen({ navigation, route }: Props) {
  const { imageUri, items, people } = route.params;

  const menuItems = items.filter((i) => !i.isTaxOrFee && !i.isGrandTotal);

  const [assignments, setAssignments] = useState<Assignment[]>(
    menuItems.map((item) => ({ itemId: item.id, personIds: [] }))
  );

  function togglePerson(itemId: string, personId: string) {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.itemId !== itemId) return a;
        const already = a.personIds.includes(personId);
        return {
          ...a,
          personIds: already
            ? a.personIds.filter((id) => id !== personId)
            : [...a.personIds, personId],
        };
      })
    );
  }

  function assignAll(itemId: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.itemId === itemId ? { ...a, personIds: people.map((p) => p.id) } : a
      )
    );
  }

  const unassignedCount = assignments.filter((a) => a.personIds.length === 0).length;

  function onContinue() {
    navigation.navigate('BillSummary', {
      summary: { imageUri, items, people, assignments },
    });
  }

  function getAssignedIds(itemId: string): string[] {
    return assignments.find((a) => a.itemId === itemId)?.personIds ?? [];
  }

  return (
    <View style={styles.container}>
      {unassignedCount > 0 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ {unassignedCount} item{unassignedCount > 1 ? 's' : ''} not yet assigned to anyone
          </Text>
        </View>
      )}

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: ReceiptItem }) => (
          <AssignItemCard
            item={item}
            people={people}
            assignedPersonIds={getAssignedIds(item.id)}
            onTogglePerson={(personId) => togglePerson(item.id, personId)}
            onAssignAll={() => assignAll(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items to assign.</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
          <Text style={styles.continueBtnText}>See Bill Summary →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  warningBanner: {
    backgroundColor: '#FFF9C4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9A825',
  },
  warningText: { color: '#E65100', fontSize: 13, fontWeight: '500' },
  list: { padding: 14 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueBtn: { backgroundColor: '#009688', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
