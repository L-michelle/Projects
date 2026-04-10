import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Assignment, ReceiptItem, Person } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignItems'>;

export default function AssignItemsScreen({ navigation, route }: Props) {
  const { imageUri, items, people } = route.params;
  const menuItems = items.filter((i) => !i.isTaxOrFee && !i.isGrandTotal);

  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id ?? '');
  const [assignments, setAssignments] = useState<Assignment[]>(
    menuItems.map((item) => ({ itemId: item.id, personIds: [] }))
  );

  function toggleItem(itemId: string) {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.itemId !== itemId) return a;
        const already = a.personIds.includes(selectedPersonId);
        return {
          ...a,
          personIds: already
            ? a.personIds.filter((id) => id !== selectedPersonId)
            : [...a.personIds, selectedPersonId],
        };
      })
    );
  }

  function isAssignedToSelected(itemId: string) {
    return assignments.find((a) => a.itemId === itemId)?.personIds.includes(selectedPersonId) ?? false;
  }

  function getAssignedNames(itemId: string): string {
    const ids = assignments.find((a) => a.itemId === itemId)?.personIds ?? [];
    if (ids.length === 0) return '';
    return ids.map((id) => people.find((p) => p.id === id)?.name ?? '').filter(Boolean).join(', ');
  }

  const unassignedCount = assignments.filter((a) => a.personIds.length === 0).length;
  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  return (
    <View style={styles.container}>
      {/* Person selector */}
      <View style={styles.personBar}>
        <Text style={styles.personBarLabel}>Assigning to:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.personTabsRow}>
          {people.map((person: Person) => (
            <TouchableOpacity
              key={person.id}
              style={[styles.personTab, selectedPersonId === person.id && styles.personTabSelected]}
              onPress={() => setSelectedPersonId(person.id)}
            >
              <Text style={[styles.personTabText, selectedPersonId === person.id && styles.personTabTextSelected]}>
                {person.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.instructionRow}>
        <Text style={styles.instruction}>
          Tap each item that <Text style={styles.instructionBold}>{selectedPerson?.name}</Text> ordered.
          Switch people using the tabs above.
        </Text>
      </View>

      {unassignedCount > 0 && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ {unassignedCount} item{unassignedCount > 1 ? 's' : ''} not yet assigned to anyone
          </Text>
        </View>
      )}

      {/* Item list */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }: { item: ReceiptItem }) => {
          const assigned = isAssignedToSelected(item.id);
          const assignedNames = getAssignedNames(item.id);
          return (
            <TouchableOpacity
              style={[styles.itemCard, assigned && styles.itemCardSelected]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemCardLeft}>
                <View style={[styles.checkbox, assigned && styles.checkboxChecked]}>
                  {assigned && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.itemTextBlock}>
                  <Text style={[styles.itemName, assigned && styles.itemNameSelected]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {assignedNames.length > 0 && (
                    <Text style={styles.assignedNames}>{assignedNames}</Text>
                  )}
                </View>
              </View>
              <Text style={[styles.itemPrice, assigned && styles.itemPriceSelected]}>
                ${item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items to assign.</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('BillSummary', {
            summary: { imageUri, items, people, assignments },
          })}
        >
          <Text style={styles.continueBtnText}>See Bill Summary →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  personBar: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  personBarLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  personTabsRow: { flexDirection: 'row', gap: 8 },
  personTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#009688',
    backgroundColor: '#fff',
  },
  personTabSelected: {
    backgroundColor: '#009688',
  },
  personTabText: { fontSize: 14, fontWeight: '600', color: '#009688' },
  personTabTextSelected: { color: '#fff' },
  instructionRow: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F9FBE7' },
  instruction: { fontSize: 13, color: '#555', lineHeight: 18 },
  instructionBold: { fontWeight: '700', color: '#009688' },
  warningBanner: {
    backgroundColor: '#FFF9C4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9A825',
  },
  warningText: { color: '#E65100', fontSize: 13, fontWeight: '500' },
  list: { padding: 14 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemCardSelected: {
    borderColor: '#009688',
    backgroundColor: '#E8F5E9',
  },
  itemCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#009688', borderColor: '#009688' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemTextBlock: { flex: 1 },
  itemName: { fontSize: 15, color: '#333', fontWeight: '500' },
  itemNameSelected: { color: '#00695C', fontWeight: '700' },
  assignedNames: { fontSize: 11, color: '#009688', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#555' },
  itemPriceSelected: { color: '#009688' },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueBtn: { backgroundColor: '#009688', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
