import React, { useState } from 'react';
import { View, TextInput, Switch, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ReceiptItem } from '../types';

type Props = {
  item: ReceiptItem;
  onChange: (updated: ReceiptItem) => void;
  onDelete: (id: string) => void;
};

export default function ReceiptItemRow({ item, onChange, onDelete }: Props) {
  // Keep price as a string while editing so decimals like "14." don't get swallowed
  const [priceText, setPriceText] = useState(item.price > 0 ? item.price.toFixed(2) : '');

  function commitPrice(text: string) {
    const parsed = parseFloat(text);
    onChange({ ...item, price: isNaN(parsed) ? 0 : parsed });
  }

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.nameInput}
        value={item.name}
        onChangeText={(text) => onChange({ ...item, name: text })}
        placeholder="Item name"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.priceInput}
        value={priceText}
        onChangeText={setPriceText}
        onBlur={() => commitPrice(priceText)}
        onEndEditing={() => commitPrice(priceText)}
        placeholder="0.00"
        placeholderTextColor="#aaa"
        keyboardType="decimal-pad"
      />
      <View style={styles.taxToggle}>
        <Text style={styles.taxLabel}>Tax/Fee</Text>
        <Switch
          value={item.isTaxOrFee}
          onValueChange={(val) =>
            onChange({ ...item, isTaxOrFee: val, isGrandTotal: val ? item.isGrandTotal : false })
          }
          trackColor={{ false: '#ccc', true: '#009688' }}
          thumbColor="#fff"
        />
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nameInput: {
    flex: 3,
    fontSize: 14,
    color: '#222',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'right',
    marginRight: 8,
  },
  taxToggle: {
    alignItems: 'center',
    marginRight: 6,
  },
  taxLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '700',
  },
});
