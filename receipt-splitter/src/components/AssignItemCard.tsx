import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Person, ReceiptItem } from '../types';
import PersonChip from './PersonChip';

type Props = {
  item: ReceiptItem;
  people: Person[];
  assignedPersonIds: string[];
  onTogglePerson: (personId: string) => void;
  onAssignAll: () => void;
};

export default function AssignItemCard({
  item,
  people,
  assignedPersonIds,
  onTogglePerson,
  onAssignAll,
}: Props) {
  const splitCount = assignedPersonIds.length;
  const costEach = splitCount > 0 ? (item.price / splitCount).toFixed(2) : item.price.toFixed(2);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceBlock}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          {splitCount > 1 && (
            <Text style={styles.splitLabel}>${costEach} each</Text>
          )}
        </View>
      </View>
      <View style={styles.chipsRow}>
        {people.map((person) => (
          <PersonChip
            key={person.id}
            name={person.name}
            selected={assignedPersonIds.includes(person.id)}
            onPress={() => onTogglePerson(person.id)}
          />
        ))}
        <TouchableOpacity onPress={onAssignAll} style={styles.allBtn}>
          <Text style={styles.allBtnText}>All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginRight: 10,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#009688',
  },
  splitLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  allBtn: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#aaa',
    backgroundColor: '#f5f5f5',
  },
  allBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
});
