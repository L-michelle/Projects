import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ReceiptItem } from '../types';
import ReceiptItemRow from '../components/ReceiptItemRow';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewItems'>;

let newItemCounter = 0;

export default function ReviewItemsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { imageUri, people } = route.params;
  const [items, setItems] = useState<ReceiptItem[]>(route.params.items);

  const scrollRef = useRef<ScrollView>(null);
  const rowOffsets = useRef<Record<string, number>>({});

  function handleRowFocus(itemId: string) {
    setTimeout(() => {
      const y = rowOffsets.current[itemId] ?? 0;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
    }, 150);
  }

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

  const menuItems = items.filter((i) => !i.isTaxOrFee);
  const taxItems = items.filter((i) => i.isTaxOrFee);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={{ uri: imageUri }} style={styles.thumb} resizeMode="cover" />

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>What is the Tax/Fee toggle?</Text>
          <Text style={styles.tipText}>
            Turn it ON for taxes, fees, or surcharges. Those lines will be{' '}
            <Text style={styles.tipBold}>split evenly</Text> among everyone and won't appear
            in the item assignment step. Leave it OFF for regular food and drink items.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Menu Items</Text>
        {menuItems.length === 0 && (
          <Text style={styles.emptyNote}>No menu items detected. Add them manually below.</Text>
        )}
        {menuItems.map((item) => (
          <View
            key={item.id}
            onLayout={(e) => { rowOffsets.current[item.id] = e.nativeEvent.layout.y; }}
          >
            <ReceiptItemRow
              item={item}
              onChange={updateItem}
              onDelete={deleteItem}
              onFocus={() => handleRowFocus(item.id)}
            />
          </View>
        ))}

        {taxItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Taxes &amp; Fees — split evenly</Text>
            {taxItems.map((item) => (
              <View
                key={item.id}
                onLayout={(e) => { rowOffsets.current[item.id] = e.nativeEvent.layout.y; }}
              >
                <ReceiptItemRow
                  item={item}
                  onChange={updateItem}
                  onDelete={deleteItem}
                  onFocus={() => handleRowFocus(item.id)}
                />
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+ Add Missing Item</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }, items.length === 0 && styles.fabDisabled]}
        onPress={() => navigation.navigate('AssignItems', { imageUri, items, people })}
        disabled={items.length === 0}
      >
        <Text style={styles.fabText}>Assign Items →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 110 },
  thumb: { width: '100%', height: 140, borderRadius: 10, marginBottom: 12 },
  tipBox: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#009688',
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#00695C', marginBottom: 4 },
  tipText: { fontSize: 12, color: '#004D40', lineHeight: 18 },
  tipBold: { fontWeight: '700' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009688',
    marginBottom: 6,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyNote: { fontSize: 13, color: '#aaa', marginBottom: 10 },
  addBtn: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#009688',
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { color: '#009688', fontWeight: '600', fontSize: 15 },
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
  fabDisabled: { backgroundColor: '#b2dfdb' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
