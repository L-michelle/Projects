import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Assignment, ReceiptItem, Person } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_HEIGHT = 200;

type Props = NativeStackScreenProps<RootStackParamList, 'AssignItems'>;

type ActiveDrag = { item: ReceiptItem; fromPersonId: string | null } | null;

export default function AssignItemsScreen({ navigation, route }: Props) {
  const { imageUri, items, people } = route.params;
  const menuItems = items.filter((i) => !i.isTaxOrFee && !i.isGrandTotal);

  const [assignments, setAssignments] = useState<Assignment[]>(
    menuItems.map((item) => ({ itemId: item.id, personIds: [] }))
  );
  const [overPersonId, setOverPersonId] = useState<string | null>(null);

  // Use refs for drag state so panResponder callbacks always see current values
  const activeDragRef = useRef<ActiveDrag>(null);
  const [activeDrag, setActiveDragState] = useState<ActiveDrag>(null);
  function setActiveDrag(val: ActiveDrag) {
    activeDragRef.current = val;
    setActiveDragState(val);
  }

  const dragX = useRef(new Animated.Value(-999)).current;
  const dragY = useRef(new Animated.Value(-999)).current;

  // Column layout measurements (absolute screen coordinates)
  const columnLayouts = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const columnRefs = useRef<Record<string, View | null>>({});

  const measureColumns = useCallback(() => {
    people.forEach((person) => {
      const ref = columnRefs.current[person.id];
      if (ref) {
        (ref as any).measureInWindow(
          (x: number, y: number, w: number, h: number) => {
            columnLayouts.current[person.id] = { x, y, w, h };
          }
        );
      }
    });
  }, [people]);

  useEffect(() => {
    const t = setTimeout(measureColumns, 400);
    return () => clearTimeout(t);
  }, [measureColumns]);

  function getPersonAtPoint(px: number, py: number): string | null {
    for (const [personId, layout] of Object.entries(columnLayouts.current)) {
      if (
        px >= layout.x && px <= layout.x + layout.w &&
        py >= layout.y && py <= layout.y + layout.h
      ) {
        return personId;
      }
    }
    return null;
  }

  function assignTo(itemId: string, personId: string, fromPersonId: string | null) {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.itemId !== itemId) return a;
        let ids = fromPersonId
          ? a.personIds.filter((id) => id !== fromPersonId)
          : [...a.personIds];
        if (!ids.includes(personId)) ids = [...ids, personId];
        return { ...a, personIds: ids };
      })
    );
  }

  function unassign(itemId: string, personId: string) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.itemId === itemId
          ? { ...a, personIds: a.personIds.filter((id) => id !== personId) }
          : a
      )
    );
  }

  // Single pan responder factory — called per draggable item
  function makePan(item: ReceiptItem, fromPersonId: string | null) {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
      onPanResponderGrant: (evt) => {
        measureColumns();
        const { pageX, pageY } = evt.nativeEvent;
        dragX.setValue(pageX - 55);
        dragY.setValue(pageY - 22);
        setActiveDrag({ item, fromPersonId });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        dragX.setValue(pageX - 55);
        dragY.setValue(pageY - 22);
        setOverPersonId(getPersonAtPoint(pageX, pageY));
      },
      onPanResponderRelease: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const personId = getPersonAtPoint(pageX, pageY);
        const drag = activeDragRef.current;
        if (personId && drag) {
          assignTo(drag.item.id, personId, drag.fromPersonId);
        }
        dragX.setValue(-999);
        dragY.setValue(-999);
        setActiveDrag(null);
        setOverPersonId(null);
      },
      onPanResponderTerminate: () => {
        dragX.setValue(-999);
        dragY.setValue(-999);
        setActiveDrag(null);
        setOverPersonId(null);
      },
    });
  }

  const columnWidth = Math.floor(SCREEN_WIDTH / people.length);

  function getItemsForPerson(personId: string): ReceiptItem[] {
    return menuItems.filter((item) =>
      assignments.find((a) => a.itemId === item.id)?.personIds.includes(personId)
    );
  }

  function getUnassigned(): ReceiptItem[] {
    return menuItems.filter((item) => {
      const a = assignments.find((x) => x.itemId === item.id);
      return !a || a.personIds.length === 0;
    });
  }

  const unassigned = getUnassigned();
  const allAssigned = unassigned.length === 0;

  return (
    <View style={styles.container}>
      {/* Person columns */}
      <View style={styles.columnsWrapper}>
        {people.map((person: Person) => {
          const personItems = getItemsForPerson(person.id);
          const isOver = overPersonId === person.id;
          return (
            <View
              key={person.id}
              ref={(r) => { columnRefs.current[person.id] = r; }}
              style={[styles.column, { width: columnWidth }, isOver && styles.columnOver]}
            >
              <View style={[styles.columnHeader, isOver && styles.columnHeaderOver]}>
                <Text style={styles.columnName} numberOfLines={1}>{person.name}</Text>
                <Text style={styles.columnCount}>{personItems.length} item{personItems.length !== 1 ? 's' : ''}</Text>
              </View>
              <ScrollView
                style={styles.columnBody}
                contentContainerStyle={styles.columnBodyContent}
                showsVerticalScrollIndicator={false}
              >
                {personItems.map((item) => {
                  const shareCount = assignments.find((a) => a.itemId === item.id)?.personIds.length ?? 1;
                  const pan = makePan(item, person.id);
                  return (
                    <View key={item.id} style={styles.assignedItem} {...pan.panHandlers}>
                      <Text style={styles.assignedItemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.assignedItemPrice}>
                        ${(item.price / shareCount).toFixed(2)}
                        {shareCount > 1 ? `\n÷${shareCount}` : ''}
                      </Text>
                      <TouchableOpacity
                        onPress={() => unassign(item.id, person.id)}
                        style={styles.removeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.removeX}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {personItems.length === 0 && (
                  <View style={[styles.dropZone, isOver && styles.dropZoneOver]}>
                    <Text style={styles.dropZoneText}>
                      {isOver ? '⬇ Drop here' : 'drag items\nhere'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </View>

      {/* Unassigned items pool */}
      <View style={styles.poolSection}>
        <Text style={styles.poolLabel}>
          {allAssigned ? '✓ All items assigned' : `DRAG ITEMS TO A PERSON ABOVE  •  ${unassigned.length} remaining`}
        </Text>
        <ScrollView
          contentContainerStyle={styles.poolWrap}
          scrollEnabled={activeDrag === null}
          showsVerticalScrollIndicator={false}
        >
          {unassigned.map((item) => {
            const pan = makePan(item, null);
            const isDragging = activeDrag?.item.id === item.id;
            return (
              <View
                key={item.id}
                {...pan.panHandlers}
                style={[styles.poolChip, isDragging && styles.poolChipDragging]}
              >
                <Text style={styles.poolChipName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.poolChipPrice}>${item.price.toFixed(2)}</Text>
              </View>
            );
          })}
          {allAssigned && (
            <Text style={styles.allDoneText}>
              Drag any item back here to remove it from someone
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Ghost card — floats under finger while dragging */}
      {activeDrag && (
        <Animated.View
          pointerEvents="none"
          style={[styles.ghost, { left: dragX, top: dragY }]}
        >
          <Text style={styles.ghostName} numberOfLines={1}>{activeDrag.item.name}</Text>
          <Text style={styles.ghostPrice}>${activeDrag.item.price.toFixed(2)}</Text>
        </Animated.View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() =>
            navigation.navigate('Tip', {
              summary: { imageUri, items, people, assignments },
            })
          }
        >
          <Text style={styles.continueBtnText}>See Bill Summary →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },

  // Columns
  columnsWrapper: {
    flexDirection: 'row',
    height: COLUMN_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  column: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#fff',
  },
  columnOver: { backgroundColor: '#E8F5E9' },
  columnHeader: {
    backgroundColor: '#009688',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  columnHeaderOver: { backgroundColor: '#00796B' },
  columnName: { color: '#fff', fontWeight: '700', fontSize: 13 },
  columnCount: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 1 },
  columnBody: { flex: 1 },
  columnBodyContent: { padding: 6, gap: 4 },
  assignedItem: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  assignedItemName: { flex: 1, fontSize: 11, color: '#2E7D32', fontWeight: '500' },
  assignedItemPrice: { fontSize: 10, color: '#388E3C', fontWeight: '700', textAlign: 'right', marginHorizontal: 4 },
  removeBtn: { padding: 2 },
  removeX: { color: '#e53935', fontSize: 11, fontWeight: '700' },
  dropZone: {
    flex: 1,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    margin: 6,
  },
  dropZoneOver: { borderColor: '#009688', backgroundColor: '#E8F5E9' },
  dropZoneText: { color: '#aaa', fontSize: 11, textAlign: 'center', lineHeight: 16 },

  // Pool
  poolSection: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  poolLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#009688',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  poolWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  poolChip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#009688',
    alignItems: 'center',
    minWidth: 80,
    maxWidth: (SCREEN_WIDTH - 40) / 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  poolChipDragging: { opacity: 0.3 },
  poolChipName: { fontSize: 12, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 2 },
  poolChipPrice: { fontSize: 12, color: '#009688', fontWeight: '700' },
  allDoneText: { color: '#aaa', fontSize: 12, textAlign: 'center', width: '100%', marginTop: 8 },

  // Ghost
  ghost: {
    position: 'absolute',
    backgroundColor: '#009688',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    zIndex: 999,
    minWidth: 110,
    alignItems: 'center',
  },
  ghostName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ghostPrice: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  // Footer
  footer: { padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  continueBtn: { backgroundColor: '#009688', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
