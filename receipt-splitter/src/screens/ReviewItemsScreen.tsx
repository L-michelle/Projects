import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ReceiptItem } from '../types';
import ReceiptItemRow from '../components/ReceiptItemRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewItems'>;

let newItemCounter = 0;

export default function ReviewItemsScreen({ navigation, route }: Props) {
  const { imageUri, people } = route.params;
  const [items, setItems] = useState<ReceiptItem[]>(route.params.items);

  function updateItem(updated: ReceiptItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem() {
    newItemCounter++;
    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${newItemCounter}`,
        name: '',
        price: 0,
        isTaxOrFee: false,
        isGrandTotal: false,
      },
    ]);
  }

  function onContinue() {
    navigation.navigate('AssignItems', { imageUri, items, people });
  }

  const menuItems = items.filter((i) => !i.isTaxOrFee && !i.isGrandTotal);
  const taxItems = items.filter((i) => i.isTaxOrFee && !i.isGrandTotal);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />
        <Text style={styles.hint}>
          Review the items below. Toggle "Tax" for taxes or fees — they'll be split evenly. Delete any lines that aren't real items.
        </Text>

        {menuItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Menu Items</Text>
            {menuItems.map((item) => (
              <ReceiptItemRow
                key={item.id}
                item={item}
                onChange={updateItem}
                onDelete={deleteItem}
              />
            ))}
          </>
        )}

        {taxItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Taxes &amp; Fees (split evenly)</Text>
            {taxItems.map((item) => (
              <ReceiptItemRow
                key={item.id}
                item={item}
                onChange={updateItem}
                onDelete={deleteItem}
              />
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, items.length === 0 && styles.continueBtnDisabled]}
          onPress={onContinue}
          disabled={items.length === 0}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 20 },
  thumb: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12 },
  hint: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#009688', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  addBtn: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#009688',
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { color: '#009688', fontWeight: '600', fontSize: 15 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueBtn: { backgroundColor: '#009688', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: '#b2dfdb' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
